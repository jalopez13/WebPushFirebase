document.addEventListener('DOMContentLoaded', event => {
  const signinBtn = document.getElementById('signin');
  const signoutBtn = document.getElementById('signout');
  const FIREBASE_AUTH = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();

  // sign in
  signinBtn.addEventListener('click', function(event) {
    FIREBASE_AUTH.signInWithPopup(provider).then(function(res) {
      console.log(res);
    })
    .catch(err => console.log(err));
  });

  FIREBASE_AUTH.onAuthStateChanged(function(user) {
    if (user) {
      console.log(user);
      signinBtn.setAttribute('hidden', true);
      signoutBtn.removeAttribute('hidden');
    } else {
      console.log('Logged Out Mate!');
      signinBtn.removeAttribute('hidden');
      signoutBtn.setAttribute('hidden', true);
    }
  });

  // sign out
  signoutBtn.addEventListener('click', function() {
    FIREBASE_AUTH.signOut();
  });
});