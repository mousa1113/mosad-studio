// استدعاء البيانات من الذاكرة أو إنشاء بيانات جديدة
let db = JSON.parse(localStorage.getItem('studio_db')) || [];
let attendance = JSON.parse(localStorage.getItem('studio_attendance')) || [];
let chairs = JSON.parse(localStorage.getItem('studio_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let adminPass = localStorage.getItem('studio_admin_pass') || '5050';

let currentUser = "";

// عند فتح الصفحة
window.onload = () => {
    renderChairs();
};

function renderChairs() {
    const grid = document.getElementById('barbers-grid');
    grid.innerHTML = "";
    chairs.forEach(chair => {
        grid.innerHTML += `
            <div class="barber-item" onclick="startWork('${chair}')">
                <div class="chair-icon">💺</div>
                <h3>${chair}</h3>
            </div>`;
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.section-box').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// تسجيل العمليات
function startWork(name) {
    currentUser = name;
    showScreen('work-screen');
    document.getElementById('active-user').innerText =  "العمل على " + name;
    updateUserTotal();
}

function saveData() {
    let amt = document.getElementById('amount').value;
    let name = document.getElementById('cust-name').value;
    if (!amt) return alert("ادخل المبلغ!");

    db.push({
        chair: currentUser,
        customer: name || "عميل",
        price: parseFloat(amt),
        time: new Date().getTime()
    });

    localStorage.setItem('studio_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("تم التسجيل بنجاح ✅");
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.chair === currentUser && new Date(r.time).toDateString() === today)
                .reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

// تسجيل الحضور (البصمة)
function showAttendance() {
    let name = prompt("ادخل اسمك لتسجيل الحضور:");
    if (name) {
        let now = new Date();
        let record = {
            name: name,
            time: now.toLocaleString('ar-EG'),
            timestamp: now.getTime()
        };
        attendance.push(record);
        localStorage.setItem('studio_attendance', JSON.stringify(attendance));
        alert(`تم تسجيل حضورك يا ${name} \n الساعة: ${record.time}`);
    }
}

// لوحة الإدارة
function showAdmin() {
    let p = prompt("باسورد الإدارة:");
    if (p !== adminPass) return alert("خطأ في الباسورد!");

    showScreen('admin-screen');
    renderAdminStats();
}

function renderAdminStats() {
    let now = new Date().getTime();
    let statsHtml = "";
    
    // حساب إجمالي المحل
    const calc = (timeFrame) => db.filter(r => (now - r.time) < timeFrame).reduce((s, r) => s + r.price, 0);
    
    statsHtml += `
        <div class="report-card gold-border"><h3>إجمالي اليوم (كل الكراسي)</h3><span>${calc(86400000)} ج</span></div>
        <div class="report-card"><h3>إجمالي الأسبوع</h3><span>${calc(604800000)} ج</span></div>
    `;

    // تفاصيل كل كرسي
    chairs.forEach(chair => {
        let chairTotal = db.filter(r => r.chair === chair && (now - r.time) < 86400000)
                           .reduce((s, r) => s + r.price, 0);
        statsHtml += `<div class="report-card"><h3>${chair} (اليوم)</h3><span>${chairTotal} ج</span></div>`;
    });

    document.getElementById('admin-stats').innerHTML = statsHtml;

    // عرض السجل المختلط (حضور وعمليات)
    let logHtml = "";
    let combinedLogs = [
        ...db.map(i => ({...i, type: 'money'})),
        ...attendance.map(i => ({...i, type: 'att'}))
    ].sort((a, b) => b.time - a.time || b.timestamp - a.timestamp);

    combinedLogs.slice(0, 20).forEach(log => {
        if(log.type === 'money') {
            logHtml += `<div class="log-item"><span>💰 ${log.chair}: ${log.price}ج</span> <small>${new Date(log.time).toLocaleTimeString()}</small></div>`;
        } else {
            logHtml += `<div class="log-item" style="color:#2ecc71"><span>🕒 حضور: ${log.name}</span> <small>${log.time}</small></div>`;
        }
    });
    document.getElementById('log-body').innerHTML = logHtml;
}

function addNewChair() {
    let name = prompt("اسم الكرسي الجديد؟");
    if (name) {
        chairs.push(name);
        localStorage.setItem('studio_chairs', JSON.stringify(chairs));
        renderChairs();
        alert("تمت إضافة الكرسي");
    }
}

function changeAdminPass() {
    let newPass = prompt("ادخل الباسورد الجديد:");
    if (newPass) {
        adminPass = newPass;
        localStorage.setItem('studio_admin_pass', newPass);
        alert("تم تغيير الباسورد بنجاح");
    }
}
