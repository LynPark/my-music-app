import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMujPlCaBkcxbWvt1SSa5ZHJ_0SULGKwE",
  authDomain: "mymusicapp815.firebaseapp.com",
  projectId: "mymusicapp815",
  storageBucket: "mymusicapp815.appspot.com",
  messagingSenderId: "314567439346",
  appId: "1:314567439346:web:f3f00a9879b9300c5db16b",
};

export const app = initializeApp(firebaseConfig);
//인증
export const auth = getAuth(app);
export const googleAuth = new GoogleAuthProvider(app);
export const db = getFirestore(app);
