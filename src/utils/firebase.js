// src/utils/firebase.js

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Tvoja Firebase konfiguracija (uneta iz tvog naloga)
const firebaseConfig = {
  apiKey: "AIzaSyAOshzdi67xVM79OW_7N2aZgitQtXcilFQ",
  authDomain: "kuhinjski-popis.firebaseapp.com",
  projectId: "kuhinjski-popis",
  storageBucket: "kuhinjski-popis.firebasestorage.app",
  messagingSenderId: "413749979013",
  appId: "1:413749979013:web:242f91d4487d4f4c11c6ec",
  measurementId: "G-F2589DWPNY"
};

// Inicijalizuj Firebase aplikaciju
const app = initializeApp(firebaseConfig);

// Inicijalizuj Firestore bazu
const db = getFirestore(app);

// Eksportuj za korišćenje u drugim fajlovima
export { db };
