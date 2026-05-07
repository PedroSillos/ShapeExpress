importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCidBEXaCtS28jgobAyA3_MLBothNbDy30",
  authDomain: "shapeexpress.firebaseapp.com",
  projectId: "shapeexpress",
  storageBucket: "shapeexpress.firebasestorage.app",
  messagingSenderId: "129919049822",
  appId: "1:129919049822:web:94aa1f4143935d10cfd4cf"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
