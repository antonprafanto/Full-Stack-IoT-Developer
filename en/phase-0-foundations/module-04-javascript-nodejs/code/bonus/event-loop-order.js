// event-loop-order.js — which one runs first?
// Module 4 - Technical Deep Dive. Run:  node event-loop-order.js

console.log("1. Order A is noted");

setTimeout(() => {
  console.log("4. The 0-millisecond timer rings");
}, 0);

Promise.resolve().then(() => {
  console.log("3. The kept promise is handled");
});

console.log("2. Order B is noted");
