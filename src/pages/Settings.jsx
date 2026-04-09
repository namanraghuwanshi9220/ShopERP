import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { useToastStore } from '../store/useToastStore';
import { Save, Upload } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const { profile, updateProfile } = useShopStore();
  const { addToast } = useToastStore();
  
  const [formData, setFormData] = useState({
    shopName: '', ownerName: '', phone: '', gstin: '', address: '',
    billPrefix: 'INV', defaultGST: 0, currency: '₹', thanksMessage: '', footerNote: ''
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
      addToast("Settings updated successfully");
    } catch (error) { addToast(error.message, 'error'); } 
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <h1 className="text-2xl font-bold text-gray-800">Shop Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Business Profile</h2>
          
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-lg border border-dashed flex flex-col items-center justify-center relative overflow-hidden">
              {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain bg-white" alt="Logo" /> : <Upload className="text-gray-400" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Logo (Shown on Bill)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-primary hover:file:bg-green-100 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Shop Name</label><input required name="shopName" value={formData.shopName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Owner Name</label><input required name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone Number</label><input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium mb-1">GSTIN</label><input name="gstin" value={formData.gstin} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 uppercase" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Shop Address</label><textarea name="address" rows="2" value={formData.address} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Billing Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Bill Prefix</label><input name="billPrefix" value={formData.billPrefix} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 uppercase" /></div>
            <div><label className="block text-sm font-medium mb-1">Default GST %</label><input type="number" name="defaultGST" value={formData.defaultGST} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
            <div><label className="block text-sm font-medium mb-1">Currency Symbol</label><input name="currency" value={formData.currency} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Thank You Message</label><input name="thanksMessage" value={formData.thanksMessage} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" /></div>
        </div>
        <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium">
          <Save size={20} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}