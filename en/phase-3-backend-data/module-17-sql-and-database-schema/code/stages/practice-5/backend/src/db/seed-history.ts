// seed-history.ts - fills the database with a fake 7-day history for SQL practice (Module 17 Practice 4).
// Two practice devices, one reading every 10 minutes, from 00:00 WIB seven days ago until now.
// The numbers come from formulas + "dice" with a fixed seed, so every full day's average is the same on any laptop.
// Run from the backend folder: npm run seed-history (safe to repeat: readings that already exist are skipped)
import { pool } from "./pool.ts";

const STEP_MS = 10 * 60 * 1000; // one reading every 10 minutes
const DAY_MS = 24 * 60 * 60 * 1000;
const WIB_MS = 7 * 60 * 60 * 1000; // WIB = UTC + 7 hours
const WEATHER = [0.2, -0.4, 0.5, 1.1, 0.7, -0.2, 0.3, 0.0]; // degrees warmer/cooler per day, from day 0 (seven days ago)

const DEVICES = [
  { device_id: "f00d00000001", name: "Practice living room", location: "living room", lat: -6.2, lng: 106.8, warmth: 0, dryness: 1.0 },
  { device_id: "f00d00000002", name: "Practice porch", location: "porch", lat: -6.2, lng: 106.8, warmth: 1.5, dryness: 1.4 },
];

// seeded "dice" (mulberry32): the same seed always gives the same sequence of random numbers
function dice(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const oneDecimal = (x: number) => Math.round(x * 10) / 10;

// the start of today in WIB, in UTC milliseconds
const now = Date.now();
const startOfToday = Math.floor((now + WIB_MS) / DAY_MS) * DAY_MS - WIB_MS;
const start = startOfToday - 7 * DAY_MS;

for (const [index, p] of DEVICES.entries()) {
  await pool.query(
    `INSERT INTO devices (device_id, kind, name, location, lat, lng) VALUES ($1, 'node1', $2, $3, $4, $5)
     ON CONFLICT (device_id) DO UPDATE SET name = $2, location = $3, lat = $4, lng = $5`,
    [p.device_id, p.name, p.location, p.lat, p.lng],
  );
  const columns = { ts: [] as string[], temperature: [] as number[], humidity: [] as number[], light: [] as number[],
    soil: [] as number[], motion: [] as boolean[], water_level: [] as number[] };
  let soil = 62;
  for (let ts = start; ts <= now; ts += STEP_MS) {
    const dayIndex = Math.floor((ts - start) / DAY_MS); // 0 = seven days ago ... 7 = today
    const minute = Math.round(((ts - start) % DAY_MS) / 60000); // minutes since 00:00 WIB
    const roll = dice((index + 1) * 100000 + dayIndex * 1000 + minute / 10); // one seed per device, day, and time of day
    const hour = minute / 60;
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)); // 0 at night, 1 around 12:00
    const temperature = 26 + p.warmth + WEATHER[dayIndex] + 4 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + (roll() - 0.5);
    if (minute === 6 * 60 || minute === 18 * 60) soil = 68; // watered automatically at 06:00 and 18:00 WIB
    else soil -= (0.15 + 0.35 * daylight) * p.dryness * (0.8 + 0.4 * roll()); // drier and drier, especially in the daytime
    columns.ts.push(new Date(ts).toISOString());
    columns.temperature.push(oneDecimal(temperature));
    columns.humidity.push(Math.round(80 - 12 * daylight + 4 * (roll() - 0.5)));
    columns.light.push(Math.round(3400 * daylight + 60 * roll()));
    columns.soil.push(Math.max(0, Math.round(soil)));
    columns.motion.push(roll() < (hour >= 7 && hour < 22 ? 0.3 : 0.03));
    columns.water_level.push(Math.max(5, 90 - Math.round(minute / 30)));
  }
  // batch insert: every column is sent as an array in ONE statement, then unnest unpacks the arrays into rows
  const result = await pool.query(
    `INSERT INTO readings (device_id, ts, fw, temperature, humidity, light, soil, motion, water_level)
     SELECT $1, ts, '1.4.0', temperature, humidity, light, soil, motion, water_level
     FROM unnest($2::timestamptz[], $3::float8[], $4::int[], $5::int[], $6::int[], $7::bool[], $8::int[])
       AS b(ts, temperature, humidity, light, soil, motion, water_level)
     ON CONFLICT (device_id, ts) DO NOTHING`,
    [p.device_id, columns.ts, columns.temperature, columns.humidity, columns.light, columns.soil, columns.motion, columns.water_level],
  );
  console.log(`${p.device_id}: ${columns.ts.length} readings sent, ${result.rowCount} newly stored`);
}
await pool.end();
