/* eslint-disable consistent-return */
/* eslint-disable promise/no-nesting */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotifications = functions.database.ref('/notifications/{notificationId}').onWrite(async (change) => {
  if (!change.after) return;

  const NOTIFICATION_SNAPSHOT = change.after;
  const projectId = admin.instanceId().app.options.projectId;

  const payload = {
    notification: {
      title: `New message from  ${NOTIFICATION_SNAPSHOT.val().user}`,
      body: NOTIFICATION_SNAPSHOT.val().message,
      icon: NOTIFICATION_SNAPSHOT.val().userImage,
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

  // eslint-disable-next-line consistent-return
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
        return admin.database().ref('/notifications').child(NOTIFICATION_SNAPSHOT.key).remove()
      })
      .then(res => console.log('Successfully sent message:', res))
      .catch(error => console.log('Error sending message:', error));
  });
});