// 1. Go to https://console.firebase.google.com, create a free project
//    (no credit card needed on the free "Spark" plan).
// 2. In your project, click the web icon (</>) to register a web app.
// 3. Firebase will show you a config object — copy the values into here.
// 4. Save this file and push it to GitHub along with everything else.
//
// These values are safe to make public — they identify your project,
// they are not secret keys. Access is controlled by Firestore Security
// Rules instead (see README.md).

// window.firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID",
// };


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATf1iXC-03LbTvQdZ7C9Tk54vkR8osL-s",
  authDomain: "for-a-stranger.firebaseapp.com",
  databaseURL: "https://for-a-stranger-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "for-a-stranger",
  storageBucket: "for-a-stranger.firebasestorage.app",
  messagingSenderId: "195222287285",
  appId: "1:195222287285:web:7d653e613d7664fe1a5ffc",
  measurementId: "G-HJN0CYN788"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
