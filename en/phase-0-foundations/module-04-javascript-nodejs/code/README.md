# Module 4 Code — JavaScript & Node.js

🌐 **English** · [Bahasa Indonesia](../../../../fase-0-fondasi/modul-04-javascript-nodejs/kode/README.md)

This folder contains **all the code from Module 4**. It is almost the same as your own `module-04` folder at the end of the module. The differences: there is no `mini-server.png` screenshot here, and there are extra 🔬 examples in the `bonus/` folder. Every file has been tested with **Node.js 24.21.0** and **npm 11.19.0**.

| File | Used in | What it contains |
| :--- | :--- | :--- |
| [`hello.js`](hello.js) | Practice 3 | Your first program: name, age, and the current time. |
| [`package.json`](package.json) | Practices 4 and 7 | The "project ID card": `"type": "module"` and the list of libraries (dayjs). |
| [`generate-dummy.js`](generate-dummy.js) | Practice 4 | Generates fake sensor readings that follow the data contract (Syllabus Appendix A). |
| [`data/readings.json`](data/readings.json) | Practices 4–5, 7 | Sample output of `generate-dummy.js`: 100 readings. |
| [`statistics.js`](statistics.js) | Practice 5 ⭐ | The lowest, highest, and average temperature of 100 readings. |
| [`wait.js`](wait.js) | Practice 6 ⭐ | Simulates waiting for a sensor with `Promise` and `await`. |
| [`time.js`](time.js) | Practice 7 | Uses the dayjs library from npm. |
| [`package-lock.json`](package-lock.json) | Practice 7 | The "receipt": the exact versions of the installed libraries. |
| [`.gitignore`](.gitignore) | Practice 7 | Tells Git to ignore the `node_modules/` folder. |
| [`weather.js`](weather.js) | Practice 8 | The current weather from the Open-Meteo API (needs internet). |
| [`webhook-receiver.js`](webhook-receiver.js) | Practice 9 ⭐ | A mini server on port 3000 that prints everything it receives. |
| [`send-data.js`](send-data.js) | Practice 9 ⭐ | Sends 3 fake readings to `webhook-receiver.js`. |
| [`bonus/`](bonus/) | 🔬 Technical Deep Dive | `event-loop-order.js`, `without-freezing.js`, and `spell-check.js`. |

## How to run this folder

1. Download or clone this repository, then open this `code` folder in VS Code (**File → Open Folder…**).
2. Open a terminal (**Terminal → New Terminal**) and install the library, just once:

   ```bash
   npm install
   ```

   npm reads `package.json` and `package-lock.json`, then installs dayjs version 1.11.23 into the `node_modules/` folder.
3. Run any file with `node file-name.js`, for example `node statistics.js`. To run a file in the `bonus/` folder, include the folder name, for example `node bonus/event-loop-order.js`. For Practice 9, run `node webhook-receiver.js` in one terminal and `node send-data.js` in a second terminal.

The full steps, with an explanation of every line, are in the [Module 4 README](../README.md).
