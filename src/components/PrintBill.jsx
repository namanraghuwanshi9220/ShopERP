import { useEffect } from 'react';

export default function PrintBill({ bill, profile }) {
  
  useEffect(() => {
    if (bill && profile) {
      const originalTitle = document.title;
      // Date formatting logic
      const formattedDate = new Date(bill.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-');
      // Set the dynamic title for PDF Download
      document.title = `${bill.isEstimate ? 'Estimate' : 'Bill'}_${bill.billNo}_${formattedDate}`;
      
      return () => {
        document.title = originalTitle; // Clean up
      };
    }
  }, [bill, profile]);

  if (!bill || !profile) return null;

  return (
    <div className="hidden print:block w-full max-w-3xl mx-auto p-8 text-black bg-white font-sans">
      <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-4">
          {profile.logoUrl && <img src={profile.logoUrl} alt="Logo" className="h-20 w-20 object-contain rounded-md" />}
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.shopName}</h1>
            <p className="text-sm mt-1 text-gray-800">{profile.address}</p>
            <p className="text-sm font-semibold mt-1">Ph: {profile.phone} {profile.gstin && !bill.isEstimate && `| GSTIN: ${profile.gstin}`}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-black uppercase tracking-widest text-gray-300">
            {bill.isEstimate ? 'ESTIMATE' : 'TAX INVOICE'}
          </h2>
          <p className="font-bold mt-1 text-lg text-gray-800">{bill.billNo}</p>
          <p className="text-sm font-medium">{new Date(bill.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-6 flex justify-between">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-1/2">
          <h3 className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Billed To</h3>
          <p className="font-black text-base">{bill.customerName || 'Cash Customer'}</p>
          {bill.customerPhone && <p className="text-xs font-bold text-gray-700 mt-1">Ph: {bill.customerPhone}</p>}
          {bill.customerAddress && <p className="text-xs font-medium text-gray-600 mt-1">{bill.customerAddress}</p>}
        </div>
      </div>

      <table className="w-full mb-6 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800 text-left bg-gray-100">
            <th className="py-2 px-3 font-black text-[11px] uppercase tracking-wide">Item Description</th>
            <th className="py-2 px-3 text-center font-black text-[11px] uppercase tracking-wide">Qty</th>
            <th className="py-2 px-3 text-right font-black text-[11px] uppercase tracking-wide">Rate</th>
            <th className="py-2 px-3 text-right font-black text-[11px] uppercase tracking-wide">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200 align-top">
              <td className="py-3 px-3">
                <div className="font-bold text-sm">{item.name}</div>
                {item.category === 'Mobile' && (
                  <div className="text-[10px] mt-0.5 text-gray-600 font-medium">
                    {item.ram && <span>{item.ram} / {item.rom}</span>}
                    {item.color && <span> • {item.color}</span>}
                  </div>
                )}
                {item.soldImei && (
                  <div className="mt-1 text-[10px] font-mono font-bold text-gray-800">
                    IMEI: {item.soldImei}
                  </div>
                )}
              </td>
              <td className="py-3 px-3 text-center font-bold text-sm">{item.qty} <span className="text-[9px] text-gray-500 font-medium block">{item.unit || 'Pcs'}</span></td>
              <td className="py-3 px-3 text-right font-semibold text-sm">{profile.currency}{item.price.toFixed(2)}</td>
              <td className="py-3 px-3 text-right font-black text-sm">{profile.currency}{(item.qty * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {bill.paymentMode === 'Finance' && bill.financeDetails && (
        <div className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3 border-b border-gray-200 pb-1">Finance / EMI Details</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Provider</p><p className="font-black text-gray-900">{bill.financeDetails.provider}</p></div>
            <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Down Payment</p><p className="font-black text-gray-900">{profile.currency}{bill.financeDetails.downPayment}</p></div>
            <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Tenure</p><p className="font-black text-gray-900">{bill.financeDetails.emiMonths} Months</p></div>
            <div><p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Monthly EMI</p><p className="font-black text-gray-900">{profile.currency}{bill.financeDetails.emiAmount}</p></div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mt-6">
        <div className="text-xs text-gray-600 border border-gray-200 p-3 rounded-lg bg-gray-50 w-64">
          <p className="font-bold text-black uppercase text-[10px] mb-1">Payment Method</p>
          <p className="font-black text-sm text-gray-800 uppercase">{bill.paymentMode}</p>
        </div>
        
        <div className="w-72 space-y-1.5 text-sm">
          <div className="flex justify-between border-b border-gray-200 pb-1.5"><span className="font-bold text-gray-600">Subtotal</span> <span className="font-black">{profile.currency}{bill.subtotal.toFixed(2)}</span></div>
          {bill.discount > 0 && <div className="flex justify-between text-red-600 border-b border-gray-200 pb-1.5"><span className="font-bold">Discount</span> <span className="font-black">-{profile.currency}{bill.discount.toFixed(2)}</span></div>}
          
          {!bill.isEstimate && bill.gstAmt > 0 && (
            <>
              <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-1.5"><span className="font-bold">CGST ({(bill.gstPercent/2).toFixed(1)}%)</span> <span className="font-bold">+{profile.currency}{bill.cgstAmt.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-1.5"><span className="font-bold">SGST ({(bill.gstPercent/2).toFixed(1)}%)</span> <span className="font-bold">+{profile.currency}{bill.sgstAmt.toFixed(2)}</span></div>
            </>
          )}

          <div className="flex justify-between pt-2 text-xl font-black text-black">
            <span>Grand Total</span> <span>{profile.currency}{bill.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 pt-4 border-t-2 border-gray-800">
        <p className="font-black text-gray-900 text-sm uppercase tracking-wide">{profile.thanksMessage}</p>
        {!bill.isEstimate && <p className="text-[10px] text-gray-500 mt-1 font-medium">{profile.footerNote}</p>}
        {bill.isEstimate && <p className="text-[10px] text-red-500 mt-1 font-bold">This is an estimate/quotation only, not a tax invoice.</p>}
        <p className="text-[9px] text-gray-400 mt-2 font-mono">Generated by ShopERP POS</p>
      </div>
    </div>
  );
}