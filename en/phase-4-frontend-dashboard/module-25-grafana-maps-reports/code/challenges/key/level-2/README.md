# Module 25 Level 2 answer key: move a device's point through the Map

**Task:** an admin moves a device's point right on the **Map** screen (without Bruno): choose the device, click the new spot on the map, check
the numbers, then save through `PUT /devices/:id/location` (backend 1.2). The form uses react-hook-form + Zod like the rule form of
Module 24. A viewer account doesn't see any button (the backend guard still refuses with 403).

Key files (only the ones changed from frontend 1.1.0; **116 new lines**, comments included):

| File | What it holds |
| :--- | :--- |
| `frontend/src/components/MovePoint.tsx` | **new** (78 lines): the Zod schema `MapPoint` (the same error sentences as the backend's `LocationBody` schema), `PointForm` (react-hook-form + `zodResolver`, latitude/longitude fields `type="number"` + `valueAsNumber`, starting values = the clicked point rounded to 6 digits after the point, the server error in `root.server`), and `MovePoint` (`useMapEvents` → a click on the map → `<Popup position={…}>` holding the form; `key` = the clicked point, so every new click = a new form without an effect) |
| `frontend/src/components/DeviceMap.tsx` | +28/−4: `useAdmin()` + the `moving` state; a **Move point** button in the marker popup (admins only); `<MovePoint>` inside `<MapContainer>` during move mode; the sentence **Click the map at the new spot for …** + a **Done** button; a **Put … on the map** button for a device that has no point yet |
| `frontend/src/api.ts` | +10: `setDeviceLocation(deviceId, lat, lng)` → `PUT /devices/:id/location` |

How to use the key files: copy the three of them into your project's `frontend/src` folder (overwriting the old ones), then `npm run dev`.

## Flow

1. The admin opens **Map**, taps a marker, then **Move point** (a device without a point: the **Put … on the map** button under the map).
2. The sentence **Click the map at the new spot for …** shows up. A click on the map (not on a marker) opens the **Move … here?** box holding
   **Latitude (lat)** and **Longitude (lng)** of that clicked point. The numbers can still be typed again.
3. **Save point**: Zod checks first in the browser (for example latitude `91` → `latitude at most 90`, without a request to the server). Passed →
   `PUT`, then the device list is fetched again (`GET /devices`), the marker moves, the map is fitted again, and the toast **Point of … moved.**
4. **Cancel** or **Done** = leave move mode. ✕ on the box = cancel choosing only that point (click the map again for another point).

**Expected output (the author's lab, 27 Oct 2026 ±19:54–19:55 WIB, real backend 1.2, Chrome 156):**

```text
click the map -> Latitude (lat) -6.175718 | Longitude (lng) 106.826103
lat 91        -> "latitude at most 90" under its field, 0 PUT requests
-6.1751 / 106.8268 -> PUT /devices/f00d00000001/location {"lat":-6.1751,"lng":106.8268} -> 200
              toast "Point of Practice living room moved.", the marker moves, the move-mode sentence disappears
Put Practice porch on the map -> click -> Save point -> 3 markers (2 before), toast "Point of Practice porch moved."
viewer        -> popup without "Move point", without a "Put … on the map" button
```

`npm run lint`: `Found 0 warnings and 0 errors.` (50 files); `npm run build`: passes with the same single 500 kB warning (JS
⟦L2-JS⟧ kB, gzip ⟦L2-GZ⟧ kB); `npm run check-schema`: two `SAME`.

## Notes

- The `MapPoint` schema is written in the frontend (not copied from the backend), because the backend's `LocationBody` lives in `routes/devices.ts`, not in
  the `schemas/` that `check-schema` copies. Its error sentences are made the same on purpose; the backend is still the last checker.
- Choose the new point on an empty spot of the map, not right on top of another marker: a tap on a marker opens that marker's popup.
- Home coordinates = personal data: after trying with a real point, don't share a screenshot of the map without blurring it.
