let db = JSON.parse(localStorage.getItem('mosad_db')) || [];
let attendance = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let user = "";

window.onload = () => {
    renderChairs();
    setInterval(() => {
        document.getElementById('digital-clock').innerText = new Date().toLocaleTimeString('ar-EG');
    }, 1000);
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

function renderChairs() {
    document.getElementById('chairs-grid').innerHTML = chairs.map(c => `
        <div class="barber-item" onclick="login('${c}')">
            <h3>${c}</h3>
        </div>
    `).join('');
}

function login(name) {
    let p = prompt(`كلمة سر ${name}:`);
    if (p === '1234' || name === 'مسعد') { // الباسورد الافتراضي
        user = name;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('work-screen').classList.remove('hidden');
        document.getElementById('active-user').innerText = name;
        updateUserTotal();
    } else { alert("غلط!"); }
}

function saveData() {
    let amt = document.getElementById('amount').value;
    if (!amt) return alert("اكتب المبلغ!");
    db.push({
        barber: user,
        price: parseFloat(amt),
        time: new Date().getTime(),
        timeStr: new Date().toLocaleTimeString('ar-EG')
    });
    localStorage.setItem('mosad_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم الحفظ");
}

function showAdmin() {
    if (prompt("باسورد الخزنة:") === '5050') {
        document.getElementById('main-ui').classList.add('hidden');
        document.getElementById('admin-screen').classList.remove('hidden');
        renderAdminStats();
    }
}

function renderAdminStats() {
    let now = new Date().getTime();
    const filter = (ms) => db.filter(r => (now - r.time) < ms).reduce((s, r) => s + r.price, 0);

    document.getElementById('s-day').innerText = filter(86400000) + " ج";
    document.getElementById('s-week').innerText = filter(604800000) + " ج";
    document.getElementById('s-month').innerText = filter(2592000000) + " ج";
    document.getElementById('s-year').innerText = filter(31536000000) + " ج";

    document.getElementById('log-body').innerHTML = db.slice().reverse().map(r => `
        <div>${r.barber}: ${r.price}ج (${r.timeStr})</div>
    `).join('');
    
    document.getElementById('att-body').innerHTML = attendance.slice().reverse().map(a => `
        <div>${a.name} - ${a.time}</div>
    `).join('');
}

function markAttendance() {
    let n = prompt("اسم الموظف:");
    if(n) {
        attendance.push({ name: n, time: new Date().toLocaleTimeString('ar-EG') });
        localStorage.setItem('mosad_att', JSON.stringify(attendance));
        alert("تم تسجيل الحضور");
    }
}

function addNewChair() {
    let n = prompt("اسم الكرسي الجديد:");
    if(n) {
        chairs.push(n);
        localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
        renderChairs();
    }
}

function clearLog(type) {
    if(confirm("مسح؟")) {
        if(type === 'money') { db = []; localStorage.setItem('mosad_db', '[]'); }
        else { attendance = []; localStorage.setItem('mosad_att', '[]'); }
        renderAdminStats();
    }
}

function toggleTheme(init=false) {
    if(!init) document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function closeAdmin() { location.reload(); }

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.barber === user && new Date(r.time).toDateString() === today).reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}
