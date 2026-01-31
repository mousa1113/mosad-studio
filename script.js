// بيانات المحل
let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let attendance = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('mosad_admin_p') || '5050';

let currentUser = "";
let currentCallback = null;

window.onload = () => renderChairs();

function renderChairs() {
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = chairs.map(c => `
        <div class="barber-item" onclick="selectChair('${c}')">
            <div style="font-size:1.5rem">💺</div>
            <h3>${c}</h3>
        </div>
    `).join('');
}

// --- نظام الـ Modal الكريتيف (تم إصلاحه) ---
function openCustomModal(title, isPassword, callback) {
    const modal = document.getElementById('custom-modal');
    const overlay = document.getElementById('modal-overlay');
    const input = document.getElementById('modal-input');
    
    document.getElementById('modal-title').innerText = title;
    input.type = isPassword ? "password" : "text";
    input.value = "";
    
    modal.classList.add('active');
    overlay.style.display = 'block';
    currentCallback = callback;
    setTimeout(() => input.focus(), 100);
}

function closeModal(confirm) {
    const val = document.getElementById('modal-input').value;
    document.getElementById('custom-modal').classList.remove('active');
    document.getElementById('modal-overlay').style.display = 'none';
    
    if(confirm && currentCallback) {
        currentCallback(val);
    }
    currentCallback = null;
}

// --- وظائف التشغيل ---
function selectChair(name) {
    currentUser = name;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = name;
    updateUserTotal();
}

function openAttendance() {
    openCustomModal("سجل اسمك (حضور)", false, (val) => {
        if(val) {
            attendance.push({ name: val, ts: new Date().getTime() });
            localStorage.setItem('mosad_att', JSON.stringify(attendance));
            alert("تم تسجيل الحضور يا " + val);
        }
    });
}

function openAdminAuth() {
    openCustomModal("باسورد الإدارة", true, (val) => {
        if(val === adminPass) {
            showScreen('admin-screen');
            renderAdminStats();
        } else {
            alert("الباسورد خطأ!");
        }
    });
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
    alert("تم الحفظ ✅");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const dMs = 86400000;
    const calc = (days) => db.filter(r => (now - r.time) < (days * dMs)).reduce((s, r) => s + r.price, 0);
    
    // التقارير المطلوبة (يوم، أسبوع، 14 يوم، 60 يوم)
    let html = `
        <div class="report-card gold-border"><h3>اليوم</h3><span>${calc(1)}ج</span></div>
        <div class="report-card"><h3>أسبوع</h3><span>${calc(7)}ج</span></div>
        <div class="report-card"><h3>14 يوم</h3><span>${calc(14)}ج</span></div>
        <div class="report-card"><h3>60 يوم</h3><span>${calc(60)}ج</span></div>
    `;

    // تقرير لكل كرسي
    chairs.forEach(c => {
        let d = db.filter(r => r.chair === c && (now - r.time) < dMs).reduce((s, r) => s + r.price, 0);
        html += `<div class="report-card" style="border-right:1px solid var(--gold)"><h3>${c}</h3><span>${d}ج</span></div>`;
    });
    document.getElementById('admin-stats').innerHTML = html;

    // السجل المختلط
    let logs = [
        ...db.map(x => ({...x, type:'m'})),
        ...attendance.map(x => ({...x, type:'a'}))
    ].sort((a,b) => (b.time || b.ts) - (a.time || a.ts));

    document.getElementById('log-body').innerHTML = logs.slice(0, 20).map(l => `
        <div style="border-bottom:1px solid #222; padding:10px; font-size:0.8rem">
            ${l.type === 'm' ? `💰 ${l.chair}: ${l.price}ج` : `🕒 حضور: ${l.name}`}
            <span style="float:left; color:#666">${new Date(l.time || l.ts).toLocaleTimeString('ar-EG')}</span>
        </div>
    `).join('');
}

// وظائف إضافية
function addNewChair() {
    openCustomModal("اسم الكرسي الجديد", false, (val) => {
        if(val) { chairs.push(val); localStorage.setItem('mosad_chairs', JSON.stringify(chairs)); renderChairs(); }
    });
}

function changeAdminPass() {
    openCustomModal("الباسورد الجديد", true, (val) => {
        if(val) { adminPass = val; localStorage.setItem('mosad_admin_p', val); alert("تم التغيير ✅"); }
    });
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === today).reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

function showScreen(id) {
    document.querySelectorAll('.section-box').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}
