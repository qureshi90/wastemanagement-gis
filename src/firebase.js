// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD1n66YIUKORKvhNyuHTWC0R0iek23gdJc',
  authDomain: 'wastemanagement-3294e.firebaseapp.com',
  projectId: 'wastemanagement-3294e',
  storageBucket: 'wastemanagement-3294e.appspot.com',
  messagingSenderId: '121874973371',
  appId: '1:121874973371:web:717732acfd4cea9c9d1f9e',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
