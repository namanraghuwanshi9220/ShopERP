import { auth, db } from "./config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);

export const signupUser = async (email, password, shopName, ownerName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
  // Create initial shop profile
  await setDoc(doc(db, "shops", user.uid, "profile", "data"), {
    shopName,
    ownerName,
    phone: "",
    address: "",
    gstin: "",
    logoUrl: "",
    billPrefix: "INV",
    lastBillNo: 0,
    defaultGST: 0,
    currency: "₹",
    thanksMessage: "Thank you for your business!",
    footerNote: "Goods once sold cannot be returned."
  });
  return user;
};