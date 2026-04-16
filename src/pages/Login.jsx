import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { loginUser, signupUser, signInWithGoogle } from '../firebase/auth';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { AlertCircle } from 'lucide-react';

export default function Login() {
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({ email: '', password: '', shopName: '', ownerName: '' });

  if (user) return <Navigate to="/" />;

  const handleError = (err) => {
    let message = "An error occurred. Please try again.";
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') message = "Invalid Email or Password. Please check and try again.";
    else if (err.code === 'auth/email-already-in-use') message = "This email is already registered. Please Log in.";
    else if (err.code === 'auth/weak-password') message = "Password is too weak. It must be at least 6 characters.";
    else if (err.code === 'auth/popup-closed-by-user') message = ""; 
    else if (err.code === 'auth/network-request-failed') message = "Network error. Please check your internet connection.";
    
    if (message) {
      setErrorMsg(message);
      addToast(message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg('');
    try {
      if (isLogin) {
        await loginUser(formData.email, formData.password);
        addToast("Logged in successfully!", "success");
      } else {
        await signupUser(formData.email, formData.password, formData.shopName, formData.ownerName);
        addToast("Account created successfully!", "success");
      }
    } catch (err) { handleError(err); } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true); setErrorMsg('');
    try {
      await signInWithGoogle();
      addToast("Logged in with Google successfully!", "success");
    } catch (err) { handleError(err); } finally { setGoogleLoading(false); }
  };

  const toggleMode = () => { setIsLogin(!isLogin); setErrorMsg(''); };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-10">
        
        {/* SIMPLE TITLE */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary tracking-tight">ShopERP</h1>
          <p className="text-gray-500 mt-2 text-sm">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 border border-red-100 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* EMAIL/PASSWORD FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Sharma Mobiles" value={formData.shopName} onChange={e => setFormData({...formData, shopName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <input required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="e.g. Rahul Sharma" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required minLength="6" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <button type="submit" disabled={loading || googleLoading} className="w-full bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 mt-2">
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {/* OR DIVIDER */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-xs text-gray-400 font-medium">OR</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* GOOGLE LOGIN BUTTON (AT THE BOTTOM) */}
        <button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          {googleLoading ? 'Connecting...' : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* TOGGLE LOGIN / SIGNUP */}
        <div className="mt-8 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleMode} className="ml-1.5 text-primary font-semibold hover:underline">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

      </div>
    </div>
  );
}