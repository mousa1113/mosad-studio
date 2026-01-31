let db = JSON.parse(localStorage.getItem('mosad_ultra_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_ultra_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_ultra_chairs')) || ["كرسي 1", "كرسي 2"];
let adminPass = localStorage.getItem('mosad_ultra_pass') || '5050';

window.onload = () => {
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

function toggleTheme(init = false) {
    if(!init) document.body.classList.toggle('light-theme');
    const isL = document.body.classList.contains('light-theme');
    document.getElementById('theme-icon').innerText = isL ? "☀️" : "🌙";
    localStorage.setItem('theme', isL ? 'light' : 'dark');
}

let modalCb = null;
function openModal(title, icon, isPass, cb) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-icon').innerText = icon;
    const inp = document.getElementById('modal-input');
    inp.type = isPass ? "password" : "text"; inp.value = "";
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('custom-modal').classList.add('active');
    modalCb = cb;
    setTimeout(() => inp.focus(), 500);
}

function closeModal(confirm) {
    const v = document.getElementById('modal-input').value;
    document.getElementById('custom-modal').classList.remove('active');
    setTimeout(() => {
        document.getElementById('modal-overlay').style.display = 'none';
        if(confirm && modalCb) modalCb(v);
    }, 400);
}

function selectChair(c) {
    currentUser = c;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = "العمل على " + c;
    updateUserTotal();
}

function saveData() {
    const a = document.getElementById('amount').value;
    if(!a) return alert("اكتب المبلغ!");
    db.push({ chair: currentUser, price: parseFloat(a), time: new Date().getTime() });
    localStorage.setItem('mosad_ultra_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم الحفظ ✅");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const d = 86400000;
    const getSum = (days) => db.filter(r => (now - r.time) < (days * d)).reduce((a, b) => a + b.price, 0);

    document.getElementById('admin-stats').innerHTML = `
        <div class="barber-item">اليوم<br><b>${getSum(1)}</b></div>
        <div class="barber-item">أسبوع<br><b>${getSum(7)}</b></div>
    `;

    document.getElementById('money-log').innerHTML = db.slice(-10).reverse().map(l => `<div>💰 ${l.chair}: ${l.price}ج</div>`).join('');
    document.getElementById('att-log').innerHTML = att.slice(-10).reverse().map(l => `<div>🕒 ${l.name}</div>`).join('');
}

// التصفير المصلح
function resetLogs(type) {
    openModal("اكتب الباسورد للتصفير", "⚠️", true, (v) => {
        if(v === adminPass) {
            if(type === 'money') { db = []; localStorage.setItem('mosad_ultra_db', JSON.stringify(db)); }
            else { att = []; localStorage.setItem('mosad_ultra_att', JSON.stringify(att)); }
            renderAdminStats();
            alert("تم التصفير!");
        } else { alert("غلط!"); }
    });
}

// باقي الوظائف (فتح الإدارة، البصمة، إضافة كراسي بنفس السيستم)
function openAdminAuth() { openModal("منطقة الإدارة", "🛡️", true, (v) => { if(v === adminPass) { showScreen('admin-screen'); renderAdminStats(); } }); }
function openAttendance() { openModal("سجل حضورك", "🕒", false, (v) => { if(v) { att.push({ name: v, time: new Date().getTime() }); localStorage.setItem('mosad_ultra_att', JSON.stringify(att)); alert("تم!"); } }); }
function renderChairs() { document.getElementById('barbers-grid').innerHTML = chairs.map(c => `<div class="barber-item" onclick="selectChair('${c}')">💺<br>${c}</div>`).join(''); }
function showScreen(id) { document.querySelectorAll('.main-content').forEach(s => s.classList.add('hidden')); document.getElementById(id).classList.remove('hidden'); }
function updateUserTotal() { let day = new Date().toDateString(); let s = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === day).reduce((a, b) => a + b.price, 0); document.getElementById('u-today').innerText = s; }
