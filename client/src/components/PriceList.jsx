import React from 'react';
import './PriceList.css';  

const PriceList = ({ prices, loading }) => {
  if (loading) {
    return <div className="loading">Loading prices...</div>;  
  }

  return (
    <div className="PriceList">
      <h2>Cryptocurrency Prices</h2>
      <ul>
        {prices && Object.keys(prices).map((cryptoId) => (  
          <li key={cryptoId}>
            {cryptoId.charAt(0).toUpperCase() + cryptoId.slice(1)}: ${prices[cryptoId].usd}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PriceList;
