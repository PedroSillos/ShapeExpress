importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBCuNvJbd_iET7qods388w3z6QDzsxRmYo",
  authDomain: "gen-lang-client-0904218608.firebaseapp.com",
  projectId: "gen-lang-client-0904218608",
  storageBucket: "gen-lang-client-0904218608.firebasestorage.app",
  messagingSenderId: "186132941611",
  appId: "1:186132941611:web:9d41d79d00df322499536e"
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
