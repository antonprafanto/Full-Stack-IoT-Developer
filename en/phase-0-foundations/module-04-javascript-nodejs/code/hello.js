// Module 4 - Practice 3: your first JavaScript program in Node.js
// Run it from the VS Code terminal (module-04 folder):  node hello.js

const name = "Ani"; // text: write your name between the two quotation marks
const age = 17; // number: your age in years

console.log("Hello, Node.js!");
console.log("My name is " + name + ".");
console.log(`I'm ${age} years old, or about ${age * 365} days.`);
console.log("Now:", new Date().toLocaleString("en-US"));
