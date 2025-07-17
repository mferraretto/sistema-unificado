
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDskmCmkvGgnV9I_MkhBgHOsCoU4VarZbw",
  authDomain: "sobra-shopee.firebaseapp.com",
  projectId: "sobra-shopee",
  storageBucket: "sobra-shopee.firebasestorage.app",
  messagingSenderId: "884927523696",
  appId: "1:884927523696:web:334f198596e85462d2bdb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { db };
