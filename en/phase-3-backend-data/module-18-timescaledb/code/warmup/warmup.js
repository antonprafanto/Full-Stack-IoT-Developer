// warmup.js - a JavaScript warm-up again before Module 18

// 1. An object as a dictionary
const MINUTE = 60 * 1000; // one minute in milliseconds
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const BUCKETS = {
  "15m": { width: 15 * MINUTE, defaultSpan: DAY },
  "1h": { width: HOUR, defaultSpan: 7 * DAY },
};
const choice = "1h"; // for example from ?bucket=1h
console.log(BUCKETS[choice].width); // 3600000 milliseconds = 1 hour
console.log(BUCKETS[choice].defaultSpan / HOUR); // the default range in hours
console.log(BUCKETS["2h"]); // a key that doesn't exist
console.log("2h" in BUCKETS, Object.keys(BUCKETS));

// 2. Rounding down to the start of a bucket
const time = new Date("2026-10-20T10:37:00+07:00"); // 10:37 WIB
const width = BUCKETS["15m"].width;
const bucketStart = new Date(Math.floor(time.getTime() / width) * width);
console.log(bucketStart.toISOString()); // 10:30 WIB, written in UTC

// 3. How many buckets fit in one range?
const fromTime = new Date("2026-10-13T00:00:00+07:00");
const toTime = new Date("2026-10-20T00:00:00+07:00");
console.log((toTime.getTime() - fromTime.getTime()) / HOUR); // exactly 168 hours
const afternoon = new Date("2026-10-20T14:20:00+07:00");
console.log(Math.ceil((afternoon.getTime() - fromTime.getTime()) / HOUR)); // a last bucket that isn't full still counts

// 4. A WIB day: shift by 7 hours first
const SHIFT = 7 * HOUR; // WIB = UTC + 7 hours
const dawn = new Date("2026-10-20T05:00:00+07:00"); // 05:00 WIB
const utcDay = new Date(Math.floor(dawn.getTime() / DAY) * DAY);
const wibDay = new Date(Math.floor((dawn.getTime() + SHIFT) / DAY) * DAY - SHIFT);
console.log(utcDay.toISOString()); // the start of the UTC day
console.log(wibDay.toISOString()); // the start of the WIB day, written in UTC

// 5. Numbers that arrive as text
const rows = [
  { time: new Date("2026-10-19T03:00:00Z"), avg_temp: "26.31", count: "6" }, // numeric and bigint from pg = text
];
console.log(rows[0].avg_temp + 1); // text + number = text
const tidy = rows.map((r) => ({
  time: r.time.toISOString().slice(0, 19) + "Z",
  avg_temp: Number(r.avg_temp),
  count: Number(r.count),
}));
console.log(tidy);
console.log(tidy[0].avg_temp + 1);
