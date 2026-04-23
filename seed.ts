import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "ai-studio-applet-webapp-62050",
  "appId": "1:503850873411:web:6f35518d90014c89045af6",
  "apiKey": "AIzaSyDJsPh2Rl7k1XSPcfRPbn_DPcaKmDbgUSM",
  "authDomain": "ai-studio-applet-webapp-62050.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-3c09dd51-8490-4e77-8ddd-e2c549cc0611",
  "storageBucket": "ai-studio-applet-webapp-62050.firebasestorage.app",
  "messagingSenderId": "503850873411"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const payload = {
  "treinador": {
    "nome": "Seu Nome (Treinador)",
    "email": "treinador@teste.com",
    "senha": "senha_segura_123"
  },
  "alunos": [
    {
      "nome": "Aluno 1",
      "email": "aluno1@teste.com",
      "senha": "senha_segura_123",
      "objetivo": "Hipertrofia"
    },
    {
      "nome": "Aluno 2",
      "email": "aluno2@teste.com",
      "senha": "senha_segura_123",
      "objetivo": "Emagrecimento"
    }
  ]
};

async function createOrLogin(email, password) {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    }
    throw e;
  }
}

async function run() {
  console.log("Creating Trainer...");
  const trainer = await createOrLogin(payload.treinador.email, payload.treinador.senha);
  
  await setDoc(doc(db, 'users', trainer.uid), {
    name: payload.treinador.nome,
    email: payload.treinador.email,
    userType: 'treinador',
    height: 180,
    initialWeight: 80,
    objective: 'Treinar alunos',
    birthDate: '1990-01-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
    personalCode: 'TREINADOR123'
  }, { merge: true });
  
  console.log("Trainer created:", trainer.uid);
  
  for (const aluno of payload.alunos) {
    console.log("Creating Student:", aluno.nome);
    const student = await createOrLogin(aluno.email, aluno.senha);
    
    await setDoc(doc(db, 'users', student.uid), {
      name: aluno.nome,
      email: aluno.email,
      userType: 'atleta',
      height: 170,
      initialWeight: 70,
      objective: aluno.objetivo,
      birthDate: '2000-01-01',
      avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
      personalCodeConnected: 'TREINADOR123'
    }, { merge: true });
    
    // Check if connection exists
    const q = query(collection(db, 'connections'), 
      where('studentEmail', '==', aluno.email),
      where('trainerEmail', '==', payload.treinador.email)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      const id = `conn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      await setDoc(doc(db, 'connections', id), {
        id,
        studentEmail: aluno.email,
        trainerEmail: payload.treinador.email,
        trainerName: payload.treinador.nome,
        trainerAvatar: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop',
        status: 'accepted',
        createdAt: new Date().toISOString()
      });
      console.log("Connection created for", aluno.nome);
    } else {
      console.log("Connection already exists for", aluno.nome);
    }
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

run().catch(console.error);
