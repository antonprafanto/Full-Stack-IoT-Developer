// sniffer.js — a tiny "sniffer" to prove it yourself: without TLS, the MQTT username and key travel in the CLEAR. Module 21.
// It stands in the middle: MQTTX -> sniffer (127.0.0.1:1884) -> broker. Everything is forwarded as-is, but the contents of the
// CONNECT packet (the first packet of every connection) are printed, as is the broker's answer (CONNACK). No npm library needed.
// Run:  node sniffer.js 192.168.1.37        (broker on the Pi gateway; the sniffer listens on 127.0.0.1:1884)
//       node sniffer.js 127.0.0.1 1883 1884 (broker address, broker port, sniffer port)
// Then in MQTTX: make a connection to Host 127.0.0.1, Port 1884, fill in Username and Password, click Connect.
// Stop: Ctrl + C

import net from "node:net";

const BROKER = process.argv[2] || "127.0.0.1";
const PORT_BROKER = Number(process.argv[3]) || 1883;
const PORT_SNIFFER = Number(process.argv[4]) || 1884;
const clock = () => new Date().toLocaleTimeString("en-US");
const ANSWERS = { 0: "accepted", 4: "wrong username or key", 5: "not authorized", 134: "Bad User Name or Password", 135: "Not authorized" };

// Read one MQTT string: 2 bytes of length, then its contents.
function readString(b, i) {
  const length = b.readUInt16BE(i);
  return [b.subarray(i + 2, i + 2 + length).toString("utf8"), i + 2 + length];
}

// Read an MQTT "variable length" number (1 to 4 bytes).
function readLength(b, i) {
  let value = 0;
  let mul = 1;
  let byte;
  do {
    byte = b[i++];
    value += (byte & 127) * mul;
    mul *= 128;
  } while (byte & 128);
  return [value, i];
}

// The CONNECT packet: type 1, protocol name "MQTT", version, flags, keep-alive, then the client name, will, username, key.
// Returns true if it's done (printed, or it turns out not to be MQTT), false if the packet isn't complete yet.
function printConnect(b) {
  if (b[0] !== 0x10) return true; // not a CONNECT packet: nothing is printed
  if (b.length < 5) return false;
  let [rest, i] = readLength(b, 1);
  if (b.length < i + rest) return false; // not complete yet: wait for the next chunk
  let protocol;
  [protocol, i] = readString(b, i);
  const version = b[i];
  const flags = b[i + 1];
  i += 4; // version, flags, keep-alive 2 bytes
  if (version === 5) { // MQTT 5: skip the connection properties
    const [propsLength, j] = readLength(b, i);
    i = j + propsLength;
  }
  let clientName;
  [clientName, i] = readString(b, i);
  if (flags & 4) { // has a will: skip it (MQTT 5: its properties too), its topic, and its payload
    if (version === 5) {
      const [propsLength, j] = readLength(b, i);
      i = j + propsLength;
    }
    i = readString(b, i)[1];
    i += 2 + b.readUInt16BE(i);
  }
  const username = flags & 128 ? readString(b, i) : ["(not sent)", i];
  const key = flags & 64 ? readString(b, username[1])[0] : "(not sent)";
  console.log(`  CONNECT ${protocol} version ${version === 5 ? "5.0" : version === 4 ? "3.1.1" : version}`);
  console.log(`  client name   : ${clientName}`);
  console.log(`  username      : ${username[0]}`);
  console.log(`  key (password): ${key}   <- readable in the clear by anyone on this path`);
  return true;
}

net.createServer((client) => {
  console.log(`[${clock()}] new connection from ${client.remoteAddress}:${client.remotePort} -> ${BROKER}:${PORT_BROKER}`);
  const broker = net.connect(PORT_BROKER, BROKER);
  let start = Buffer.alloc(0);
  let connectPrinted = false;
  let connackPrinted = false;
  client.on("data", (chunk) => {
    if (!connectPrinted) {
      start = Buffer.concat([start, chunk]);
      connectPrinted = printConnect(start);
    }
    broker.write(chunk);
  });
  broker.on("data", (chunk) => {
    if (!connackPrinted && chunk[0] === 0x20) {
      connackPrinted = true;
      const code = chunk[3];
      console.log(`  broker answered: CONNACK ${code} (${ANSWERS[code] || "see the code table"})`);
    }
    client.write(chunk);
  });
  client.on("close", () => broker.end());
  broker.on("close", () => client.end());
  client.on("error", () => broker.destroy());
  broker.on("error", (error) => {
    console.log(`  broker ${BROKER}:${PORT_BROKER} can't be reached (${error.code})`);
    client.destroy();
  });
}).listen(PORT_SNIFFER, "127.0.0.1", () => {
  console.log(`Sniffer ready on 127.0.0.1:${PORT_SNIFFER}, forwarding to broker ${BROKER}:${PORT_BROKER}. Ctrl + C to stop.`);
});
