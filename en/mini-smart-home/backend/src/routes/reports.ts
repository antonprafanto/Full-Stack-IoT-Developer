// reports.ts - the /reports routes (Module 25): send the daily CSV report to Telegram NOW, without waiting for its schedule
// (REPORT_SCHEDULE). Its content is exactly the same as the scheduled report; ?day=today sends today's partial report.
// Admins only: the guard (security.ts) refuses viewers for POST before they get here.
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { sendReport } from "../services/reports.ts";
import { contractTime } from "../db/archive.ts";

const ErrorBody = z.object({ message: z.string() });
const ReportQuery = z.object({
  day: z.enum(["yesterday", "today"]).default("yesterday")
    .describe("yesterday = 00:00-24:00 WIB yesterday, the same as the scheduled report (default); today = today from 00:00 WIB until now"),
});

export const reportRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post("/reports/send", {
    schema: {
      tags: ["reports"],
      summary: "Send the daily CSV report to Telegram right now (to test it without waiting for its schedule)",
      querystring: ReportQuery,
      response: {
        200: z.object({
          file: z.string().describe("the file name in Telegram, for example report-2026-10-26.csv"),
          from: z.string().describe("start of the range (UTC): 00:00 WIB = 17:00 UTC the day before"),
          to: z.string().describe("end of the range (UTC), not counted"),
          devices: z.number().describe("number of rows: registered devices whose key isn't revoked"),
          size_bytes: z.number().describe("size of the CSV file, including the 3-byte BOM"),
          caption: z.string().describe("the caption under the file"),
        }).describe("the report was accepted by Telegram"),
        409: ErrorBody.describe("Telegram off: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env is empty"),
        502: ErrorBody.describe("Telegram refused the file or can't be reached (see the backend log)"),
        503: ErrorBody.describe("the database can't be reached right now"),
      },
    },
  }, async (req, reply) => {
    try {
      const result = await sendReport(req.query.day === "today");
      if (result.status === "skipped") return reply.code(409).send({ message: `report not sent: ${result.message}` });
      if (result.status === "failed") return reply.code(502).send({ message: result.message });
      req.log.info(`report ${result.file} sent now at the request of account ${req.user.sub}`);
      const { file, range, devices, size_bytes, caption } = result;
      return { file, from: contractTime(range.from), to: contractTime(range.to), devices, size_bytes, caption };
    } catch (error) {
      req.log.error(`report couldn't be read from the database: ${(error as Error).message}`);
      return reply.code(503).send({ message: "the database can't be reached right now, try again shortly" });
    }
  });
};
