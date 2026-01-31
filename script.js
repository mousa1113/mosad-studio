let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('mosad_admin_p') || '5050';

window.onload = () => {
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

// تصليح الـ Light Mode
function toggleTheme(init = false) {
    const body = document.body;
    if(!init) body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    document.querySelector('#theme-btn .icon').innerText = isLight ? "☀️" : "🌙";
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// نظام الـ Creative Modal
let modalResolver = null;
function openModal(title, icon, isPass) {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-modal');
        const overlay = document.getElementById('modal-overlay');
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-icon').innerText = icon;
        const input = document.getElementById('modal-input');
        input.type = isPass ? "password" : "text";
        input.value = "";
        
        modal.style.display = 'block';
        overlay.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
        input.focus();
        modalResolver = resolve;
    });
}

function closeModal(confirm) {
    const val = document.getElementById('modal-input').value;
    const modal = document.getElementById('custom-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
        if(modalResolver) modalResolver(confirm ? val : null);
    }, 300);
}

// الوظائف
async function openAdminAuth() {
    const pass = await openModal("دخول منطقة الإدارة", "🛡️", true);
    if(pass === adminPass) {
        showScreen('admin-screen');
        renderAdminStats();
    } else if(pass !== null) alert("الباسورد خطأ!");
}

async function openAttendance() {
    const name = await openModal("سجل اسمك للحضور", "🕒", false);
    if(name) {
        att.push({ name, time: new Date().getTime() });
        localStorage.setItem('mosad_att', JSON.stringify(att));
        alert("تمت البصمة يا بطل ✅");
    }
}

function renderChairs() {
    document.getElementById('barbers-grid').innerHTML = chairs.map(c => 
        `<div class="barber-item" onclick="selectChair('${c}')">💺<br>${c}</div>`).join('');
}

function selectChair(c) {
    currentUser = c;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = "محطة: " + c;
    updateUserTotal();
}

function saveData() {
    const amt = document.getElementById('amount').value;
    if(!amt) return;
    db.push({ chair: currentUser, price: parseFloat(amt), time: new Date().getTime() });
    localStorage.setItem('mosad_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم الحفظ 💸");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const d = 86400000;
    const getS = (days) => db.filter(r => (now - r.time) < (days * d)).reduce((a, b) => a + b.price, 0);

    document.getElementById('admin-stats').innerHTML = `
        <div class="stat-box">اليوم<br><b>${getS(1)}</b></div>
        <div class="stat-box">أسبوع<br><b>${getS(7)}</b></div>
        <div class="stat-box">شهر<br><b>${getS(30)}</b></div>
        <div class="stat-box">سنة<br><b>${getS(365)}</b></div>
    `;

    document.getElementById('money-log').innerHTML = db.slice(-15).reverse().map(l => `<div>💰 ${l.chair}: ${l.price}ج</div>`).join('');
    document.getElementById('att-log').innerHTML = att.slice(-15).reverse().map(l => `<div>🕒 ${l.name}</div>`).join('');
}

function printCustomRange() {
    const from = new Date(document.getElementById('date-from').value).getTime();
    const to = new Date(document.getElementById('date-to').value).setHours(23,59,59);
    if(!from || !to) return alert("حدد التاريخ!");
    const filtered = db.filter(r => r.time >= from && r.time <= to);
    const total = filtered.reduce((a, b) => a + b.price, 0);
    const win = window.open('', '', 'width=700,height=700');
    win.document.write(`
        <div style="direction:rtl; font-family:Cairo; padding:30px; border:2px solid #d4af37;">
            <h2>تقرير Mosad Studio</h2>
            <p>الفترة من ${document.getElementById('date-from').value} إلى ${document.getElementById('date-to').value}</p>
            <hr>
            ${filtered.map(r => `<div>${r.chair}: ${r.price}ج - ${new Date(r.time).toLocaleString('ar-EG')}</div>`).join('')}
            <hr><h3>الإجمالي: ${total} جنيه</h3>
        </div>
    `);
    win.print();
}

function showScreen(id) {
    document.querySelectorAll('.module-bundle').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function updateUserTotal() {
    let day = new Date().toDateString();
    let s = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === day).reduce((a, b) => a + b.price, 0);
    document.getElementById('u-today').innerText = s;
}
