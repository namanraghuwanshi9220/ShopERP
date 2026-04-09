import { db } from "./config";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, runTransaction, query, orderBy } from "firebase/firestore";

export const getProfile = async (shopId) => {
  const snap = await getDoc(doc(db, "shops", shopId, "profile", "data"));
  return snap.exists() ? snap.data() : null;
};

// CRITICAL FIX 1: Used setDoc with merge:true. Ab yeh kabhi crash nahi hoga.
export const updateProfile = async (shopId, data) => {
  await setDoc(doc(db, "shops", shopId, "profile", "data"), data, { merge: true });
};

export const getInventory = async (shopId) => {
  const snap = await getDocs(query(collection(db, "shops", shopId, "inventory"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addInventoryItem = async (shopId, item) => {
  const docRef = doc(collection(db, "shops", shopId, "inventory"));
  await setDoc(docRef, { ...item, createdAt: new Date().toISOString() });
  return { id: docRef.id, ...item };
};

// CRITICAL FIX 2: Added merge:true here as well for extreme safety
export const updateInventoryItem = async (shopId, itemId, data) => {
  await setDoc(doc(db, "shops", shopId, "inventory", itemId), data, { merge: true });
};

export const deleteInventoryItem = async (shopId, itemId) => {
  await deleteDoc(doc(db, "shops", shopId, "inventory", itemId));
};

export const getBills = async (shopId) => {
  const snap = await getDocs(query(collection(db, "shops", shopId, "bills"), orderBy("createdAt", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// BULLETPROOF GENERATE BILL TRANSACTION
export const generateBill = async (shopId, billData, items) => {
  return await runTransaction(db, async (transaction) => {
    const profileRef = doc(db, "shops", shopId, "profile", "data");
    const profileSnap = await transaction.get(profileRef);
    
    // Agar profile nahi bani hui hai, toh default values le lega (No crash)
    const profileData = profileSnap.exists() ? profileSnap.data() : {};
    
    const currentBillNo = profileData.lastBillNo || 0;
    const newBillNo = currentBillNo + 1;
    const prefix = profileData.billPrefix || 'INV';
    const billFormattedNo = `${prefix}-${String(newBillNo).padStart(4, '0')}`;

    // Stock update securely
    for (const item of items) {
      const itemRef = doc(db, "shops", shopId, "inventory", item.id);
      const itemSnap = await transaction.get(itemRef);
      if (itemSnap.exists()) {
        const currentStock = itemSnap.data().stock || 0;
        const newStock = Math.max(0, currentStock - item.qty);
        transaction.set(itemRef, { stock: newStock }, { merge: true }); // Using set with merge
      }
    }

    // Save New Bill
    const billRef = doc(collection(db, "shops", shopId, "bills"));
    const finalBill = { ...billData, billNo: billFormattedNo, createdAt: new Date().toISOString() };
    transaction.set(billRef, finalBill);

    // Profile me lastBillNo update karna (setDoc with merge)
    transaction.set(profileRef, { ...profileData, lastBillNo: newBillNo }, { merge: true });

    return finalBill;
  });
};