const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotifications = functions.database.ref('/notifications/{notificationId}').onWrite((change) => {
  // check to make sure it's a new notification being created

   // Only edit data when it is first created.
   if (change.before.exists()) {
    return null;
  }
  // Exit when the data is deleted.
  if (!change.after.exists()) {
    return null;
  }

  // Set Payload
  const NOTIFICATION_SNAPSHOT = change.after;

  const payload = {
    notification: {
      title: `New message from ${NOTIFICATION_SNAPSHOT.val().user}`,
      body: NOTIFICATION_SNAPSHOT.val().message,
      icon: NOTIFICATION_SNAPSHOT.val().userProfileImg,
      click_action: `https://simply-notify-dc3d5.firebaseapp.com/`
    }
  }

  // Clean invalid tokens
  const cleanInvalidTokens = (tokensWithKey, results) => {
    const invalidTokens = [];

    results.forEach((result, i) => {
      if ( !result.error ) return;

      console.error('Failure sending notification to', tokensWithKey[i].token, result.error);
      
      switch(result.error.code) {
        case "messaging/invalid-registration-token":
        case "messaging/registration-token-not-registered":
          invalidTokens.push( admin.database().ref('/tokens').child(tokensWithKey[i].key).remove() );
          break;
        default:
          break;
      }
    });

    return Promise.all(invalidTokens);
  }

  return admin.database().ref('/tokens').once('value').then((data) => {
    
    if ( !data.val() ) return;

    const snapshot = data.val();
    const tokensWithKey = [];
    const tokens = [];

    for (let key in snapshot) {
      tokens.push( snapshot[key].token );
      tokensWithKey.push({
        token: snapshot[key].token,
        key: key
      });
    }

    return admin.messaging().sendToDevice(tokens, payload)
      .then((response) => cleanInvalidTokens(tokensWithKey, response.results))
      .then(() => admin.database().ref('/notifications').child(NOTIFICATION_SNAPSHOT.key).remove())
  });


});
