const axios = require('axios');

const getTopCryptoIds = async (limit = 20) => {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: limit,
      page: 1,
    },
  });
  return response.data.map(crypto => crypto.id);
};

const getCryptoPrices = async (cryptoIds) => {
  const ids = cryptoIds.join(',');
  const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
  return response.data;
};

module.exports = { getTopCryptoIds, getCryptoPrices };
