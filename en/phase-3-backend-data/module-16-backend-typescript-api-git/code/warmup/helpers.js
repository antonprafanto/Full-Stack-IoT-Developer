// helpers.js - small functions used by warmup.js
export function average(numbers) {
  const sum = numbers.reduce((total, x) => total + x, 0);
  return sum / numbers.length;
}
