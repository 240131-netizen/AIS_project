// main.js - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ

// ==================== КОНФИГУРАЦИЯ FIREBASE ====================
// ВСТАВЬТЕ СВОИ ДАННЫЕ ИЗ КОНСОЛИ FIREBASE
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
let currentChart = null;

// DOM элементы
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const authError = document.getElementById('auth-error');

// Формы
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');

// ==================== АВТОРИЗАЦИЯ: ПЕРЕКЛЮЧЕНИЕ ФОРМ ====================
if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        authError.textContent = '';
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
        authError.textContent = '';
    });
}

// ==================== АВТОРИЗАЦИЯ: РЕГИСТРАЦИЯ ====================
document.getElementById('register-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    if (!email || !password) {
        authError.textContent = 'Заполните все поля';
        return;
    }
    
    if (password.length < 6) {
        authError.textContent = 'Пароль должен быть минимум 6 символов';
        return;
    }
    
    try {
        authError.textContent = 'Регистрация...';
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('✅ Регистрация успешна:', userCredential.user.email);
        // После успешной регистрации сразу входим
    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        authError.textContent = getRussianError(error.code);
    }
});

// ==================== АВТОРИЗАЦИЯ: ВХОД ====================
document.getElementById('login-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        authError.textContent = 'Заполните все поля';
        return;
    }
    
    try {
        authError.textContent = 'Вход...';
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Вход выполнен:', userCredential.user.email);
    } catch (error) {
        console.error('❌ Ошибка входа:', error);
        authError.textContent = getRussianError(error.code);
    }
});

// ==================== ВЫХОД ====================
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('✅ Выход выполнен');
    } catch (error) {
        console.error('❌ Ошибка выхода:', error);
    }
});

// ==================== ОТСЛЕЖИВАНИЕ СОСТОЯНИЯ АВТОРИЗАЦИИ ====================
auth.onAuthStateChanged((user) => {
    if (user) {
        // Пользователь вошел
        currentUser = user;
        authSection.style.display = 'none';
        appSection.style.display = 'block';
        console.log('👤 Пользователь:', user.email);
        
        // Загружаем главную страницу
        showPage('dashboard');
        loadDashboard();
    } else {
        // Пользователь вышел
        currentUser = null;
        authSection.style.display = 'flex';
        appSection.style.display = 'none';
        console.log('👋 Пользователь вышел');
    }
});

// ==================== НАВИГАЦИЯ ====================
const navLinks = document.querySelectorAll('.nav-link');
const pages = {
    dashboard: document.getElementById('dashboard-page'),
    income: document.getElementById('income-page'),
    expense: document.getElementById('expense-page'),
    analytics: document.getElementById('analytics-page')
};

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
        
        // Загружаем данные для страницы
        if (page === 'dashboard') loadDashboard();
        if (page === 'income') loadIncomes();
        if (page === 'expense') loadExpenses();
        if (page === 'analytics') loadAnalytics();
    });
});

function showPage(pageName) {
    // Скрываем все страницы
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove('active');
    });
    
    // Показываем нужную
    if (pages[pageName]) pages[pageName].classList.add('active');
    
    // Обновляем активную ссылку
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
}

// ==================== ПЕРЕВОД ОШИБОК ====================
function getRussianError(code) {
    const errors = {
        'auth/invalid-email': 'Неверный формат email',
        'auth/user-disabled': 'Аккаунт заблокирован',
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль',
        'auth/email-already-in-use': 'Email уже используется',
        'auth/weak-password': 'Пароль слишком простой (минимум 6 символов)',
        'auth/network-request-failed': 'Ошибка сети. Проверьте интернет'
    };
    return errors[code] || 'Ошибка: ' + code;
}

// ==================== РАБОТА С ДАННЫМИ ====================
async function addTransaction(type, data) {
    if (!currentUser) return;
    
    const transaction = {
        ...data,
        type: type,
        createdAt: new Date().toISOString()
    };
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('transactions')
            .add(transaction);
        
        console.log('✅ Транзакция добавлена');
        return true;
    } catch (error) {
        console.error('❌ Ошибка добавления:', error);
        return false;
    }
}

async function getTransactions() {
    if (!currentUser) return [];
    
    try {
        const snapshot = await db.collection('users')
            .doc(currentUser.uid)
            .collection('transactions')
            .orderBy('createdAt', 'desc')
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        return [];
    }
}

// ==================== ФОРМА ДОХОДОВ ====================
document.getElementById('income-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('income-amount').value);
    const date = document.getElementById('income-date').value;
    const source = document.getElementById('income-source').value;
    
    if (amount <= 0) {
        alert('Сумма должна быть больше 0');
        return;
    }
    
    const success = await addTransaction('income', { amount, date, source });
    
    if (success) {
        document.getElementById('income-form').reset();
        loadIncomes();
        loadDashboard();
    }
});

// ==================== ФОРМА РАСХОДОВ ====================
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;
    
    if (amount <= 0) {
        alert('Сумма должна быть больше 0');
        return;
    }
    
    const success = await addTransaction('expense', { amount, date, category });
    
    if (success) {
        document.getElementById('expense-form').reset();
        loadExpenses();
        loadDashboard();
    }
});

// ==================== ЗАГРУЗКА ДАННЫХ ====================
async function loadDashboard() {
    const transactions = await getTransactions();
    
    // Расчет баланса
    const total = transactions.reduce((sum, t) => {
        return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);
    
    document.getElementById('total-balance').textContent = 
        total.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
    
    // Последние операции
    const recentList = document.getElementById('recent-transactions');
    const recent = transactions.slice(0, 5);
    
    if (recent.length === 0) {
        recentList.innerHTML = '<p style="text-align: center; color: #999;">Нет операций</p>';
    } else {
        recentList.innerHTML = recent.map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-title">
                        ${t.type === 'income' ? t.source : t.category}
                    </div>
                    <div class="transaction-meta">${t.date}</div>
                </div>
                <div class="transaction-amount ${t.type === 'income' ? 'income-amount' : 'expense-amount'}">
                    ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('ru-RU')} ₽
                </div>
            </div>
        `).join('');
    }
    
    // Мини-график
    updateChart(transactions);
}

async function loadIncomes() {
    const transactions = await getTransactions();
    const incomes = transactions.filter(t => t.type === 'income');
    
    const list = document.getElementById('income-list');
    
    if (incomes.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">Нет доходов</p>';
        return;
    }
    
    list.innerHTML = incomes.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${t.source}</div>
                <div class="transaction-meta">${t.date}</div>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="transaction-amount income-amount">
                    +${t.amount.toLocaleString('ru-RU')} ₽
                </div>
                <button class="delete-btn" onclick="deleteTransaction('${t.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function loadExpenses() {
    const transactions = await getTransactions();
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const list = document.getElementById('expense-list');
    
    if (expenses.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">Нет расходов</p>';
        return;
    }
    
    list.innerHTML = expenses.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-title">${t.category}</div>
                <div class="transaction-meta">${t.date}</div>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="transaction-amount expense-amount">
                    -${t.amount.toLocaleString('ru-RU')} ₽
                </div>
                <button class="delete-btn" onclick="deleteTransaction('${t.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

async function loadAnalytics() {
    const transactions = await getTransactions();
    updateChart(transactions, true);
    updateRecommendations(transactions);
    updateCategoryTable(transactions);
}

// ==================== ГРАФИКИ ====================
function updateChart(transactions, isMainChart = false) {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    const categories = ['Еда', 'Транспорт', 'Развлечения', 'Разное'];
    const totals = categories.map(cat => 
        expenses.filter(e => e.category === cat)
               .reduce((sum, e) => sum + e.amount, 0)
    );
    
    const ctx = document.getElementById(isMainChart ? 'main-pie-chart' : 'mini-pie-chart');
    if (!ctx) return;
    
    // Уничтожаем старый график
    if (currentChart) currentChart.destroy();
    
    const total = totals.reduce((a, b) => a + b, 0);
    
    if (total === 0) {
        // Нет данных
        return;
    }
    
    currentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: totals,
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#6b7280']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: isMainChart ? 'bottom' : 'right'
                }
            }
        }
    });
}

// ==================== РЕКОМЕНДАЦИИ ====================
function updateRecommendations(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    if (total === 0) {
        document.getElementById('detailed-recommendation').innerHTML = 
            '<p>Нет данных для анализа</p>';
        return;
    }
    
    const categories = ['Еда', 'Транспорт', 'Развлечения', 'Разное'];
    const recommendations = [];
    
    categories.forEach(cat => {
        const catTotal = expenses.filter(e => e.category === cat)
                                 .reduce((sum, e) => sum + e.amount, 0);
        const percent = (catTotal / total) * 100;
        
        if (percent > 40) {
            recommendations.push(`⚠️ Внимание! Расходы на "${cat}" составляют ${percent.toFixed(1)}% от всех расходов. Рекомендуется сократить.`);
        }
    });
    
    const box = document.getElementById('detailed-recommendation');
    if (recommendations.length === 0) {
        box.innerHTML = '<p style="color: #10b981;">✅ Отличная работа! Все категории расходов в норме.</p>';
    } else {
        box.innerHTML = recommendations.map(r => `<p>${r}</p>`).join('');
    }
}

function updateCategoryTable(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    if (total === 0) {
        document.getElementById('category-breakdown-table').innerHTML = '';
        return;
    }
    
    const categories = ['Еда', 'Транспорт', 'Развлечения', 'Разное'];
    
    let html = '<table class="breakdown-table">';
    
    categories.forEach(cat => {
        const catTotal = expenses.filter(e => e.category === cat)
                                 .reduce((sum, e) => sum + e.amount, 0);
        const percent = total > 0 ? (catTotal / total) * 100 : 0;
        
        html += `
            <tr>
                <td><span class="category-badge">${cat}</span></td>
                <td style="text-align: right;">${catTotal.toLocaleString('ru-RU')} ₽</td>
                <td style="text-align: right; font-weight: 600; color: ${percent > 40 ? '#ef4444' : '#10b981'}">
                    ${percent.toFixed(1)}%
                </td>
            </tr>
        `;
    });
    
    html += '</table>';
    document.getElementById('category-breakdown-table').innerHTML = html;
}

// ==================== УДАЛЕНИЕ ====================
window.deleteTransaction = async function(id) {
    if (!currentUser || !confirm('Удалить операцию?')) return;
    
    try {
        await db.collection('users')
            .doc(currentUser.uid)
            .collection('transactions')
            .doc(id)
            .delete();
        
        console.log('✅ Удалено');
        
        // Перезагружаем текущую страницу
        const activePage = document.querySelector('.page.active');
        if (activePage.id === 'income-page') loadIncomes();
        if (activePage.id === 'expense-page') loadExpenses();
        loadDashboard();
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
    }
};

// ==================== УСТАНОВКА ДАТЫ ПО УМОЛЧАНИЮ ====================
const today = new Date().toISOString().split('T')[0];
document.getElementById('income-date').value = today;
document.getElementById('expense-date').value = today;

console.log('🚀 Приложение готово к работе!');
