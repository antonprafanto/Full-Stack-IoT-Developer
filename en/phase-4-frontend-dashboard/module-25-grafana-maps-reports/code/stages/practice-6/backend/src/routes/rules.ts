// rules.ts - the /rules routes (Module 19): view, create, and change automation rules without changing code and without
// restarting the server, and run a schedule rule right now to test it. Module 24: delete them too.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { Ack } from "../schemas/contract.ts";
import { Rule, RuleFields } from "../schemas/rules.ts";
import type { StoredRule } from "../schemas/rules.ts";
import { createRule, findRule, replaceRule, deleteRule, allRules } from "../services/automation.ts";
import { nextRun, runSchedule } from "../services/schedule.ts";
import { contractTime } from "../db/archive.ts";

const ErrorBody = z.object({ message: z.string() });
const IdParam = z.object({ id: z.coerce.number().int().min(1).describe("the rule number, for example 1") });
const FullRule = z.object({
  id: z.number().describe("the rule number"),
  ...RuleFields.shape,
  created_at: z.string().describe("when the rule was created (UTC)"),
  updated_at: z.string().describe("when the rule was last changed (UTC)"),
  next_run: z.string().nullable().describe("schedule rules: when it runs again (UTC); otherwise null"),
});

// a stored rule + when its schedule runs again
function withNextRun(a: StoredRule) {
  const next = nextRun(a.id);
  return { ...a, next_run: next === null ? null : contractTime(next) };
}

export const ruleRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get("/rules", {
    schema: {
      tags: ["rules"],
      summary: "Every automation rule the server is using right now",
      response: { 200: z.array(FullRule).describe("the valid rules, by number") },
    },
  }, async () => allRules().map(withNextRun));

  app.post("/rules", {
    schema: {
      tags: ["rules"],
      summary: "Create a new automation rule; it applies right away, without restarting the server",
      body: Rule,
      response: {
        201: FullRule.describe("the rule is stored and used right away"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      return reply.code(201).send(withNextRun(await createRule(req.body)));
    } catch (error) {
      req.log.error(`the new rule couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.put("/rules/:id", {
    schema: {
      tags: ["rules"],
      summary: "Replace the whole content of one rule; it applies right away, without restarting the server",
      params: IdParam,
      body: Rule,
      response: {
        200: FullRule.describe("the rule is stored and used right away"),
        404: ErrorBody.describe("no rule has that number"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      const rule = await replaceRule(req.params.id, req.body);
      if (rule === undefined) return reply.code(404).send({ message: `rule ${req.params.id} doesn't exist` });
      return withNextRun(rule);
    } catch (error) {
      req.log.error(`rule ${req.params.id} couldn't be saved: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  // Module 24: the "D" of CRUD. Deactivating (PUT with "active": false) keeps the rule to use again; deleting throws it
  // away. Its old command and event history stays. Like the other routes that change something, viewer accounts are
  // answered 403 by the guard (security.ts) before they get here.
  app.delete("/rules/:id", {
    schema: {
      tags: ["rules"],
      summary: "Delete one rule; it stops applying right away. Its command and event history stays",
      params: IdParam,
      response: {
        200: z.object({ id: z.number(), name: z.string(), message: z.string() }).describe("the rule is deleted"),
        404: ErrorBody.describe("no rule has that number"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      const result = await deleteRule(req.params.id);
      if (result === undefined) return reply.code(404).send({ message: `rule ${req.params.id} doesn't exist` });
      return { ...result, message: `rule ${result.id} (${result.name}) deleted` };
    } catch (error) {
      req.log.error(`rule ${req.params.id} couldn't be deleted: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });

  app.post("/rules/:id/run", {
    schema: {
      tags: ["rules"],
      summary: "Run the action of one schedule rule right now (to test it, without waiting for its time)",
      params: IdParam,
      response: {
        200: z.object({ id: z.string(), wait_ms: z.number(), ack: Ack }).describe("the device answered with an ack"),
        404: ErrorBody.describe("no rule has that number"),
        409: ErrorBody.describe("not a schedule rule, the rule isn't active, or its command can't be sent"),
        503: ErrorBody.describe("the backend is not connected to the broker"),
        504: ErrorBody.describe("no ack within 5 seconds"),
      },
    },
  }, async (req, reply) => {
    const rule = findRule(req.params.id);
    if (rule === undefined) return reply.code(404).send({ message: `rule ${req.params.id} doesn't exist` });
    if (rule.condition.kind !== "schedule") return reply.code(409).send({ message: `rule ${rule.id} is not a schedule rule` });
    if (!rule.active) return reply.code(409).send({ message: `rule ${rule.id} is not active` });
    const result = await runSchedule(rule);
    if (result.status === "not-sent") return reply.code(result.code === 404 ? 409 : result.code).send({ message: result.message });
    if (result.status === "no-ack") return reply.code(504).send({ message: `no ack for ${result.id} within 5 seconds` });
    return { id: result.id, wait_ms: result.wait_ms, ack: result.ack };
  });
};
