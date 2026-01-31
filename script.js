let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('mosad_admin_p') || '5050';

window.onload = () => {
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

function toggleTheme(init = false) {
    const body = document.body;
    if(!init) body.classList.toggle('light-theme');
    const isLight = body.classList.contains('light-theme');
    document.getElementById('theme-btn').innerText = isLight ? "☀️" : "🌙";
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// نظام الـ Creative Modal المحسن
let modalCallback = null;
function openModal(title, icon, isPass, callback) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-icon').innerText = icon;
    const input = document.getElementById('modal-input');
    input.type = isPass ? "password" : "text";
    input.value = "";
    
    document.getElementById('modal-overlay').style.display = 'block';
    const m = document.getElementById('custom-modal');
    m.style.display = 'block';
    setTimeout(() => m.classList.add('active'), 10);
    
    modalCallback = callback;
    input.focus();
}

function closeModal(confirm) {
    const val = document.getElementById('modal-input').value;
    const m = document.getElementById('custom-modal');
    m.classList.remove('active');
    setTimeout(() => {
        m.style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
        if(confirm && modalCallback) modalCallback(val);
    }, 200);
}

// الوظائف
function openAdminAuth() {
    openModal("منطقة الإدارة 🔐", "🛡️", true, (val) => {
        if(val === adminPass) { showScreen('admin-screen'); renderAdminStats(); }
        else alert("خطأ في الباسورد!");
    });
}

function openAttendance() {
    openModal("تسجيل حضور 🕒", "👤", false, (val) => {
        if(val) {
            att.push({ name: val, time: new Date().getTime() });
            localStorage.setItem('mosad_att', JSON.stringify(att));
            alert("تم تسجيل حضورك يا " + val);
        }
    });
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
    alert("تم الحفظ ✅");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const dMs = 86400000;
    const getS = (days) => db.filter(r => (now - r.time) < (days * dMs)).reduce((a, b) => a + b.price, 0);

    document.getElementById('admin-stats').innerHTML = `
        <div class="barber-item">اليوم<br><b>${getS(1)}ج</b></div>
        <div class="barber-item">أسبوع<br><b>${getS(7)}ج</b></div>
    `;

    document.getElementById('money-log').innerHTML = db.slice(-15).reverse().map(l => `<div>💰 ${l.chair}: ${l.price}ج</div>`).join('');
    document.getElementById('att-log').innerHTML = att.slice(-15).reverse().map(l => `<div>🕒 ${l.name}</div>`).join('');
}

// تصفير السجلات (كل واحد لوحده)
function resetLogs(type) {
    if(!confirm("هل أنت متأكد من المسح؟ لا يمكن التراجع!")) return;
    if(type === 'money') { db = []; localStorage.setItem('mosad_db', JSON.stringify(db)); }
    else { att = []; localStorage.setItem('mosad_att', JSON.stringify(att)); }
    renderAdminStats();
    alert("تم تصفير السجل بنجاح.");
}

function printCustomRange() {
    const from = new Date(document.getElementById('date-from').value).getTime();
    const to = new Date(document.getElementById('date-to').value).setHours(23,59,59);
    if(!from || !to) return alert("حدد التاريخ!");
    const filtered = db.filter(r => r.time >= from && r.time <= to);
    const total = filtered.reduce((a, b) => a + b.price, 0);
    const win = window.open('', '', 'width=700,height=700');
    win.document.write(`<div style="direction:rtl; padding:20px;"><h2>تقرير الاستوديو</h2><hr>${filtered.map(r => `<div>${r.chair}: ${r.price}ج</div>`).join('')}<hr><h3>الإجمالي: ${total}ج</h3></div>`);
    win.print();
}

function addNewChair() {
    openModal("اسم الكرسي الجديد", "💺", false, (val) => {
        if(val) { chairs.push(val); localStorage.setItem('mosad_chairs', JSON.stringify(chairs)); renderChairs(); renderAdminStats(); }
    });
}

function showScreen(id) {
    document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function updateUserTotal() {
    let day = new Date().toDateString();
    let s = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === day).reduce((a, b) => a + b.price, 0);
    document.getElementById('u-today').innerText = s;
}
