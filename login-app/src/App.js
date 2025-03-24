import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import LoginPage from './pages/auth/LoginPage';
import InventoryPage from './pages/inventory/InventoryPage';
import MainQuotationPage from './pages/quotation/MainQuotationPage';
import QuotationDetailsPage from './pages/quotation/QuotationDetailsPage';
import NewQuotationPage from './pages/quotation/NewQuotationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/quotations" element={<MainQuotationPage />} />
        <Route path="/new-quotation" element={<NewQuotationPage />} />
        <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
