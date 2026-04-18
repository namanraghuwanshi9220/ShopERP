import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { useToastStore } from '../store/useToastStore';
import { Save, Upload, Code } from 'lucide-react';
import { DEFAULT_HTML_TEMPLATE } from '../constants'; // <-- NEW IMPORT WAY

export default function Settings() {
  const { user } = useAuthStore();
  const { profile, updateProfile } = useShopStore();
  const { addToast } = useToastStore();
  
  const [formData, setFormData] = useState({
    shopName: '', ownerName: '', phone: '', gstin: '', address: '',
    billPrefix: 'INV', defaultGST: 0, currency: '₹', thanksMessage: '', footerNote: '', customHtmlTemplate: ''
  });
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => { 
    if (profile) {
      setFormData(prev => ({ ...prev, ...profile }));
      if (profile.logoUrl) setLogoPreview(profile.logoUrl);
    }
  }, [profile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return addToast("Image size should be less than 2MB", "error");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300, MAX_HEIGHT = 300;
        let width = img.width, height = img.height;
        if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
        else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/webp", 0.8);
        setLogoPreview(compressedBase64);
        setFormData(prev => ({ ...prev, logoUrl: compressedBase64 }));
      };
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(user.uid, formData);
      addToast("Settings updated successfully", "success");
    } catch (error) { addToast(error.message, 'error'); } 
    finally { setSaving(false); }
  };

  const loadDefaultTemplate = () => {
    if(confirm("This will replace your current HTML with the default template. Continue?")) {
      setFormData({ ...formData, customHtmlTemplate: DEFAULT_HTML_TEMPLATE });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-black text-gray-800 tracking-tight">Shop Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-sm font-black text-gray-800 border-b pb-2 uppercase tracking-widest">Business Profile</h2>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain bg-white" alt="Logo" /> : <Upload className="text-gray-400" />}
            </div>
            <div>
              <label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">Shop Logo (Shown on Bill)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Shop Name</label><input required name="shopName" value={formData.shopName} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Owner Name</label><input required name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Phone Number</label><input name="phone" value={formData.phone} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">GSTIN</label><input name="gstin" value={formData.gstin} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition uppercase" /></div>
            <div className="md:col-span-2"><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Shop Address</label><textarea name="address" rows="2" value={formData.address} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-sm font-black text-gray-800 border-b pb-2 uppercase tracking-widest">Billing Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Bill Prefix</label><input name="billPrefix" value={formData.billPrefix} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition uppercase" /></div>
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Default GST %</label><input type="number" name="defaultGST" value={formData.defaultGST} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
            <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Currency Symbol</label><input name="currency" value={formData.currency} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
          </div>
          <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Thank You Message</label><input name="thanksMessage" value={formData.thanksMessage} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
          <div><label className="block text-[11px] font-black text-gray-500 uppercase tracking-wider mb-1">Footer Note (T&C)</label><input name="footerNote" value={formData.footerNote} onChange={handleChange} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold outline-none focus:border-primary transition" /></div>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-800 space-y-4">
          <div className="flex justify-between items-center border-b border-gray-700 pb-2">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Code size={18} className="text-primary"/> Advanced: Custom Bill HTML</h2>
            <button type="button" onClick={loadDefaultTemplate} className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg font-bold border border-gray-600 transition">
              Load Default Template
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-4 text-[11px] text-gray-400 font-mono leading-relaxed">
            <p className="text-gray-300 font-bold mb-2">Available Variables (Use these to inject data):</p>
            <span className="text-blue-400">{'{{shopName}}'}</span>, <span className="text-blue-400">{'{{shopAddress}}'}</span>, <span className="text-blue-400">{'{{shopPhone}}'}</span>, <span className="text-blue-400">{'{{shopGstin}}'}</span>, <span className="text-blue-400">{'{{logoUrl}}'}</span> <br/>
            <span className="text-green-400">{'{{customerName}}'}</span>, <span className="text-green-400">{'{{customerPhone}}'}</span>, <span className="text-green-400">{'{{customerAddress}}'}</span> <br/>
            <span className="text-purple-400">{'{{invoiceType}}'}</span>, <span className="text-purple-400">{'{{billNo}}'}</span>, <span className="text-purple-400">{'{{date}}'}</span> <br/>
            <span className="text-yellow-400">{'{{itemsTable}}'}</span>, <span className="text-yellow-400">{'{{financeSection}}'}</span>, <span className="text-yellow-400">{'{{taxRows}}'}</span> <br/>
            <span className="text-red-400">{'{{subtotal}}'}</span>, <span className="text-red-400">{'{{discount}}'}</span>, <span className="text-red-400">{'{{total}}'}</span>, <span className="text-red-400">{'{{paymentMode}}'}</span>, <span className="text-red-400">{'{{currency}}'}</span>
          </div>

          <textarea 
            name="customHtmlTemplate" 
            rows="15" 
            placeholder="Leave blank to use the default system template... or paste your custom HTML here."
            value={formData.customHtmlTemplate} 
            onChange={handleChange} 
            className="w-full bg-gray-950 border-2 border-gray-700 rounded-xl px-4 py-3 font-mono text-[13px] text-green-400 outline-none focus:border-primary transition" 
          />
        </div>

        <div className="flex justify-end sticky bottom-6 z-10">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-black hover:bg-primary-dark transition shadow-xl disabled:opacity-50 text-lg uppercase tracking-wide">
            <Save size={22} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}