// weather.js — fetches the current weather from the internet through the free Open-Meteo API
// Module 4 - Practice 8. Run:  node weather.js   (needs an internet connection)
// Weather data: Open-Meteo.com, license CC BY 4.0 — https://open-meteo.com/

const LATITUDE = -6.2; // Jakarta. Replace it with your location (how to: see Practice 8)
const LONGITUDE = 106.85;

const address =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
  "&current=temperature_2m,relative_humidity_2m,weather_code" +
  "&timezone=auto";

// The WMO weather codes that show up most often in Indonesia
const CONDITIONS = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "fog",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "moderate rain",
  65: "heavy rain",
  80: "light showers",
  81: "showers",
  82: "heavy showers",
  95: "thunderstorm",
};

console.log("Fetching weather data...");
const reply = await fetch(address); // send the request, wait for the reply
if (!reply.ok) {
  console.log("The server rejected the request. Status code:", reply.status);
  process.exit(1);
}
const data = await reply.json(); // the reply's content (JSON text) -> object
const current = data.current;

console.log(`Time       : ${current.time} (${data.timezone})`);
console.log(`Temperature: ${current.temperature_2m} °C`);
console.log(`Humidity   : ${current.relative_humidity_2m} %`);
console.log(`Conditions : ${CONDITIONS[current.weather_code] || "weather code " + current.weather_code}`);
console.log("Data source: Open-Meteo.com (CC BY 4.0)");
