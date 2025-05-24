const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const artikli = require('./artikli.json');

const firebaseConfig = {
  apiKey: "AIzaSyAOshzdi67xVM79OW_7N2aZgitQtXcilFQ",
  authDomain: "kuhinjski-popis.firebaseapp.com",
  projectId: "kuhinjski-popis",
  storageBucket: "kuhinjski-popis.firebasestorage.app",
  messagingSenderId: "413749979013",
  appId: "1:413749979013:web:242f91d4487d4f4c11c6ec",
  measurementId: "G-F2589DWPNY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedDatabase = async () => {
  const collectionRef = collection(db, 'namirnice');

  for (const item of artikli) {
    try {
      await addDoc(collectionRef, item);
      console.log(`✅ Dodat: ${item.name}`);
    } catch (error) {
      console.error(`❌ Greška za ${item.name}:`, error);
    }
  }

  console.log('🌟 Ubacivanje završeno!');
};

seedDatabase();
