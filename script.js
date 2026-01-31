// استعادة البيانات أو إنشاء مصفوفات فارغة
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
        dateStr: now.toLocaleDateString('ar-EG'), // تسجيل التاريخ عند الحفظ
        timeStr: now.toLocaleTimeString('ar-EG')
    });
    
    localStorage.setItem('mosad_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("تم تسجيل العملية بنجاح ✅");
}

function renderAdminStats() {
    const now = new Date().getTime();
    const dMs = 86400000;
    
    // دالة لحساب الإجمالي حسب عدد الأيام
    const getSum = (days) => db.filter(r => (now - r.time) < (days * dMs)).reduce((s, r) => s + r.price, 0);

    // تحديث التقارير الكلية
    document.getElementById('main-reports').innerHTML = `
        <div class="total-card"><h4>إجمالي اليوم</h4><span class="val">${getSum(1)}ج</span><button class="btn-print-sm" onclick="printReport('اليوم', 1)">طباعة</button></div>
        <div class="total-card"><h4>إجمالي الأسبوع</h4><span class="val">${getSum(7)}ج</span><button class="btn-print-sm" onclick="printReport('الأسبوع', 7)">طباعة</button></div>
        <div class="total-card"><h4>إجمالي الشهر</h4><span class="val">${getSum(30)}ج</span><button class="btn-print-sm" onclick="printReport('الشهر', 30)">طباعة</button></div>
        <div class="total-card"><h4>إجمالي السنة</h4><span class="val">${getSum(365)}ج</span><button class="btn-print-sm" onclick="printReport('السنة', 365)">طباعة</button></div>
    `;

    // تحديث تقارير الكراسي
    let chairsHtml = "";
    chairs.forEach((c, index) => {
        const chairData = db.filter(r => r.chair === c);
        const daily = chairData.filter(r => (now - r.time) < dMs).reduce((s,r) => s+r.price, 0);
        
        // زر الحذف يظهر فقط للكراسي المضافة حديثاً
        const delBtn = index > 2 ? `<button onclick="removeChair('${c}')" style="color:#ff4d4d; background:none; border:none; cursor:pointer; font-size:0.7rem;">❌ حذف</button>` : "";

        chairsHtml += `
            <div class="chair-detail-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="color:var(--gold)">${c}</strong>
                    ${delBtn}
                </div>
                <p style="font-size:0.8rem; margin:10px 0;">إيراد اليوم: ${daily} ج</p>
                <button onclick="printChairReport('${c}')" class="btn-sm" style="width:100%;">🖨️ طباعة سجل الكرسي</button>
            </div>`;
    });
    document.getElementById('chairs-reports').innerHTML = chairsHtml;

    // سجلات الأموال مع حماية ضد الـ undefined
    document.getElementById('money-log').innerHTML = db.slice(-15).reverse().map(l => `
        <div class="log-entry">💰 <span>${l.chair}</span>: ${l.price}ج <br> <small>${l.dateStr || new Date(l.time).toLocaleDateString('ar-EG')} | ${l.timeStr || new Date(l.time).toLocaleTimeString('ar-EG')}</small></div>
    `).join('');

    // سجل البصمة
    document.getElementById('att-log').innerHTML = attendance.slice(-15).reverse().map(l => `
        <div class="log-entry">🕒 ${l.name} <br> <small>${new Date(l.time).toLocaleString('ar-EG')}</small></div>
    `).join('');
}

// نظام الطباعة الاحترافي
function openPrintWindow(content) {
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>تقرير Mosad Studio</title>
        <style>body { font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 15px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: center; } th { background-color: #f2f2f2; }</style>
        </head><body><h1 style="text-align:center;">Mosad Studio</h1><hr>${content}</body></html>
    `);
    win.document.close();
    win.print();
}

function printReport(period, days) {
    const now = new Date().getTime();
    const data = db.filter(r => (now - r.time) < (days * 86400000));
    const total = data.reduce((s,r) => s+r.price, 0);
    
    let content = `<h2>إجمالي تقرير ${period}</h2><h3>إجمالي المبالغ: ${total} جنيه</h3>`;
    content += `<table><tr><th>الكرسي</th><th>العميل</th><th>المبلغ</th><th>التاريخ</th></tr>
                ${data.map(r => `<tr><td>${r.chair}</td><td>${r.customer}</td><td>${r.price}ج</td><td>${r.dateStr || new Date(r.time).toLocaleDateString('ar-EG')}</td></tr>`).join('')}
                </table>`;
    openPrintWindow(content);
}

function printChairReport(name) {
    const data = db.filter(r => r.chair === name);
    const total = data.reduce((s,r) => s+r.price, 0);
    
    let content = `<h2>سجل عمليات: ${name}</h2><h3>الإجمالي: ${total} جنيه</h3>`;
    content += `<table><tr><th>العميل</th><th>المبلغ</th><th>اليوم</th><th>الوقت</th></tr>
                ${data.map(r => `<tr><td>${r.customer}</td><td>${r.price}ج</td><td>${r.dateStr || new Date(r.time).toLocaleDateString('ar-EG')}</td><td>${r.timeStr || new Date(r.time).toLocaleTimeString('ar-EG')}</td></tr>`).join('')}
                </table>`;
    openPrintWindow(content);
}

// وظائف الإدارة
function resetAllData() {
    if(confirm("⚠️ هل أنت متأكد من مسح جميع الحسابات؟ لا يمكن التراجع!")) {
        db = [];
        attendance = [];
        localStorage.setItem('mosad_db', JSON.stringify(db));
        localStorage.setItem('mosad_att', JSON.stringify(attendance));
        renderAdminStats();
        alert("تم تصفير الحسابات ✅");
    }
}

function openAttendance() {
    openCustomModal("سجل اسم الموظف للبصمة", false, (val) => {
        if(val) {
            attendance.push({ name: val, time: new Date().getTime() });
            localStorage.setItem('mosad_att', JSON.stringify(attendance));
            alert("تم تسجيل الحضور ✅");
        }
    });
}

function openAdminAuth() {
    openCustomModal("كلمة سر الإدارة", true, (val) => {
        if(val === adminPass) { showScreen('admin-screen'); renderAdminStats(); }
        else alert("كلمة السر خطأ!");
    });
}

function addNewChair() {
    openCustomModal("اسم الكرسي الجديد", false, (val) => {
        if(val) {
            chairs.push(val);
            localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
            renderChairs();
            renderAdminStats();
        }
    });
}

function removeChair(name) {
    if(confirm(`حذف ${name} نهائياً؟`)) {
        chairs = chairs.filter(c => c !== name);
        localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
        renderChairs();
        renderAdminStats();
    }
}

// المساعدات
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
        if(val) { adminPass = val; localStorage.setItem('mosad_admin_p', val); alert("تم التغيير بنجاح ✅"); }
    });
}
