const fs = require('fs');

function saveQuotationData(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `quotations/quotation_${timestamp}.json`;
  fs.mkdirSync('quotations', { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`Quotation data saved to ${filename}`);
}

module.exports = { saveQuotationData };
