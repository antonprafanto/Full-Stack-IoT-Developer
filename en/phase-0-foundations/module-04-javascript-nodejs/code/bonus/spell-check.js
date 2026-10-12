// @ts-check
// spell-check.js — JSDoc + @ts-check: a "spell checker" for JavaScript in VS Code
// Module 4 - Technical Deep Dive. Open this file in VS Code: the last line gets a red underline.

/**
 * Computes the average of a list of numbers.
 * @param {number[]} list - a list of numbers, e.g. [28.5, 31.2, 27.9]
 * @returns {number} the average
 */
function average(list) {
  let total = 0;
  for (const number of list) {
    total = total + number;
  }
  return total / list.length;
}

console.log(average([28.5, 31.2, 27.9])); // 29.2
console.log(average("28.5")); // wrong: text, not a list of numbers. Node.js still runs it (the result is 7.125)
