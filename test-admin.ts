import admin from 'firebase-admin';

async function test() {
  try {
    admin.initializeApp();
    const db = admin.firestore();
    await db.collection('test_seed').doc('test').set({ ok: true });
    console.log('Admin SDK works with ADC!');
  } catch (e) {
    console.error('Admin SDK failed:', e);
  }
}

test();
