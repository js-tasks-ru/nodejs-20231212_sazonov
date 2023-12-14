function sum(a, b) {
  [a, b].forEach((item) => {
    if (typeof item !== 'number') {
      throw new TypeError();
    }
  });
  return a + b;
}

module.exports = sum;
