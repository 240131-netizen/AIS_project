// main.js

// ==================== КОНФИГУРАЦИЯ FIREBASE ====================
// ЗАМЕНИТЕ ЭТИ ДАННЫЕ НА ВАШИ (из консоли Firebase -> Настройки проекта -> Ваше приложение)
const firebaseConfig = {
  apiKey: "AIzaSyBhSHEXNCcT4FAVcP8Q8Z6R9ziWvpY4UI4",
  authDomain: "aisproject-7e92c.firebaseapp.com",
  projectId: "aisproject-7e92c",
  storageBucket: "aisproject-7e92c.firebasestorage.app",
  messagingSenderId: "720865315578",
  appId: "1:720865315578:web:db81d3ece902847842d743",
  measurementId: "G-HC79CQ1XE4"
};


// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let currentUser = null;
let currentChart = null; // Для управления графиками

// DOM Элементы
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');

// ==================== АВТОРИЗАЦИЯ ====================
// Переключение между форма
