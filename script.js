let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let attendance = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('mosad_admin_p') || '5050';

let currentUser = "";
let modalCallback = null;

// تشغيل عند البداية
window.onload = () => renderChairs();

function renderChairs() {
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = "";
    chairs.forEach(c => {
        grid.innerHTML += `<div class="barber-item" onclick="selectChair('${c}')"><h3>${c}</h3></div>`;
    });
}

// نظام الـ Modal الكريتيف
function showCreativeInput(title, isPassword, callback) {
    const modal = document.getElementById('custom-modal');
    const overlay = document.getElementById('modal-overlay');
    const input = document.getElementById('modal-input');
    
    document.getElementById('modal-title').innerText = title;
    input.type = isPassword ? "password" : "text";
    input.value = "";
    
    modal.classList.add('active');
    overlay.style.display = 'block';
    modalCallback = callback;
    input.focus();
}

function closeModal(confirm) {
    const val = document.getElementById('modal-input').value;
    document.getElementById('custom-modal').classList.remove('active');
    document.getElementById('modal-overlay').style.display = 'none';
    if(confirm && modalCallback) modalCallback(val);
}

// وظائف الكراسي
function selectChair(name) {
    currentUser = name;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = "العمل على " + name;
    updateUserTotal();
}

function saveData() {
    let amt = document.getElementById('amount').value;
    let cName = document.getElementById('cust-name').value;
    if (!amt) return alert("ادخل المبلغ!");

    db.push({ chair: currentUser, customer: cName || "عميل", price: parseFloat(amt), time: new Date().getTime() });
    localStorage.setItem('mosad_db', JSON.stringify(db));
    
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("تم الحفظ بنجاح!");
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === today)
                .reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

// تسجيل الحضور (البصمة)
function openAttendance() {
    showCreativeInput("سجل اسمك يا بطل (حضور):", false, (val) => {
        if(val) {
            attendance.push({ name: val, time: new Date().toLocaleString('ar-EG'), ts: new Date().getTime() });
            localStorage.setItem('mosad_att', JSON.stringify(attendance));
            alert("تم تسجيل حضورك بنجاح ✅");
        }
    });
}

// لوحة الإدارة
function openAdminAuth() {
    showCreativeInput("باسورد المدير 👑", true, (val) => {
        if(val === adminPass) {
            showScreen('admin-screen');
            renderAdminStats();
        } else { alert("الباسورد غلط!"); }
    });
}

function renderAdminStats() {
    const now = new Date().getTime();
    const dMs = 86400000;
    const calc = (days) => db.filter(r => (now - r.time) < (days * dMs)).reduce((s, r) => s + r.price, 0);
    
    let html = `
        <div class="report-card gold-border"><h3>إيراد اليوم</h3><span>${calc(1)} ج</span></div>
        <div class="report-card"><h3>آخر أسبوع</h3><span>${calc(7)} ج</span></div>
        <div class="report-card"><h3>آخر 14 يوم</h3><span>${calc(14)} ج</span></div>
        <div class="report-card"><h3>آخر 60 يوم</h3><span>${calc(60)} ج</span></div>
    `;

    chairs.forEach(c => {
        let d = db.filter(r => r.chair === c && (now - r.time) < dMs).reduce((s, r) => s + r.price, 0);
        let w = db.filter(r => r.chair === c && (now - r.time) < (7 * dMs)).reduce((s, r) => s + r.price, 0);
        html += `<div class="report-card"><h3>${c}</h3><small>يوم: ${d} | أسبوع: ${w}</small></div>`;
    });
    document.getElementById('admin-stats').innerHTML = html;

    let logs = [
        ...db.map(x => ({...x, type:'m'})),
        ...attendance.map(x => ({...x, type:'a'}))
    ].sort((a,b) => (b.time || b.ts) - (a.time || a.ts));

    document.getElementById('log-body').innerHTML = logs.slice(0, 30).map(l => 
        `<div class="log-item" style="border-bottom:1px solid #222; padding:8px; font-size:0.8rem">
            ${l.type === 'm' ? `💰 ${l.chair}: ${l.price}ج` : `🕒 حضور: ${l.name}`}
            <span style="float:left; color:#666">${new Date(l.time || l.ts).toLocaleTimeString('ar-EG')}</span>
        </div>`
    ).join('');
}

function addNewChair() {
    showCreativeInput("اسم الكرسي الجديد:", false, (val) => {
        if(val) { chairs.push(val); localStorage.setItem('mosad_chairs', JSON.stringify(chairs)); renderChairs(); }
    });
}

function changeAdminPass() {
    showCreativeInput("الباسورد الجديد:", true, (val) => {
        if(val) { adminPass = val; localStorage.setItem('mosad_admin_p', val); alert("تم التغيير!"); }
    });
}

function showScreen(id) {
    document.querySelectorAll('.section-box').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
