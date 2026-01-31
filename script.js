let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('mosad_admin_p') || '5050';

window.onload = () => {
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme();
};

// تبديل الثيم
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// نظام المودال
let currentCallback = null;
function openCustomModal(title, isPass, callback) {
    const m = document.getElementById('custom-modal');
    document.getElementById('modal-title').innerText = title;
    const i = document.getElementById('modal-input');
    i.type = isPass ? "password" : "text"; i.value = "";
    m.classList.add('active');
    document.getElementById('modal-overlay').style.display = 'block';
    currentCallback = callback;
    i.focus();
}

function closeModal(confirm) {
    const v = document.getElementById('modal-input').value;
    document.getElementById('custom-modal').classList.remove('active');
    document.getElementById('modal-overlay').style.display = 'none';
    if(confirm && currentCallback) currentCallback(v);
}

// الوظائف الأساسية
function renderChairs() {
    document.getElementById('barbers-grid').innerHTML = chairs.map(c => 
        `<div class="barber-item" onclick="selectChair('${c}')">💺<br>${c}</div>`).join('');
}

function selectChair(c) {
    currentUser = c;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = "جهاز " + c;
    updateUserTotal();
}

function saveData() {
    let a = document.getElementById('amount').value;
    if(!a) return;
    db.push({ chair: currentUser, price: parseFloat(a), time: new Date().getTime() });
    localStorage.setItem('mosad_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم التسجيل ✅");
}

function updateUserTotal() {
    let day = new Date().toDateString();
    let s = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === day).reduce((acc, r) => acc + r.price, 0);
    document.getElementById('u-today').innerText = s;
}

// لوحة الإدارة والتقارير
function openAdminAuth() {
    openCustomModal("دخول المدير", true, (v) => {
        if(v === adminPass) { showScreen('admin-screen'); renderAdminStats(); }
    });
}

function renderAdminStats() {
    const now = new Date().getTime();
    const d = 86400000;
    const calc = (days) => db.filter(r => (now - r.time) < (days * d)).reduce((acc, r) => acc + r.price, 0);

    document.getElementById('admin-stats').innerHTML = `
        <div class="barber-item">يومي<br><b>${calc(1)}</b></div>
        <div class="barber-item">أسبوعي<br><b>${calc(7)}</b></div>
        <div class="barber-item">شهري<br><b>${calc(30)}</b></div>
        <div class="barber-item">سنوي<br><b>${calc(365)}</b></div>
    `;

    document.getElementById('chairs-detail-list').innerHTML = chairs.map(c => {
        let total = db.filter(r => r.chair === c).reduce((acc, r) => acc + r.price, 0);
        return `<div class="chair-row">
            <span>${c} (الإجمالي: ${total}ج)</span>
            <button class="btn-del" onclick="removeChair('${c}')">🗑️</button>
        </div>`;
    }).join('');

    document.getElementById('money-log').innerHTML = db.slice(-10).reverse().map(l => `<div>💰 ${l.chair}: ${l.price}ج</div>`).join('');
    document.getElementById('att-log').innerHTML = att.slice(-10).reverse().map(l => `<div>🕒 ${l.name}</div>`).join('');
}

// طباعة مخصصة (يومين، 3، أي فترة)
function printCustomRange() {
    const from = new Date(document.getElementById('date-from').value).getTime();
    const to = new Date(document.getElementById('date-to').value).setHours(23,59,59);

    if(!from || !to) return alert("حدد التاريخ الأول والأخير!");

    const filtered = db.filter(r => r.time >= from && r.time <= to);
    const total = filtered.reduce((acc, r) => acc + r.price, 0);

    const printWin = window.open('', '', 'width=600,height=600');
    printWin.document.write(`
        <div style="direction:rtl; font-family:Cairo, sans-serif; padding:20px;">
            <h2>تقرير إيرادات Mosad Studio</h2>
            <p>من: ${document.getElementById('date-from').value} إلى: ${document.getElementById('date-to').value}</p>
            <hr>
            ${filtered.map(r => `<div>${r.chair}: ${r.price}ج - ${new Date(r.time).toLocaleString('ar-EG')}</div>`).join('')}
            <hr>
            <h3>الإجمالي الكلي: ${total} جنيه</h3>
        </div>
    `);
    printWin.print();
}

function openAttendance() {
    openCustomModal("بصمة حضور", false, (v) => {
        if(v) { att.push({ name: v, time: new Date().getTime() }); localStorage.setItem('mosad_att', JSON.stringify(att)); alert("تمت البصمة"); }
    });
}

function removeChair(c) {
    if(confirm('حذف الكرسي؟')) {
        chairs = chairs.filter(x => x !== c);
        localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
        renderChairs(); renderAdminStats();
    }
}

function addNewChair() {
    openCustomModal("اسم الكرسي", false, (v) => {
        if(v) { chairs.push(v); localStorage.setItem('mosad_chairs', JSON.stringify(chairs)); renderChairs(); renderAdminStats(); }
    });
}

function showScreen(id) {
    document.querySelectorAll('.module-card').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
