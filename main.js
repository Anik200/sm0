// 🔧 Update this with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

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
