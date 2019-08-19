/* eslint-disable consistent-return */
/* eslint-disable promise/no-nesting */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotifications = functions.database.ref('/notifications/{notificationId}').onWrite((change, context) => {
  // Only edit data when it is first created.
  if (change.before.exists()) {
    return null;
  }
  // Exit when the data is deleted.
  if (!change.after.exists()) {
    return null;
  }

  const NOTIFICATION_SNAPSHOT = change.after.val();
  const projectId = admin.instanceId().app.options.projectId;

  const payload = {
    notification: {
      title: `New message from  ${NOTIFICATION_SNAPSHOT.user}`,
      body: NOTIFICATION_SNAPSHOT.message,
      icon: NOTIFICATION_SNAPSHOT.userImage,
      click_action: `https://${projectId}.firebaseapp.com`
    }
  };

  var options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24
  };

  const clearInvalidTokens = (results, tokensWithKey) => {
    const invalidTokens = [];
    results.forEach((result, index) => {
      if (!result.error) return;

      console.error('Error with token: ', tokensWithKey[i].token);

      switch(result.error.code) {
        case 'messaging/invalid-registration-token':
          break;
        case 'messaging/registration-token-not-registered':
          invalidTokens.push(admin.database().ref('/tokens').child(tokensWithKey[i].key).remove());
          break;
        default:
          break;
      }
    });

    return Promise.all(invalidTokens);
  };

  return admin.database().ref('/tokens').once('value').then(data => {
      if (!data.val()) return;

      const snapshot = data.val();
      const tokens = [];
      const tokensWithKey = [];

      for (let key in snapshot) {
        tokens.push(snapshot[key].token);
        tokensWithKey.push({
          token: snapshot[key].token,
          key
        });
      }

      return admin.messaging().sendToDevice(tokens, payload, options)
      .then(res => clearInvalidTokens(res.results, tokensWithKey))
      .then(() => {
        return admin.database().ref('/notifications').child(context.params.notificationId).remove(); // fix!
      })
      .then(res => console.log('Successfully sent message:', res))
      .catch(error => console.log('Error sending message:', error));
  });
});
