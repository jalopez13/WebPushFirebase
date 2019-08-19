// =======================================================
// VARIABLES
// =======================================================

const FIREBASE_AUTH = firebase.auth();
const FIREBASE_MESSAGING = firebase.messaging();
const FIREBASE_DATABASE = firebase.database();

const signInBtn = document.getElementById('signin');
const signOutBtn = document.getElementById('signout');
const subscribeBtn = document.getElementById('subscribe');
const unsubscribeBtn = document.getElementById('unsubscribe');
const notificationForm = document.getElementById('notification-form');
const notificationMessage = document.getElementById('notification-message');
const infoDiv = document.getElementById('info');

// =======================================================
// FUNCTIONS
// =======================================================

// AUTHENTICATION

const handleSignIn = () => {
  FIREBASE_AUTH.signInWithPopup( new firebase.auth.GoogleAuthProvider() );
};

const handleSignOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    subscribeBtn.setAttribute('hidden', true);
    FIREBASE_AUTH.signOut();
  }
};
  
const handleAuthStateChange = user => {
  if (user) {
    // User is signed in
    console.log("[ USER SIGNED IN ]");
    signInBtn.setAttribute("hidden", "true");
    signOutBtn.removeAttribute("hidden");
    notificationForm.removeAttribute("hidden");

    checkSubscription();
  } else {
    // User is not signed in
    console.log("[ USER NOT SIGNED IN ]");
    signOutBtn.setAttribute("hidden", "true");
    signInBtn.removeAttribute("hidden");
    notificationForm.setAttribute("hidden", "true");
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
  .catch(error => {
    infoDiv.classList.add('active');
    infoDiv.innerText = `User didn't give permission :(", ${error}`;

    setTimeout(function() {
      infoDiv.classList.remove('active');
    }, 1000);
  });
}

FIREBASE_AUTH.onAuthStateChanged(handleAuthStateChange);
FIREBASE_MESSAGING.onTokenRefresh(handleTokenRefresh)

// SUBSCRIBE TO NOTIFICATIONS

const handleSubscribeToNotifications = () => {
  // ask permission
  FIREBASE_MESSAGING.requestPermission()
  // get subscription token
  .then(() => FIREBASE_MESSAGING.getToken())
  .then(token => handleTokenRefresh())
  .then(() => checkSubscription())
  .catch(error => {
    infoDiv.classList.add('active');
    infoDiv.innerText = `User didn't give permission :(", ${error}`;

    setTimeout(function() {
      infoDiv.classList.remove('active');
    }, 5000);
  });
};

// UNSUBSCRIBE TO NOTIFICATIONS

const handleUnsubscribeToNotifications = () => {
  FIREBASE_MESSAGING.getToken()
  .then(token => FIREBASE_MESSAGING.deleteToken(token))
  .then(() => FIREBASE_DATABASE.ref('/tokens').orderByChild('uid').equalTo(FIREBASE_AUTH.currentUser.uid).once('value'))
  .then(snapshot => {
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
      console.log('[ USER SUBSCRIBED ]');
    } else {
      subscribeBtn.removeAttribute('hidden');
      unsubscribeBtn.setAttribute('hidden', true);
      console.log('[ USER UNSUBSCRIBED ]');
    }
  })
};

// SEND NOTIFICATIONS

const handleSendNotification = (event) => {
  event.preventDefault();

  if (!notificationMessage.value) {
    alert('Please enter a notification message.');
    return;
  };

  FIREBASE_DATABASE.ref('/notifications').push({
    user: FIREBASE_AUTH.currentUser.displayName,
    message: notificationMessage.value,
    userImage: FIREBASE_AUTH.currentUser.photoURL
  })
  .then(() => {
    notificationMessage.value = '';
    infoDiv.classList.add('active');
    infoDiv.innerText = `Notification sent successfully!`;

    setTimeout(function() {
      infoDiv.classList.remove('active');
    }, 5000);
  })
  .catch(error => {
    infoDiv.classList.add('active');
    infoDiv.innerText = `Notification error occurred, Notification sent failed! :(", ${error}`;

    setTimeout(function() {
      infoDiv.classList.remove('active');
    }, 5000);
  });
};


// =======================================================
// EVENT LISTENERS
// =======================================================

signInBtn.addEventListener('click', handleSignIn);
signOutBtn.addEventListener('click', handleSignOut);
subscribeBtn.addEventListener('click', handleSubscribeToNotifications);
unsubscribeBtn.addEventListener('click', handleUnsubscribeToNotifications);
notificationForm.addEventListener('submit', handleSendNotification);