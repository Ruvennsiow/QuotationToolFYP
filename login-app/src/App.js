import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InventoryPage from './InventoryPage';
import QuotationPage from './QuotationPage';
import LoginPage from './LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/quotation" element={<QuotationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
