import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const q = collection(db, 'users');
  const snap = await getDocs(q);
  console.log("Total users:", snap.docs.length);
  snap.docs.forEach(d => {
    console.log(d.id, "=>", d.data().userType);
  });
  process.exit(0);
}
check();
