// manage-users.ts - creating and managing accounts from the terminal (Module 20). There is deliberately NO API route for
// signing up: accounts can only be made by someone who holds the server laptop and its .env file.
// Run from the backend folder:
//   npm run users -- add <email> "<name>" <admin|viewer>     the password is asked for and isn't shown on the screen
//   npm run users -- password <email>                        change the password; all sessions of that account are revoked
//   npm run users -- role <email> <admin|viewer>
//   npm run users -- delete <email>
//   npm run users -- list
// The password is NEVER written as an argument: arguments stay in the terminal history and show up in the process list.
import { z } from "zod";
import { pool } from "./pool.ts";
import { Password, makeFingerprint } from "../auth/password.ts";
import { findForLogin, changeRole, changePassword, deleteUser, allUsers, addUser } from "./users.ts";
import type { Role } from "./users.ts";

const Email = z.email("invalid email").max(254);
const ValidRole = z.enum(["admin", "viewer"], "the role must be admin or viewer");

// Ask for a password without showing it: the terminal is switched to "raw" mode so that every key reaches the program
// without being shown, and the program only writes * for every character.
function askHidden(label: string): Promise<string> {
  const input = process.stdin;
  if (!input.isTTY) { // for example a Git Bash window (mintty): typing can't be hidden there, so don't ask
    throw new Error("this terminal can't hide the password as you type; run this command in the VS Code terminal "
      + "(PowerShell) or the macOS Terminal");
  }
  process.stdout.write(label);
  input.setRawMode(true);
  input.setEncoding("utf8");
  input.resume();
  return new Promise((done) => {
    let content: string[] = [];
    const listen = (data: string) => {
      if (data.startsWith("\u001b")) return; // arrow keys and the like: ignore
      for (const letter of data) {
        if (letter === "\r" || letter === "\n") { // Enter
          input.off("data", listen);
          input.setRawMode(false);
          input.pause();
          process.stdout.write("\n");
          return done(content.join(""));
        }
        if (letter === "\u0003") { // Ctrl + C
          process.stdout.write("\n");
          process.exit(130);
        }
        if (letter === "\u007f" || letter === "\b") { // Backspace (macOS/Linux send \u007f, Windows \b)
          if (content.length > 0) {
            content = content.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (letter < " ") continue; // other control keys (Tab and so on)
        content.push(letter);
        process.stdout.write("*");
      }
    };
    input.on("data", listen);
  });
}

async function askNewPassword(): Promise<string> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const password = await askHidden("New password: ");
    const check = Password.safeParse(password);
    if (!check.success) {
      console.log(check.error.issues[0].message);
      continue;
    }
    if (await askHidden("Type it again: ") !== password) {
      console.log("the two passwords aren't the same, try again");
      continue;
    }
    return password;
  }
  throw new Error("no password was set after 3 attempts");
}

function check<T>(schema: z.ZodType<T>, value: string | undefined): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`${value ?? "(empty)"}: ${result.error.issues[0].message}`);
  return result.data;
}

const USAGE = `Usage (from the backend folder):
  npm run users -- add <email> "<name>" <admin|viewer>
  npm run users -- password <email>
  npm run users -- role <email> <admin|viewer>
  npm run users -- delete <email>
  npm run users -- list`;

const [command, ...args] = process.argv.slice(2);
try {
  if (command === "add" && args.length === 3) {
    const email = check(Email, args[0]).toLowerCase(); // Budi@Home.test and budi@home.test = the same account
    const role: Role = check(ValidRole, args[2]);
    if (await findForLogin(email) !== undefined) throw Object.assign(new Error("already registered"), { code: "23505" });
    const password = await askNewPassword(); // the email is checked first, so that typing the password isn't wasted
    const account = await addUser(email, args[1], role, await makeFingerprint(password));
    console.log(`account ${account.id} created: ${account.email} (${account.name}, ${account.role})`);
  } else if (command === "password" && args.length === 1) {
    const email = check(Email, args[0]).toLowerCase();
    if (await findForLogin(email) === undefined) throw new Error(`${email} isn't registered`);
    const account = await changePassword(email, await makeFingerprint(await askNewPassword()));
    console.log(`password of ${account?.email} changed; all its sessions revoked (must log in again)`);
  } else if (command === "role" && args.length === 2) {
    const email = check(Email, args[0]).toLowerCase();
    const account = await changeRole(email, check(ValidRole, args[1]));
    console.log(account ? `${account.email} is now ${account.role} (takes effect within 15 minutes, when its wristband is renewed)`
      : `${email} isn't registered`);
  } else if (command === "delete" && args.length === 1) {
    const email = check(Email, args[0]).toLowerCase();
    console.log(await deleteUser(email) ? `${email} deleted together with all its sessions` : `${email} isn't registered`);
  } else if (command === "list") {
    console.table(await allUsers()); // the password fingerprints aren't shown
  } else {
    console.log(USAGE);
    process.exitCode = 1;
  }
} catch (error) {
  const code = (error as { code?: string }).code;
  if (code === "23505") console.error("that email is already registered; to change its password: npm run users -- password <email>");
  else console.error(`failed: ${(error as Error).message}`);
  process.exitCode = 1;
}
await pool.end(); // close the pool so that the program ends
