import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import PriceList from './components/PriceList';
import AlertForm from './components/AlertForm';
import './App.css'; 

const socket = io('http://localhost:8800');

const App = () => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);  
  const [showForm, setShowForm] = useState(false);  

  useEffect(() => {
    // Function to fetch prices from the API
    const fetchPrices = async () => {
      try {
        const response = await axios.get('http://localhost:8800/api/prices');
        setPrices(response.data);  // Set the fetched prices in state
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setLoading(false);  // Set loading to false after fetching data
      }
    };

    fetchPrices();

    // Listen for real-time price updates from the server
    socket.on('priceUpdate', (updatedPrices) => {
      setPrices(updatedPrices);  // Update the prices in state
    });

    // Cleanup the socket listener on component unmount
    return () => socket.off('priceUpdate');
  }, []);

  // Toggle the visibility of the alert form
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div>
      <h1>Crypto Tracker</h1>
      <button onClick={toggleForm}>Get Alert</button>
      {showForm && <AlertForm toggleForm={toggleForm} />}  
      <PriceList prices={prices} loading={loading} />
    </div>
  );
};

export default App;
