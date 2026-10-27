// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA_UwCMUr8VSVDpjDTljI9V6Hps4vc8psI",
    authDomain: "snp-doctool.firebaseapp.com",
    projectId: "snp-doctool",
    storageBucket: "snp-doctool.firebasestorage.app",
    messagingSenderId: "62129492623",
    appId: "1:62129492623:web:0827526e6834ce0df4d6fa",
    measurementId: "G-292W7ZPB3L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);