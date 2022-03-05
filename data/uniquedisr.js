const disruptions = require('./strike-disruptions');

const res = disruptions.reduce((acc, curr) => {
  const trimmedDescription = curr.description.replaceAll(/\r\n/g, '').trim();
  if (acc.includes(trimmedDescription)) {
    return acc;
  }

  return [...acc, trimmedDescription];
}, []);

console.log(res.length);
console.log(res);
