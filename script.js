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

// نظام الـ Modal
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
    if(confirm && currentCallback) currentCallback(val);
    currentCallback = null;
}

function selectChair(name) {
    currentUser = name;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = name;
    updateUserTotal();
}

function openAttendance() {
    openCustomModal("اسم الموظف للحضور:", false, (val) => {
        if(val) {
            attendance.push({ name: val, ts: new Date().getTime() });
            localStorage.setItem('mosad_att', JSON.stringify(attendance));
            alert("تم تسجيل الحضور ✅");
        }
    });
}

function openAdminAuth() {
    openCustomModal("باسورد الإدارة", true, (val) => {
        if(val === adminPass) { showScreen('admin-screen'); renderAdminStats(); }
        else alert("خطأ!");
    });
}

function saveData() {
    let amt = document.getElementById('amount').value;
    if (!amt) return alert("ادخل المبلغ!");
    db.push({ chair: currentUser, customer: document.getElementById('cust-name').value || "عميل", price: parseFloat(amt), time: new Date().getTime() });
    localStorage.setItem('mosad_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم الحفظ ✅");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const dMs = 86400000;
    const calc = (days) => db.filter(r => (now - r.time) < (days * dMs)).reduce((s, r) => s + r.price, 0);

    // إيرادات عامة
    document.getElementById('admin-stats').innerHTML = `
        <div class="report-card gold-border"><h3>اليوم</h3><span>${calc(1)}ج</span></div>
        <div class="report-card"><h3>أسبوع</h3><span>${calc(7)}ج</span></div>
        <div class="report-card"><h3>شهر</h3><span>${calc(30)}ج</span></div>
        <div class="report-card"><h3>سنة</h3><span>${calc(365)}ج</span></div>
    `;

    // تقارير الكراسي المفصلة مع زر الحذف
    let chairsHtml = "";
    chairs.forEach(c => {
        const chairData = db.filter(r => r.chair === c);
        const getSum = (days) => chairData.filter(r => (now - r.time) < (days * dMs)).reduce((s, r) => s + r.price, 0);
        
        chairsHtml += `
            <div class="chair-detail-card">
                <div style="display:flex; justify-content:space-between">
                    <strong style="color:var(--gold)">${c}</strong>
                    <button onclick="removeChair('${c}')" class="btn-del">❌ حذف الكرسي</button>
                </div>
                <div class="chair-stats-row">
                    <div><small>يومي</small><br><span>${getSum(1)}</span></div>
                    <div><small>أسبوعي</small><br><span>${getSum(7)}</span></div>
                    <div><small>شهري</small><br><span>${getSum(30)}</span></div>
                    <div><small>سنوي</small><br><span>${getSum(365)}</span></div>
                </div>
                <button class="print-mini" onclick="printSingleChair('${c}')">🖨️ طباعة تقرير ${c}</button>
            </div>
        `;
    });
    document.getElementById('chairs-reports').innerHTML = chairsHtml;

    // فصل السجلات
    document.getElementById('money-log').innerHTML = db.slice(-10).reverse().map(l => `
        <div class="log-entry">💰 ${l.chair}: ${l.price}ج <small>${new Date(l.time).toLocaleTimeString('ar-EG')}</small></div>
    `).join('');

    document.getElementById('att-log').innerHTML = attendance.slice(-10).reverse().map(l => `
        <div class="log-entry">🕒 ${l.name} <small>${new Date(l.ts).toLocaleTimeString('ar-EG')}</small></div>
    `).join('');
}

function removeChair(name) {
    if(confirm(`هل أنت متأكد من حذف ${name}؟`)) {
        chairs = chairs.filter(c => c !== name);
        localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
        renderChairs();
        renderAdminStats();
    }
}

function printSingleChair(name) {
    const originalContent = document.body.innerHTML;
    const chairBox = Array.from(document.querySelectorAll('.chair-detail-card')).find(el => el.innerText.includes(name));
    document.body.innerHTML = `<h1>تقرير: ${name}</h1>` + chairBox.innerHTML;
    window.print();
    location.reload();
}

function addNewChair() {
    openCustomModal("اسم الكرسي الجديد", false, (val) => {
        if(val) { chairs.push(val); localStorage.setItem('mosad_chairs', JSON.stringify(chairs)); renderChairs(); renderAdminStats(); }
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
