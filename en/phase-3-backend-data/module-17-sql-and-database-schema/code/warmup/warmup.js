// warmup.js - a JavaScript warm-up before Module 17

// 1. Time with Date
const time = new Date("2026-10-20T10:10:00+07:00"); // 10:10 WIB
console.log(time.toISOString()); // the same point in time, written in UTC
const oneHour = 60 * 60 * 1000; // one hour in milliseconds
const anHourAgo = new Date(time.getTime() - oneHour);
console.log(anHourAgo.toISOString());
console.log(time.toISOString().slice(0, 19) + "Z"); // the data contract format, without milliseconds

// 2. ?. and ??
const node1 = { temperature: 28.5, light: 2310 };
const node2 = { temperature: 29.4, pressure: 1008.6 };
console.log(node1.pressure ?? null); // missing -> null
console.log(node2.pressure ?? null);
const empty = null;
console.log(empty?.light ?? null); // empty is null: ?. stops without an error
console.log(0 ?? 99, 0 || 99); // ?? only replaces null and undefined; || replaces 0 too

// 3. Spread: copy every column, then replace one
const row = { ts: time, temperature: 28.5, humidity: 71 };
const forApi = { ...row, ts: row.ts.toISOString().slice(0, 19) + "Z" };
console.log(forApi);
console.log(row.ts instanceof Date); // the original doesn't change

// 4. Waiting, and catching failures
function askDatabase(alive) {
  return new Promise((succeed, fail) => {
    setTimeout(() => {
      if (alive) succeed([{ temperature: 28.5 }]);
      else fail(new Error("connect ECONNREFUSED 127.0.0.1:5432"));
    }, 300);
  });
}
for (const alive of [true, false]) {
  try {
    const result = await askDatabase(alive);
    console.log("success:", result.length, "row(s)");
  } catch (error) {
    console.log("failed:", error.message);
  }
}
console.log("the program keeps running");

// 5. Multi-line template literals
const id = "a4cf12e5b7c0";
const query = `SELECT ts, temperature
FROM readings
WHERE device_id = '${id}'`;
console.log(query);
const sneaky = "x'; DELETE FROM readings; --";
console.log(`WHERE device_id = '${sneaky}'`);
