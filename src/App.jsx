import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuthStore } from './store/useAuthStore';

// Components & Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import NewBill from './pages/NewBill';
import BillHistory from './pages/BillHistory';
import Finance from './pages/Finance'; // Ensure this is imported!
import Settings from './pages/Settings';

export default function App() {
  const { setUser } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="new-bill" element={<NewBill />} />
          <Route path="history" element={<BillHistory />} />
          
          {/* THE MISSING FINANCE ROUTE HAS BEEN ADDED HERE */}
          <Route path="finance" element={<Finance />} /> 
          
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}