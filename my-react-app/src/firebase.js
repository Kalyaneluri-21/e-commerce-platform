import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkhzbR1l0gL4CR54U_az1rhEeQz1ngDG8",
  authDomain: "multivendorecommerceplatform.firebaseapp.com",
  projectId: "multivendorecommerceplatform",
  storageBucket: "multivendorecommerceplatform.firebasestorage.app",
  messagingSenderId: "640843138824",
  appId: "1:640843138824:web:56ecc5ae9ef84107ff0ebd",
  measurementId: "G-TM178MF4Z1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 