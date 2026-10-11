
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfg53iNMAjJ8vICERoWOrY1GlOYc3-4oQ",
  authDomain: "missing-doc-reporting.firebaseapp.com",
  projectId: "missing-doc-reporting",
  storageBucket: "missing-doc-reporting.firebasestorage.app",
  messagingSenderId: "343328102777",
  appId: "1:343328102777:web:42be23498287dba6e0f7a8",
  measurementId: "G-3T2E6PSKD5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);