importScripts('/__/firebase/6.3.5/firebase-app.js');
importScripts('/__/firebase/6.3.5/firebase-messaging.js');
importScripts('/__/firebase/init.js');

const config = {
  apiKey: 'AIzaSyCWzS0X38kMqbvnW1l1YcleWFEoW66nRB0',
  authDomain: 'simply-notify-dc3d5.firebaseapp.com',
  databaseURL: 'https://simply-notify-dc3d5.firebaseio.com',
  messagingSenderId: '391430870767'
};

firebase.initializeApp(config);

// const FIREBASE_MESSAGING = firebase.messaging();

// FIREBASE_MESSAGING.usePublicVapidKey('BC7UsLxoQ16SOiTw0oZOQtQok44zq-qffbc7_isXyWWsOcsbGZBb7v3RsZDp7cFvlrEQMMizzMiiWkKf-Vt8Zy4');

// // RECEIVE NOTIFICATIONS
// FIREBASE_MESSAGING.requestPermission().then(() => {
//   FIREBASE_MESSAGING.onMessage(payload => {
//     const obj = JSON.parse(payload.data.notification);
//     const notification = new Notification(obj.title, {
//       icon: obj.icon,
//       body: obj.body
//     });

//     console.log('notification: ', notification);
//   });

//   // RECEIVE NOTIFICATIONS
//   FIREBASE_MESSAGING.setBackgroundMessageHandler(payload => {
//     console.log('[firebase-messaging-sw.js] Received background message.', payload);
//     const obj = JSON.parse(payload.data.notification);
//     const title = obj.title;
//     const notificationOptions = {
//       icon: obj.icon,
//       body: obj.body
//     };

//     return self.registration.showNotification(title, notificationOptions);
//   });
  
//   FIREBASE_MESSAGING.getToken().then(token => {
//     console.log('Token: ', token);
//   })
//   .catch(err => console.log('An error occurred while retrieving token', err));
// });


