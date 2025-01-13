import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainQuotationPage from './MainQuotationPage';
import NewQuotationPage from './NewQuotationPage';
import QuotationDetailsPage from './QuotationDetailsPage';
import InventoryPage from './InventoryPage';
import LoginPage from './LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/quotations" element={<MainQuotationPage />} />
        <Route path="/new-quotation" element={<NewQuotationPage />} />
        <Route path="/quotation/:id" element={<QuotationDetailsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
