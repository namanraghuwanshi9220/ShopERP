export const DEFAULT_HTML_TEMPLATE = `
<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: auto; color: #000;">
  <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px;">
    <!-- <img src="{{logoUrl}}" style="max-height: 80px;" /> -->
    <h1 style="margin: 0; font-size: 28px; text-transform: uppercase;">{{shopName}}</h1>
    <p style="margin: 5px 0 0 0; font-size: 14px;">{{shopAddress}}</p>
    <p style="margin: 5px 0 0 0; font-size: 14px;"><b>Ph:</b> {{shopPhone}} | <b>GSTIN:</b> {{shopGstin}}</p>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div>
      <p style="margin: 0; font-size: 12px; color: #555; text-transform: uppercase;">Billed To:</p>
      <h3 style="margin: 2px 0 0 0;">{{customerName}}</h3>
      <p style="margin: 2px 0 0 0; font-size: 14px;">Ph: {{customerPhone}}</p>
      <p style="margin: 2px 0 0 0; font-size: 14px;">{{customerAddress}}</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; color: #333; text-transform: uppercase;">{{invoiceType}}</h2>
      <p style="margin: 5px 0 0 0; font-size: 16px;"><b>No:</b> {{billNo}}</p>
      <p style="margin: 2px 0 0 0; font-size: 14px;"><b>Date:</b> {{date}}</p>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
      <tr style="background-color: #f3f4f6; text-align: left;">
        <th style="padding: 10px; border-bottom: 2px solid #000;">Item Description</th>
        <th style="padding: 10px; border-bottom: 2px solid #000; text-align: center;">Qty</th>
        <th style="padding: 10px; border-bottom: 2px solid #000; text-align: right;">Rate</th>
        <th style="padding: 10px; border-bottom: 2px solid #000; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{itemsTable}}
    </tbody>
  </table>

  {{financeSection}}

  <div style="display: flex; justify-content: space-between; margin-top: 20px;">
    <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; height: fit-content;">
      <p style="margin: 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Payment Mode</p>
      <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">{{paymentMode}}</p>
    </div>
    
    <div style="width: 300px; font-size: 15px;">
      <div style="display: flex; justify-content: space-between; padding: 4px 0;"><span>Subtotal:</span> <b>{{currency}}{{subtotal}}</b></div>
      <div style="display: flex; justify-content: space-between; padding: 4px 0; color: red;"><span>Discount:</span> <b>-{{currency}}{{discount}}</b></div>
      {{taxRows}}
      <div style="display: flex; justify-content: space-between; padding: 10px 0; margin-top: 5px; border-top: 2px solid #000; font-size: 22px; font-weight: 900;">
        <span>Total:</span> <span>{{currency}}{{total}}</span>
      </div>
    </div>
  </div>

  <div style="text-align: center; margin-top: 50px; padding-top: 15px; border-top: 1px solid #ccc; color: #555;">
    <h3 style="margin: 0 0 5px 0; color: #000;">{{thanksMessage}}</h3>
    <p style="margin: 0; font-size: 12px;">{{footerNote}}</p>
  </div>
</div>
`;