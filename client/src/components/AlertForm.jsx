import React, { useState } from 'react';
import axios from 'axios';
import './AlertForm.css';  

const AlertForm = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [cryptoId, setCryptoId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8800/api/set-alert', {
        email,
        cryptoId,
        targetPrice: parseFloat(targetPrice),
      });
      toggleForm(); 
    } catch (error) {
      console.error('Error setting alert:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Cryptocurrency ID:</label>
        <input type="text" value={cryptoId} onChange={(e) => setCryptoId(e.target.value)} required />
      </div>
      <div>
        <label>Target Price:</label>
        <input type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} required />
      </div>
      <button type="submit">Set Alert</button>
    </form>
  );
};

export default AlertForm;
