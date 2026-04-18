import { useEffect } from 'react';
import { DEFAULT_HTML_TEMPLATE } from '../constants'; // Assumes you have this file as we created earlier

export default function PrintBill({ bill, profile }) {
  
  useEffect(() => {
    if (bill && profile) {
      const originalTitle = document.title;
      const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
      document.title = `${bill.isEstimate ? 'Estimate' : 'Bill'}_${bill.billNo}_${formattedDate}`;
      return () => { document.title = originalTitle; };
    }
  }, [bill, profile]);

  if (!bill || !profile) return null;

  // 1. Generate Items Table HTML
  let itemsTableHtml = bill.items.map(item => {
    let details = `<strong>${item.name}</strong>`;
    
    // Add Variant Details
    if (item.category === 'Mobile') {
      details += `<br><span style="font-size: 11px; color: #555;">${item.ram || ''}/${item.rom || ''} &bull; ${item.color || ''}</span>`;
    }
    
    // Add IMEI strictly
    if (item.soldImei) {
      details += `<br><span style="font-size: 11px; font-family: monospace; font-weight: bold; background: #f0f0f0; padding: 2px 4px; border: 1px solid #ccc; border-radius: 3px;">IMEI: ${item.soldImei}</span>`;
    }
    
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px;">${details}</td>
        <td style="padding: 10px; text-align: center; font-weight: bold;">${item.qty} <span style="font-size:10px;font-weight:normal;color:#666;">${item.unit || 'Pcs'}</span></td>
        <td style="padding: 10px; text-align: right;">${profile.currency || '₹'}${Number(item.price || 0).toFixed(2)}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">${profile.currency || '₹'}${(Number(item.qty || 1) * Number(item.price || 0)).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  // 2. Generate Tax Rows HTML
  let taxRowsHtml = '';
  if (!bill.isEstimate && (bill.gstAmt || 0) > 0) {
    const halfGst = ((bill.gstPercent || 0) / 2).toFixed(1);
    taxRowsHtml = `
      <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #555;"><span>CGST (${halfGst}%)</span> <b>+${profile.currency || '₹'}${Number(bill.cgstAmt || 0).toFixed(2)}</b></div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #555;"><span>SGST (${halfGst}%)</span> <b>+${profile.currency || '₹'}${Number(bill.sgstAmt || 0).toFixed(2)}</b></div>
    `;
  }

  // 3. Generate Finance Section HTML
  let financeHtml = '';
  if (bill.paymentMode === 'Finance' && bill.financeDetails) {
    financeHtml = `
      <div style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background-color: #fcfcfc; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px;">Finance / EMI Details</h4>
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td><b>Provider:</b> ${bill.financeDetails.provider || 'Unknown'}</td>
            <td><b>Down Payment:</b> ${profile.currency || '₹'}${Number(bill.financeDetails.downPayment || 0)}</td>
            <td><b>Tenure:</b> ${bill.financeDetails.emiMonths || 0} Months</td>
            <td><b>Monthly EMI:</b> ${profile.currency || '₹'}${Number(bill.financeDetails.emiAmount || 0)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  // 4. CHOOSE TEMPLATE: Use Custom HTML if it exists and is not empty, else use Default
  let htmlString = (profile.customHtmlTemplate && profile.customHtmlTemplate.trim() !== '') 
    ? profile.customHtmlTemplate 
    : DEFAULT_HTML_TEMPLATE;

  // 5. REPLACE PLACEHOLDERS DYNAMICALLY
  htmlString = htmlString
    .replace(/{{shopName}}/g, profile.shopName || '')
    .replace(/{{shopAddress}}/g, profile.address || '')
    .replace(/{{shopPhone}}/g, profile.phone || '')
    .replace(/{{shopGstin}}/g, profile.gstin || '')
    .replace(/{{logoUrl}}/g, profile.logoUrl || '')
    
    .replace(/{{customerName}}/g, bill.customerName || 'Cash Customer')
    .replace(/{{customerPhone}}/g, bill.customerPhone || '')
    .replace(/{{customerAddress}}/g, bill.customerAddress || '')
    
    .replace(/{{invoiceType}}/g, bill.isEstimate ? 'ESTIMATE' : 'TAX INVOICE')
    .replace(/{{billNo}}/g, bill.billNo || '')
    .replace(/{{date}}/g, new Date(bill.createdAt).toLocaleDateString('en-GB'))
    
    .replace(/{{itemsTable}}/g, itemsTableHtml)
    .replace(/{{taxRows}}/g, taxRowsHtml)
    .replace(/{{financeSection}}/g, financeHtml)
    
    .replace(/{{subtotal}}/g, Number(bill.subtotal || 0).toFixed(2))
    .replace(/{{discount}}/g, Number(bill.discount || 0).toFixed(2))
    .replace(/{{total}}/g, Number(bill.total || 0).toFixed(2))
    .replace(/{{currency}}/g, profile.currency || '₹')
    .replace(/{{paymentMode}}/g, bill.paymentMode || 'Cash')
    
    .replace(/{{thanksMessage}}/g, profile.thanksMessage || '')
    .replace(/{{footerNote}}/g, bill.isEstimate ? 'This is an estimate/quotation, not a tax invoice.' : (profile.footerNote || ''));

  return (
    <div className="print:block w-full max-w-4xl mx-auto bg-white text-black print:p-0 p-4">
      {/* HTML Parsed from String */}
      <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    </div>
  );
}