# WebPushFirebase

A simple Firebase messaging application to send notifications to everyone subscribed.

## Usage

* Create a Firebase account and start a new project.
* Enable Google authentication provider by going to Authentication > Sign-in method and enabling Google as provider
* Updated `firebase-messaging-sw.js` in repo with you projects configuration. [apiKey, authDomain, databaseURL, messagingSenderId]
* Run:
```
firebase login && firebase serve
```

## Technologies

* Firebase Javascript SDK
* ES6
* CSS


## What I Learned

* Firebase CLI
* Firebase Authentication
* Realtime Database Triggers
* Firebase Hosting
* Firebase Functions