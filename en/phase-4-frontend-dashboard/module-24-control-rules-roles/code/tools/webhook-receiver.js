// webhook-receiver.js — a mini server that prints whatever is sent to it
// Module 4 - Practice 9. Used again in Modules 10, 16, and 22.
// Run:  node webhook-receiver.js   (to stop: Ctrl + C)

import http from "node:http";

const PORT = 3000;

const server = http.createServer((request, reply) => {
  let content = "";
  request.on("data", (chunk) => {
    content = content + chunk; // the data arrives piece by piece
  });
  request.on("end", () => {
    const time = new Date().toLocaleTimeString("en-US");
    console.log(`[${time}] ${request.method} ${request.url}`);
    if (content !== "") {
      console.log(content); // print the content exactly as it arrived
    }
    reply.writeHead(200, { "Content-Type": "application/json" });
    reply.end(JSON.stringify({ ok: true })); // reply: "received"
  });
});

server.listen(PORT, () => {
  console.log(`Receiver ready at http://localhost:${PORT} — press Ctrl + C to stop.`);
});
