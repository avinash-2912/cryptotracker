const NodeCache = require('node-cache');
const cache = new NodeCache();

const getCachedPrices = (key) => {
  return cache.get(key);
};

const setCachedPrices = (key, value) => {
  cache.set(key, value, 60); 
};

module.exports = { getCachedPrices, setCachedPrices };
