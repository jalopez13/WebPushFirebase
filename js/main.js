/**
 * AUTHENTICATION
 */

const signIn = document.getElementById('signin');
const signOut = document.getElementById('signout');

const FIREBASE_AUTH = firebase.auth();
const FIREBASE_MESSAGING = firebase.messaging();
const FIREBASE_DATABASE = firebase.database();

const handleSignIn = () => {
FIREBASE_AUTH.signInWithPopup( new firebase.auth.GoogleAuthProvider() );
};

const handleSignOut = () => {
  FIREBASE_AUTH.signOut();
  };
  
const handleAuthStateChange = user => {
  if (user) {
    signIn.setAttribute('hidden', true);
    signOut.removeAttribute('hidden');
    checkSubscription();
  } else {
    signIn.removeAttribute('hidden');
    signOut.setAttribute('hidden', true);
  }
};

const handleTokenRefresh = () => {
  return FIREBASE_MESSAGING.getToken()
  .then(() => FIREBASE_MESSAGING.getToken())
  .then(token => {
    FIREBASE_DATABASE.ref('/tokens').push({
      token,
      uid: FIREBASE_AUTH.currentUser.uid
    });
  })
  .catch(error => console.log("User didn't give permission :(", error));
}

FIREBASE_AUTH.onAuthStateChanged(handleAuthStateChange);
FIREBASE_MESSAGING.onTokenRefresh(handleTokenRefresh)
signIn.addEventListener('click', handleSignIn);
signOut.addEventListener('click', handleSignOut);

/**
 * SUBSCRIBE TO NOTIFICATIONS
 */

const subscribeBtn = document.getElementById('subscribe');

const handleSubscribeToNotifications = () => {
  // ask permission
  FIREBASE_MESSAGING.requestPermission()
  // get subscription token
  .then(() => FIREBASE_MESSAGING.getToken())
  .then(token => handleTokenRefresh())
  .then(() => checkSubscription())
  .catch(error => console.log("User didn't give permission :(", error))
  


};

subscribeBtn.addEventListener('click', handleSubscribeToNotifications);

/**
 * UNSUBSCRIBE TO NOTIFICATIONS
 */

const unsubscribeBtn = document.getElementById('unsubscribe');

const handleUnsubscribeToNotifications = () => {
  FIREBASE_MESSAGING.getToken()
  .then(token => FIREBASE_MESSAGING.deleteToken(token))
  .then(() => FIREBASE_DATABASE.ref('/tokens').orderByChild('uid').equalTo(FIREBASE_AUTH.currentUser.uid).once('value'))
  .then(snapshot => {
    console.log('Snapshot: ', snapshot.val());
    const key = Object.keys( snapshot.val() )[0];
    return FIREBASE_DATABASE.ref('/tokens').child(key).remove();
  })
  .then(() => checkSubscription())
  .catch(error => console.log("Unsubscribed failed :(", error));
}

const checkSubscription = () => {
  FIREBASE_DATABASE.ref('/tokens').orderByChild('uid').equalTo(FIREBASE_AUTH.currentUser.uid).once('value')
  .then(snapshot => {
    if (snapshot.val()) {
      subscribeBtn.setAttribute('hidden', true);
      unsubscribeBtn.removeAttribute('hidden');
    } else {
      subscribeBtn.removeAttribute('hidden');
      unsubscribeBtn.setAttribute('hidden', true);
    }
  })
};

unsubscribeBtn.addEventListener('click', handleUnsubscribeToNotifications);


/**
 * SEND NOTIFICATIONS
 */

const sendBtn = document.getElementById('send-btn');
const notificationMessage = document.getElementById('notification-form').value;

const handleSendNotification = (event) => {
  event.preventDefault();

  FIREBASE_DATABASE.ref('/notifications').push({
    user: FIREBASE_AUTH.currentUser.displayName,
    message: notificationMessage
  });
};

sendBtn.addEventListener('submit', handleSendNotification);