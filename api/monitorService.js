const { getCryptoPrices, getTopCryptoIds } = require('./cryptoService');
const { getCachedPrices, setCachedPrices } = require('./cacheService');
const { checkAlerts } = require('./alertService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const monitorPrices = async () => {
  const cryptoIds = await getTopCryptoIds();
  const cacheKey = 'cryptoPrices';
  let prices = getCachedPrices(cacheKey);

  if (!prices) {
    prices = await getCryptoPrices(cryptoIds);
    setCachedPrices(cacheKey, prices);

    // Save or update prices in the database
    for (const cryptoId in prices) {
      await prisma.price.upsert({
        where: { cryptoId },
        update: { price: prices[cryptoId].usd },
        create: { cryptoId, price: prices[cryptoId].usd },
      });
    }
  }

  console.log('Current Prices:', prices);
  await checkAlerts(prices);
};

module.exports = { monitorPrices };
