const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const { addAlert } = require('./alertService');
const { monitorPrices } = require('./monitorService');
const { getCachedPrices } = require('./cacheService');

const app = express();
const server = http.createServer(app);

// Initializing socket.io with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8800",  // Allow requests from the frontend
    methods: ["GET", "POST"]  // Allow GET and POST methods
  }
});

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());  

// Route to get the current prices of cryptocurrencies
app.get('/api/prices', async (req, res) => {
  const cacheKey = 'cryptoPrices';
  let prices = getCachedPrices(cacheKey);  // Retrieve cached prices
  
  if (!prices) {  // If prices are not cached, fetch and cache them
    await monitorPrices();
    prices = getCachedPrices(cacheKey);
  }
  
  res.json(prices);  // Send the prices as a JSON response
});

// Route to set a price alert
app.post('/api/set-alert', async (req, res) => {
  try {
    const { email, cryptoId, targetPrice } = req.body;  // Extract alert data from the request body
    await addAlert(email, cryptoId, targetPrice);  // Add the alert using the alert service
    res.send('Alert set successfully');  // Respond with success message
  } catch (error) {
    console.error('Error setting alert:', error);
    res.status(500).send('Error setting alert: ' + error.message);  
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  const initialPrices = getCachedPrices('cryptoPrices');  // Get initial prices from cache
  if (initialPrices) {
    socket.emit('priceUpdate', initialPrices);  // Send initial prices to the client
  }

  socket.on('disconnect', () => {
    console.log('Client disconnected');  // Log when a client disconnects
  });
});

// Periodically fetch and cache crypto prices every minute
setInterval(async () => {
  await monitorPrices();  // Fetch and cache the latest prices
  const prices = getCachedPrices('cryptoPrices');  // Retrieve the updated prices from cache
  io.emit('priceUpdate', prices);  // Broadcast the updated prices to all connected clients
}, 60 * 1000);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  monitorPrices();  // Initial fetch of prices when the server starts
});
