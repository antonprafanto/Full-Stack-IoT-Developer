// map.ts - the device map settings (Module 25) in ONE constant: the tile address, the attribution text, the zoom limits, and the
// marker colors. The OpenStreetMap tile policy asks that the tile address isn't planted in many places ("Avoid hard-coding the tile
// URL"): if you later move to another tile provider, only this file changes.
export const MAP = {
  // The OFFICIAL OpenStreetMap tile address: https, without "{s}." (the old a./b./c.tile... addresses can be slow or closed).
  // {z} = zoom level, {x} and {y} = the tile square's number. The browser downloads tiles straight from the OpenStreetMap server,
  // so the Map page needs the internet. Downloading tiles in bulk or storing them for offline use is FORBIDDEN by this policy.
  tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  // The attribution MUST show on the map (a condition of the OpenStreetMap data license). Leaflet puts it in the bottom
  // right corner as HTML, so its link can be clicked. Single quotes because the text holds double quotes.
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19, // OpenStreetMap tiles exist up to zoom 19 (one tile a few dozen meters wide)
  closeZoom: 18, // when the map is "fitted" to the device points, zoom 18 at the closest: the house and the nearby streets show
  // The fill color of the marker circles. The map's SVG doesn't know Tailwind classes, so the colors are written as color codes.
  // A color is never alone: the marker popup and the legend under the map write the status in words.
  onlineColor: "#15803d", // green (like Tailwind's green-700): the device is online
  otherColor: "#64748b", // gray (like Tailwind's slate-500): offline, offline mode, unknown, or its messages are ignored
};
