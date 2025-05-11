// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBJgZP2WrRWYHLb5Z9bbUlXlEIK79SDls",
  authDomain: "my-project-7f1d9.firebaseapp.com",
  projectId: "my-project-7f1d9",
  storageBucket: "my-project-7f1d9.firebasestorage.app",
  messagingSenderId: "954526385432",
  appId: "1:954526385432:web:ed314ae224160ca166ca6d",
  measurementId: "G-VRV8MBX1EH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app);