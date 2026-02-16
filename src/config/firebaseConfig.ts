import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase konsolundan aldığın bilgileri buraya yapıştır
const firebaseConfig = {
  apiKey: "AIzaSyCRZRqz7kGqk2cCmw6GQ0WcrjpWwEUcrhI",
  authDomain: "ramadanapp-b9046.firebaseapp.com",
  projectId: "ramadanapp-b9046",
  storageBucket: "ramadanapp-b9046.firebasestorage.app",
  messagingSenderId: "821611684902",
  appId: "1:821611684902:web:912ce35990412ffaafb2e7",
  measurementId: "G-C1TY3ET645"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);