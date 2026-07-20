const PDFDocument = require('pdfkit');

/**
 * Generate PDF Invoice and pipe directly to Express response
 */
const pipeInvoiceToResponse = (transaction, vendor, pkg, res) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      // Set headers to force PDF view/download in browser
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Invoice-${transaction.gatewayOrderId}.pdf"`);

      // Pipe directly to response
      doc.pipe(res);

      generateHeader(doc);
      generateCustomerInformation(doc, transaction, vendor);
      generateInvoiceTable(doc, transaction, pkg);
      generateFooter(doc);

      doc.end();

      doc.on('end', () => {
        resolve();
      });

    } catch (err) {
      console.error('PDF Generation pipeline error:', err);
      if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Failed to generate PDF' });
      }
      reject(err);
    }
  });
};

function generateHeader(doc) {
  doc
    .fillColor('#164e33')
    .fontSize(24)
    .text('INDIA B2B CONNECT', 50, 50)
    .fontSize(10)
    .fillColor('#444444')
    .text('123 B2B Hub, Tech Park', 50, 80)
    .text('New Delhi, India, 110001', 50, 95)
    .text('Phone: +91-9876543210', 50, 110)
    .text('Email: billing@indiab2bconnect.com', 50, 125)
    .moveDown();
}

function generateCustomerInformation(doc, transaction, vendor) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('TAX INVOICE', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('Invoice Number:', 50, customerInformationTop)
    .font('Helvetica')
    .text(`INV-${transaction.gatewayOrderId}`, 150, customerInformationTop)
    
    .font('Helvetica-Bold')
    .text('Date of Issue:', 50, customerInformationTop + 15)
    .font('Helvetica')
    .text(formatDate(new Date(transaction.createdAt || new Date())), 150, customerInformationTop + 15)
    
    .font('Helvetica-Bold')
    .text('Valid Until:', 50, customerInformationTop + 30)
    .font('Helvetica')
    .text(transaction.expiryAt ? formatDate(new Date(transaction.expiryAt)) : 'N/A', 150, customerInformationTop + 30)
    
    .font('Helvetica-Bold')
    .text('Billed To:', 300, customerInformationTop)
    .font('Helvetica')
    .text(vendor.businessName || 'N/A', 300, customerInformationTop + 15)
    .text(vendor.address || 'Address not provided', 300, customerInformationTop + 30)
    .text(vendor.email || 'N/A', 300, customerInformationTop + 45)
    .text(vendor.phone || 'N/A', 300, customerInformationTop + 60)
    .moveDown();

  generateHr(doc, 290);
}

function generateInvoiceTable(doc, transaction, pkg) {
  const invoiceTableTop = 340;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Description',
    'Amount'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  const position = invoiceTableTop + 35;
  const planName = pkg.name ? pkg.name.toUpperCase() : 'Premium';
  generateTableRow(
    doc,
    position,
    `${planName} Plan Subscription`,
    `INR ${transaction.amount.toFixed(2)}`
  );

  generateHr(doc, position + 25);

  const subtotalPosition = position + 35;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    subtotalPosition,
    'Total Paid',
    `INR ${transaction.amount.toFixed(2)}`
  );
  doc.font('Helvetica');
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .fillColor('#164e33')
    .text(
      'Status: PAID. This is a computer-generated receipt, no signature is required.',
      50,
      700,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  description,
  amount
) {
  doc
    .fontSize(10)
    .text(description, 50, y, { width: 300 })
    .text(amount, 400, y, { width: 150, align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

module.exports = { pipeInvoiceToResponse };
