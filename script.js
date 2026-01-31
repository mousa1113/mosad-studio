// استعادة البيانات
let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let attendance = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('mosad_admin_p') || '5050';

let currentUser = "";
let currentCallback = null;
let deferredPrompt; // متغير لحفظ حدث التثبيت

// عند تحميل الصفحة
window.onload = () => {
    renderChairs();
    
    // كود تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('Service Worker Ready'))
            .catch(err => console.log('SW Failed', err));
    }
};

// كود التعامل مع التثبيت (PWA Install)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // إظهار زر التثبيت
    document.getElementById('install-container').classList.remove('hidden');
});

async function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            document.getElementById('install-container').classList.add('hidden');
        }
        deferredPrompt = null;
    }
}

// باقي دوال النظام الأساسية
function renderChairs() {
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = chairs.map(c => `
        <div class="barber-item" onclick="selectChair('${c}')">
            <div style="font-size:2rem">💺</div>
            <h3>${c}</h3>
        </div>
    `).join('');
}

function selectChair(name) {
    currentUser = name;
    showScreen('work-screen');
    document.getElementById('active-user').innerText = name;
    updateUserTotal();
}

function saveData() {
    let amt = document.getElementById('amount').value;
    if (!amt) return alert("الرجاء إدخال المبلغ!");
    
    let now = new Date();
    db.push({
        chair: currentUser,
        customer: document.getElementById('cust-name').value || "عميل",
        price: parseFloat(amt),
        time: now.getTime(),
        dateStr: now.toLocaleDateString('ar-EG'),
        timeStr: now.toLocaleTimeString('ar-EG')
    });
    
    localStorage.setItem('mosad_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("✅ تم التسجيل");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const dMs = 86400000;
    const getSum = (days) => db.filter(r => (now - r.time) < (days * dMs)).reduce((s, r) => s + r.price, 0);

    document.getElementById('main-reports').innerHTML = `
        <div class="total-card"><h4>اليوم</h4><span class="val">${getSum(1)}ج</span><button class="btn-print-sm" onclick="printReport('اليوم', 1)">طباعة</button></div>
        <div class="total-card"><h4>الأسبوع</h4><span class="val">${getSum(7)}ج</span><button class="btn-print-sm" onclick="printReport('الأسبوع', 7)">طباعة</button></div>
        <div class="total-card"><h4>الشهر</h4><span class="val">${getSum(30)}ج</span><button class="btn-print-sm" onclick="printReport('الشهر', 30)">طباعة</button></div>
        <div class="total-card"><h4>السنة</h4><span class="val">${getSum(365)}ج</span><button class="btn-print-sm" onclick="printReport('السنة', 365)">طباعة</button></div>
    `;

    let chairsHtml = "";
    chairs.forEach((c, index) => {
        const chairData = db.filter(r => r.chair === c);
        const daily = chairData.filter(r => (now - r.time) < dMs).reduce((s,r) => s+r.price, 0);
        const delBtn = index > 2 ? `<button onclick="removeChair('${c}')" style="color:#ff4d4d; background:none; border:none; cursor:pointer;">❌</button>` : "";

        chairsHtml += `
            <div class="chair-detail-card">
                <div style="display:flex; justify-content:space-between;">
                    <strong style="color:var(--gold)">${c}</strong>
                    ${delBtn}
                </div>
                <p>اليوم: ${daily} ج</p>
                <button onclick="printChairReport('${c}')" class="btn-sm" style="width:100%;">🖨️ طباعة السجل</button>
            </div>`;
    });
    document.getElementById('chairs-reports').innerHTML = chairsHtml;

    document.getElementById('money-log').innerHTML = db.slice(-15).reverse().map(l => `
        <div class="log-entry">
            <span>${l.chair}</span> 
            <div>${l.price}ج <small style="color:#777">(${l.timeStr || '--'})</small></div>
        </div>
    `).join('');

    document.getElementById('att-log').innerHTML = attendance.slice(-15).reverse().map(l => `
        <div class="log-entry">🕒 ${l.name} <br> <small>${new Date(l.time).toLocaleString('ar-EG')}</small></div>
    `).join('');
}

function openPrintWindow(content) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>تقرير</title>
        <style>body{font-family:'Cairo';direction:rtl;padding:20px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #ddd;padding:5px;text-align:center}</style>
        </head><body><h2 style="text-align:center">Mosad Studio</h2>${content}</body></html>
    `);
    win.document.close();
    win.print();
}

function printReport(period, days) {
    const now = new Date().getTime();
    const data = db.filter(r => (now - r.time) < (days * 86400000));
    const total = data.reduce((s,r) => s+r.price, 0);
    openPrintWindow(`<h3>تقرير ${period} (الإجمالي: ${total}ج)</h3><table><tr><th>الكرسي</th><th>المبلغ</th><th>التاريخ</th></tr>${data.map(r=>`<tr><td>${r.chair}</td><td>${r.price}</td><td>${r.dateStr}</td></tr>`).join('')}</table>`);
}

function printChairReport(name) {
    const data = db.filter(r => r.chair === name);
    const total = data.reduce((s,r) => s+r.price, 0);
    openPrintWindow(`<h3>سجل ${name} (الإجمالي: ${total}ج)</h3><table><tr><th>العميل</th><th>المبلغ</th><th>التاريخ</th></tr>${data.map(r=>`<tr><td>${r.customer}</td><td>${r.price}</td><td>${r.dateStr}</td></tr>`).join('')}</table>`);
}

function resetAllData() {
    if(confirm("مسح كل البيانات؟")) {
        db = []; attendance = [];
        localStorage.setItem('mosad_db', JSON.stringify([]));
        localStorage.setItem('mosad_att', JSON.stringify([]));
        renderAdminStats();
    }
}

function openAttendance() {
    openCustomModal("اسم الموظف", false, (val) => {
        if(val) {
            attendance.push({ name: val, time: new Date().getTime() });
            localStorage.setItem('mosad_att', JSON.stringify(attendance));
            alert("تم تسجيل الحضور");
        }
    });
}

function openAdminAuth() {
    openCustomModal("كلمة السر", true, (val) => {
        if(val === adminPass) { showScreen('admin-screen'); renderAdminStats(); }
        else alert("خطأ!");
    });
}

function addNewChair() {
    openCustomModal("اسم الكرسي", false, (val) => {
        if(val) {
            chairs.push(val);
            localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
            renderChairs(); renderAdminStats();
        }
    });
}

function removeChair(name) {
    if(confirm(`حذف ${name}؟`)) {
        chairs = chairs.filter(c => c !== name);
        localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
        renderChairs(); renderAdminStats();
    }
}

function openCustomModal(title, isPassword, callback) {
    document.getElementById('modal-title').innerText = title;
    const input = document.getElementById('modal-input');
    input.type = isPassword ? "password" : "text";
    input.value = "";
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('custom-modal').style.display = 'block';
    currentCallback = callback;
    input.focus();
}

function closeModal(confirm) {
    const val = document.getElementById('modal-input').value;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('custom-modal').style.display = 'none';
    if(confirm && currentCallback) currentCallback(val);
    currentCallback = null;
}

function showScreen(id) {
    document.querySelectorAll('.section-box').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === today).reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

function changeAdminPass() {
    openCustomModal("كلمة السر الجديدة", true, (val) => {
        if(val) { adminPass = val; localStorage.setItem('mosad_admin_p', val); alert("تم التغيير"); }
    });
}
