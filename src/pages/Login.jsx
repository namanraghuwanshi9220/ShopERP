import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { loginUser, signupUser } from '../firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export default function Login() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', shopName: '', ownerName: '' });

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
        addToast("Logged in successfully");
      } else {
        await signupUser(formData.email, formData.password, formData.shopName, formData.ownerName);
        addToast("Account created successfully");
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-primary mb-6">ShopERP</h2>
        <h3 className="text-xl font-semibold mb-4 text-center">{isLogin ? 'Welcome Back' : 'Create an Account'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div><label className="block text-sm font-medium text-gray-700">Shop Name</label><input required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700">Owner Name</label><input required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} /></div>
            </>
          )}
          <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" required className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700">Password</label><input type="password" required minLength="6" className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary focus:border-primary" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-medium py-2.5 rounded-lg hover:bg-primary-dark transition disabled:opacity-50">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-primary hover:underline">{isLogin ? 'Sign up' : 'Log in'}</button>
        </div>
      </div>
    </div>
  );
}