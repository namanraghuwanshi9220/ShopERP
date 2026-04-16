import { auth, db } from "./config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);

// Email/Password Signup
export const signupUser = async (email, password, shopName, ownerName) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
  await setDoc(doc(db, "shops", user.uid, "profile", "data"), {
    shopName, ownerName, phone: "", address: "", gstin: "", logoUrl: "",
    billPrefix: "INV", lastBillNo: 0, defaultGST: 0, currency: "₹",
    thanksMessage: "Thank you for your business!", footerNote: "Goods once sold cannot be returned."
  });
  return user;
};

// NEW: GOOGLE 1-CLICK AUTHENTICATION
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);

  // Check if this Google user already has a shop profile
  const profileRef = doc(db, "shops", user.uid, "profile", "data");
  const profileSnap = await getDoc(profileRef);
  
  // If first time login, create a default profile automatically
  if (!profileSnap.exists()) {
    await setDoc(profileRef, {
      shopName: `${user.displayName.split(' ')[0]}'s Shop`, // e.g. "Rahul's Shop"
      ownerName: user.displayName,
      phone: "", address: "", gstin: "", logoUrl: user.photoURL || "",
      billPrefix: "INV", lastBillNo: 0, defaultGST: 0, currency: "₹",
      thanksMessage: "Thank you for your business!", footerNote: "Goods once sold cannot be returned."
    });
  }
  return user;
};