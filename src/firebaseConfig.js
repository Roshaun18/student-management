import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCc4tjMPA3ZIb1fLShnRZtUP2DzjGx-wgw",
  authDomain: "interntask1-4b8d3.firebaseapp.com",
  databaseURL: "https://interntask1-4b8d3-default-rtdb.firebaseio.com",
  projectId: "interntask1-4b8d3",
  storageBucket: "interntask1-4b8d3.firebasestorage.app",
  messagingSenderId: "75942771072",
  appId: "1:75942771072:web:490d4a9506433f5ac76965"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);