let db = JSON.parse(localStorage.getItem('mosad_final_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_final_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_final_chairs')) || ["الكرسي 1", "الكرسي 2"];
let adminPass = localStorage.getItem('mosad_final_pass') || '5050';

window.onload = () => {
    updateClock();
    setInterval(updateClock, 1000);
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

// الساعة الرقمية بالثانية
function updateClock() {
    const now = new Date();
    document.getElementById('digital-clock').innerText = now.toLocaleTimeString('ar-EG');
}

// فتح الخزنة (إخفاء كل شيء آخر)
function openAdmin() {
    openModal("باسورد الخزنة", "🛡️", true, (v) => {
        if(v === adminPass) {
            document.getElementById('main-app').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            renderAdminStats();
        } else { alert("غلط!"); }
    });
}

function closeAdmin() {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
}

// تسجيل العمليات بالساعة والدقيقة
function saveData() {
    const a = document.getElementById('amount').value;
    if(!a) return;
    db.push({ 
        chair: currentUser, 
        price: parseFloat(a), 
        time: new Date().getTime(),
        timeStr: new Date().toLocaleTimeString('ar-EG') 
    });
    localStorage.setItem('mosad_final_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم الحفظ بالساعة: " + new Date().toLocaleTimeString('ar-EG'));
}

function renderAdminStats() {
    const now = new Date().getTime();
    const d = 86400000;
    const calc = (days) => db.filter(r => (now - r.time) < (days * d)).reduce((a, b) => a + b.price, 0);

    document.getElementById('s-day').innerText = calc(1) + "ج";
    document.getElementById('s-week').innerText = calc(7) + "ج";
    document.getElementById('s-month').innerText = calc(30) + "ج";
    document.getElementById('s-year').innerText = calc(365) + "ج";

    document.getElementById('money-log').innerHTML = db.slice(-20).reverse().map(l => `
        <div class="log-item"><span>${l.chair}: ${l.price}ج</span> <small>${l.timeStr}</small></div>
    `).join('');

    document.getElementById('att-log').innerHTML = att.slice(-20).reverse().map(l => `
        <div class="log-item"><span>${l.name}</span> <small>${l.timeStr}</small></div>
    `).join('');
}

// نظام المودال
let modalCb = null;
function openModal(title, icon, isPass, cb) {
    document.getElementById('modal-title').innerText = title;
    const inp = document.getElementById('modal-input');
    inp.type = isPass ? "password" : "text"; inp.value = "";
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('custom-modal').classList.add('active');
    modalCb = cb;
}

function closeModal(confirm) {
    const v = document.getElementById('modal-input').value;
    document.getElementById('custom-modal').classList.remove('active');
    document.getElementById('modal-overlay').style.display = 'none';
    if(confirm && modalCb) modalCb(v);
}

// تصفير السجلات
function resetLogs(type) {
    if(confirm("تمسح السجل ده نهائياً؟")) {
        if(type === 'money') db = []; else att = [];
        localStorage.setItem('mosad_final_' + (type==='money'?'db':'att'), JSON.stringify([]));
        renderAdminStats();
    }
}

// وظائف مساعدة
function toggleTheme(init=false) {
    if(!init) document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme')?'light':'dark');
}
function renderChairs() { document.getElementById('barbers-grid').innerHTML = chairs.map(c => `<div class="barber-item" style="background:var(--card); padding:20px; border-radius:15px; border:1px solid var(--gold); cursor:pointer; text-align:center" onclick="selectChair('${c}')">💺<br>${c}</div>`).join(''); }
function selectChair(c) { currentUser = c; document.getElementById('login-screen').classList.add('hidden'); document.getElementById('work-screen').classList.remove('hidden'); document.getElementById('active-user').innerText = c; updateUserTotal(); }
function showScreen(id) { document.getElementById('work-screen').classList.add('hidden'); document.getElementById('login-screen').classList.remove('hidden'); }
function updateUserTotal() { let today = new Date().toDateString(); let s = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === today).reduce((a, b) => a + b.price, 0); document.getElementById('u-today').innerText = s; }
