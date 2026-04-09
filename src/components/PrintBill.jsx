export default function PrintBill({ bill, profile }) {
  if (!bill || !profile) return null;

  return (
    <div className="hidden print:block w-full max-w-3xl mx-auto p-8 text-black bg-white">
      <div className="flex items-center justify-between border-b-2 border-gray-300 pb-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Logo Size Fixed Here */}
          {profile.logoUrl && <img src={profile.logoUrl} alt="Shop Logo" className="h-24 w-24 object-contain rounded-md" />}
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{profile.shopName}</h1>
            <p className="text-sm mt-1 text-gray-700">{profile.address}</p>
            <p className="text-sm font-medium mt-1">Mobile: {profile.phone} {profile.gstin && `| GSTIN: ${profile.gstin}`}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-500">INVOICE</h2>
          <p className="font-semibold mt-1 text-lg">{bill.billNo}</p>
          <p className="text-sm">{new Date(bill.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Billed To</h3>
        <p className="font-bold text-lg">{bill.customerName || 'Cash Customer'}</p>
        {bill.customerPhone && <p className="text-sm font-medium text-gray-700">Ph: {bill.customerPhone}</p>}
      </div>

      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800 text-left bg-gray-100">
            <th className="py-3 px-2 font-bold">Item Description</th>
            <th className="py-3 px-2 text-center font-bold">Quantity</th>
            <th className="py-3 px-2 text-right font-bold">Rate</th>
            <th className="py-3 px-2 text-right font-bold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bill.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-3 px-2 font-medium">{item.name}</td>
              <td className="py-3 px-2 text-center">{item.qty} <span className="text-xs text-gray-500">{item.unit || 'Pcs'}</span></td>
              <td className="py-3 px-2 text-right">{profile.currency}{item.price.toFixed(2)}</td>
              <td className="py-3 px-2 text-right font-bold">{profile.currency}{(item.qty * item.price).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-600 max-w-xs">
          <p><span className="font-bold text-black">Payment Mode:</span> {bill.paymentMode}</p>
        </div>
        
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between border-b pb-1"><span className="font-medium text-gray-600">Subtotal:</span> <span className="font-semibold">{profile.currency}{bill.subtotal.toFixed(2)}</span></div>
          {bill.discount > 0 && <div className="flex justify-between text-red-600 border-b pb-1"><span>Discount:</span> <span>-{profile.currency}{bill.discount.toFixed(2)}</span></div>}
          {bill.gst > 0 && <div className="flex justify-between border-b pb-1"><span className="text-gray-600">GST:</span> <span>+{profile.currency}{bill.gst.toFixed(2)}</span></div>}
          <div className="flex justify-between pt-2 text-xl font-extrabold text-black">
            <span>Total:</span> <span>{profile.currency}{bill.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 pt-4 border-t border-gray-300">
        <p className="font-bold text-gray-800 text-lg">{profile.thanksMessage}</p>
        <p className="text-xs text-gray-500 mt-1">{profile.footerNote}</p>
      </div>
    </div>
  );
}