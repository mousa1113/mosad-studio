let db = JSON.parse(localStorage.getItem('mosad_v3_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_v3_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_v3_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let adminPass = localStorage.getItem('mosad_v3_pass') || '5050';
let currentUser = "";

window.onload = () => {
    setInterval(() => {
        document.getElementById('digital-clock').innerText = new Date().toLocaleTimeString('ar-EG');
    }, 1000);
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

// نظام المودال للطلبات
let modalCallback = null;
function openModal(title, isPass, cb) {
    document.getElementById('modal-title').innerText = title;
    const inp = document.getElementById('modal-input');
    inp.type = isPass ? "password" : "text"; inp.value = "";
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('custom-modal').style.display = 'block';
    modalCallback = cb;
    setTimeout(() => inp.focus(), 100);
}

function closeModal(confirm) {
    const val = document.getElementById('modal-input').value;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('custom-modal').style.display = 'none';
    if(confirm && modalCallback) modalCallback(val);
}

// التحكم في الخزنة
function askAdminPass() {
    openModal("ادخل كلمة سر الخزنة", true, (val) => {
        if(val === adminPass) {
            document.getElementById('main-content-area').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            renderAdminStats();
        } else { alert("خطأ! كلمة السر غير صحيحة."); }
    });
}

function closeAdmin() {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('main-content-area').classList.remove('hidden');
}

// الكراسي والعمليات
function renderChairs() {
    document.getElementById('barbers-grid').innerHTML = chairs.map(c => `
        <div class="barber-item" onclick="selectChair('${c}')">💺<br><b>${c}</b></div>
    `).join('');
}

function selectChair(name) {
    currentUser = name;
    document.getElementById('active-user-name').innerText = "العمل الحالي: " + name;
    showScreen('work-screen');
    updateUserTotal();
}

function saveData() {
    const amt = document.getElementById('amount').value;
    if(!amt) return alert("ادخل المبلغ أولاً!");
    const entry = {
        chair: currentUser,
        customer: document.getElementById('cust-name').value || "زبون",
        price: parseFloat(amt),
        time: new Date().getTime(),
        timeStr: new Date().toLocaleTimeString('ar-EG')
    };
    db.push(entry);
    localStorage.setItem('mosad_v3_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("تم الحفظ في الخزنة بنجاح ✅");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const d = 86400000;
    const calc = (days) => db.filter(r => (now - r.time) < (days * d)).reduce((a, b) => a + b.price, 0);

    document.getElementById('s-day').innerText = calc(1) + " ج";
    document.getElementById('s-week').innerText = calc(7) + " ج";
    document.getElementById('s-month').innerText = calc(30) + " ج";
    document.getElementById('s-year').innerText = calc(365) + " ج";

    document.getElementById('money-log').innerHTML = db.slice(-20).reverse().map(l => `
        <div class="log-line"><span>${l.chair}: ${l.price}ج</span> <small>${l.timeStr}</small></div>
    `).join('');

    document.getElementById('att-log').innerHTML = att.slice(-20).reverse().map(l => `
        <div class="log-line"><span>${l.name}</span> <small>${l.timeStr}</small></div>
    `).join('');
}

// تصفير السجلات
function resetLogs(type) {
    if(confirm("سيتم مسح البيانات نهائياً، هل أنت متأكد؟")) {
        if(type === 'money') { db = []; localStorage.setItem('mosad_v3_db', JSON.stringify(db)); }
        else { att = []; localStorage.setItem('mosad_v3_att', JSON.stringify(att)); }
        renderAdminStats();
    }
}

// البصمة
function openAttendance() {
    openModal("اسم الموظف للحضور", false, (val) => {
        if(val) {
            att.push({ name: val, timeStr: new Date().toLocaleTimeString('ar-EG'), time: new Date().getTime() });
            localStorage.setItem('mosad_v3_att', JSON.stringify(att));
            alert("تم تسجيل الحضور يا " + val);
        }
    });
}

function addNewChair() {
    openModal("اسم الكرسي الجديد", false, (val) => {
        if(val) { chairs.push(val); localStorage.setItem('mosad_v3_chairs', JSON.stringify(chairs)); renderChairs(); }
    });
}

function showScreen(id) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('work-screen').classList.add('hidden');
    document.getElementById(id).classList.remove('hidden');
}

function toggleTheme(init=false) {
    if(!init) document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === today).reduce((a, b) => a + b.price, 0);
    document.getElementById('u-today').innerText = sum;
}
