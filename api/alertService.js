const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getCryptoPrices } = require('./cryptoService');
const { getCachedPrices, setCachedPrices } = require('./cacheService');

const addAlert = async (email, cryptoId, targetPrice) => {
  await prisma.alert.create({
    data: {
      email,
      cryptoId,
      targetPrice,
    },
  });

  let prices = getCachedPrices('cryptoPrices');
  
  // Fetch and cache the price if the cryptoId is not already cached
  if (!prices || !prices[cryptoId]) {
    const newPrice = await getCryptoPrices([cryptoId]);
    prices = { ...prices, ...newPrice };
    setCachedPrices('cryptoPrices', prices, 60); // setting 60s expiration time
  }
};

const getAlerts = async () => {
  return prisma.alert.findMany();
};

const checkAlerts = async (prices) => {
  const alerts = await getAlerts();
  const missingPrices = [];

  for (const alert of alerts) {
    const { email, cryptoId, targetPrice } = alert;
    let currentPrice = prices[cryptoId] ? prices[cryptoId].usd : null;

    if (!currentPrice) {
      missingPrices.push(cryptoId);
    } else {
      if ((targetPrice > 0 && currentPrice >= targetPrice) || (targetPrice < 0 && currentPrice <= Math.abs(targetPrice))) {
        await sendEmailAlert(email, cryptoId, currentPrice);
        await prisma.alert.delete({ where: { id: alert.id } });
      }
    }
  }

  if (missingPrices.length > 0) {
    try {
      // Fetching the prices for missing cryptocurrencies
      const missingPricesData = await getCryptoPrices(missingPrices);
      
      for (const alert of alerts) {
        const { email, cryptoId, targetPrice } = alert;
        
        if (missingPrices.includes(cryptoId)) {
          // Checking if price data for the cryptoId exists
          if (missingPricesData[cryptoId]) {
            const currentPrice = missingPricesData[cryptoId].usd;
            
            // Checking if the current price meets the target criteria
            if ((targetPrice > 0 && currentPrice >= targetPrice) || (targetPrice < 0 && currentPrice <= Math.abs(targetPrice))) {
              await sendEmailAlert(email, cryptoId, currentPrice);
              await prisma.alert.delete({ where: { id: alert.id } });
            }
          } else {
            console.error(`Price data for ${cryptoId} not found.`);
          }
        }
      }
  
      // Updating cache with the new prices
      const updatedPrices = { ...prices, ...missingPricesData };
      setCachedPrices('cryptoPrices', updatedPrices, 60);
  
    } catch (error) {
      console.error('Error processing alerts:', error);
    }
  }
  
};

//Sending alert using NodeMailer by mail
const sendEmailAlert = (email, cryptoId, price) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: 'Crypto Price Alert',
    text: `The price of ${cryptoId} has reached ${price} USD.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};


module.exports = { addAlert, checkAlerts };




