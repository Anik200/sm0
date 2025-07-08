// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8tySA3GMaT4GmxV__nVP08tvvzsuwq8Q",
  authDomain: "anik200.firebaseapp.com",
  projectId: "anik200",
  storageBucket: "anik200.firebasestorage.app",
  messagingSenderId: "344373537544",
  appId: "1:344373537544:web:9922babec146c310ab1abd",
  measurementId: "G-8Y2HZQZ3WS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// DOM elements
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authMsg = document.getElementById('auth-msg');
const textPost = document.getElementById('text-post');
const postTextBtn = document.getElementById('post-text-btn');
const fileInput = document.getElementById('file-input');
const postImageBtn = document.getElementById('post-image-btn');
const postsEl = document.getElementById('posts');

// Auth handlers
signupBtn.onclick = () => {
  const email = emailInput.value;
  const pass = passInput.value;
  auth.createUserWithEmailAndPassword(email, pass)
    .catch(err => (authMsg.innerText = err.message));
};
loginBtn.onclick = () => {
  const email = emailInput.value;
  const pass = passInput.value;
  auth.signInWithEmailAndPassword(email, pass)
    .catch(err => (authMsg.innerText = err.message));
};
logoutBtn.onclick = () => auth.signOut();

// Observe auth state
auth.onAuthStateChanged(user => {
  if (user) {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    loadPosts();
  } else {
    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    postsEl.innerHTML = '';
  }
});

// Post text
postTextBtn.onclick = () => {
  const user = auth.currentUser;
  if (!user) return alert('Login first');
  const text = textPost.value.trim();
  if (!text) return;
  db.collection('posts').add({
    uid: user.uid,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => textPost.value = '');
};

// Upload image
postImageBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert('Login first');
  const file = fileInput.files[0];
  if (!file) return alert('Choose a file');
  const path = `images/${user.uid}/${Date.now()}-${file.name}`;
  const snap = await storage.ref(path).put(file);
  const url = await snap.ref.getDownloadURL();
  await db.collection('posts').add({
    uid: user.uid,
    image: url,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
  fileInput.value = '';
};

// Load posts
function loadPosts() {
  db.collection('posts')
    .orderBy('timestamp', 'desc')
    .limit(20)
    .onSnapshot(snapshot => {
      postsEl.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement('div');
        div.classList.add('post');
        if (data.text) div.innerText = data.text;
        if (data.image) {
          const img = document.createElement('img');
          img.src = data.image;
          div.appendChild(img);
        }
        postsEl.appendChild(div);
      });
    });
}
