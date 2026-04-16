import { db } from "./config";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, runTransaction, query, orderBy } from "firebase/firestore";

export const getProfile = async (shopId) => { 
  const snap = await getDoc(doc(db, "shops", shopId, "profile", "data")); 
  return snap.exists() ? snap.data() : null; 
};

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

// CORE STOCK REDUCTION LOGIC
const processStockReduction = async (transaction, shopId, items) => {
  const stockUpdates = {};
  for (const item of items) {
    if (!stockUpdates[item.id]) stockUpdates[item.id] = { qty: 0, soldImeis: [] };
    stockUpdates[item.id].qty += item.qty;
    if (item.soldImei) stockUpdates[item.id].soldImeis.push(item.soldImei.toLowerCase());
  }

  for (const itemId of Object.keys(stockUpdates)) {
    const itemRef = doc(db, "shops", shopId, "inventory", itemId);
    const itemSnap = await transaction.get(itemRef);
    if (itemSnap.exists()) {
      const dbData = itemSnap.data();
      const currentStock = dbData.stock || 0;
      const newStock = Math.max(0, currentStock - stockUpdates[itemId].qty);
      
      if (newStock <= 0) {
        transaction.delete(itemRef); // DELETE ITEM IF STOCK IS 0
      } else {
        let updatePayload = { stock: newStock };
        if (dbData.imei && stockUpdates[itemId].soldImeis.length > 0) {
          const currentImeis = dbData.imei.split(',').map(i => i.trim()).filter(Boolean);
          const remainingImeis = currentImeis.filter(i => !stockUpdates[itemId].soldImeis.includes(i.toLowerCase()));
          updatePayload.imei = remainingImeis.join(', ');
        }
        transaction.set(itemRef, updatePayload, { merge: true });
      }
    }
  }
};

// GENERATE PAKKA BILL (WITH GST)
export const generateBill = async (shopId, billData, items) => {
  return await runTransaction(db, async (transaction) => {
    const profileRef = doc(db, "shops", shopId, "profile", "data");
    const profileSnap = await transaction.get(profileRef);
    const profileData = profileSnap.exists() ? profileSnap.data() : {};
    
    const newBillNo = (profileData.lastBillNo || 0) + 1;
    const billFormattedNo = `${profileData.billPrefix || 'INV'}-${String(newBillNo).padStart(4, '0')}`;

    await processStockReduction(transaction, shopId, items);

    const billRef = doc(collection(db, "shops", shopId, "bills"));
    const finalBill = { ...billData, billNo: billFormattedNo, isEstimate: false, createdAt: new Date().toISOString() };
    transaction.set(billRef, finalBill);
    transaction.set(profileRef, { ...profileData, lastBillNo: newBillNo }, { merge: true });

    return finalBill;
  });
};

// GENERATE KACCHA BILL (ESTIMATE) -> THIS FUNCTION WAS MISSING IN YOUR FILE
export const generateEstimate = async (shopId, billData, items) => {
  return await runTransaction(db, async (transaction) => {
    const profileRef = doc(db, "shops", shopId, "profile", "data");
    const profileSnap = await transaction.get(profileRef);
    const profileData = profileSnap.exists() ? profileSnap.data() : {};
    
    const newEstNo = (profileData.lastEstimateNo || 0) + 1;
    const estFormattedNo = `EST-${String(newEstNo).padStart(4, '0')}`;

    await processStockReduction(transaction, shopId, items);

    // Saving to a different folder "estimates"
    const estRef = doc(collection(db, "shops", shopId, "estimates"));
    const finalEst = { ...billData, billNo: estFormattedNo, isEstimate: true, createdAt: new Date().toISOString() };
    transaction.set(estRef, finalEst);
    transaction.set(profileRef, { ...profileData, lastEstimateNo: newEstNo }, { merge: true });

    return finalEst;
  });
};