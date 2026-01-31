let db = JSON.parse(localStorage.getItem('ms_studio_db')) || [];
let att = JSON.parse(localStorage.getItem('ms_studio_att')) || [];
let chairs = JSON.parse(localStorage.getItem('ms_studio_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let currentUser = "";

window.onload = () => {
    renderChairs();
    setInterval(() => {
        document.getElementById('digital-clock').innerText = new Date().toLocaleTimeString('ar-EG');
    }, 1000);
};

function renderChairs() {
    document.getElementById('chairs-grid').innerHTML = chairs.map(c => `<div class="chair-item" onclick="selectChair('${c}')"><h3>${c}</h3></div>`).join('');
}

function selectChair(name) {
    currentUser = name;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('work-screen').classList.remove('hidden');
    document.getElementById('active-user-display').innerText = name;
    updateUserTotal();
}

function saveTransaction() {
    let amt = document.getElementById('amount').value;
    if(!amt) return alert("ادخل المبلغ");
    db.push({
        user: currentUser,
        price: parseFloat(amt),
        time: new Date().getTime(),
        dateStr: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'})
    });
    localStorage.setItem('ms_studio_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم التسجيل ✅");
}

function openAdmin() {
    if(prompt("كلمة سر الإدارة:") === '5050') {
        document.getElementById('main-view').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        renderAdminStats();
    }
}

function renderAdminStats() {
    const now = new Date().getTime();
    const filter = (ms) => db.filter(r => (now - r.time) < ms).reduce((a, b) => a + b.price, 0);

    document.getElementById('s-day').innerText = filter(86400000) + " ج";
    document.getElementById('s-week').innerText = filter(604800000) + " ج";
    document.getElementById('s-month').innerText = filter(2592000000) + " ج";
    document.getElementById('s-year').innerText = filter(31536000000) + " ج";

    document.getElementById('money-log').innerHTML = db.slice().reverse().map(r => `<div>${r.user}: ${r.price}ج | ${r.dateStr}</div>`).join('');
    document.getElementById('att-log').innerHTML = att.slice().reverse().map(a => `<div>${a.name} | ${a.time}</div>`).join('');
}

function recordAttendance() {
    let n = prompt("اسم الموظف:");
    if(n) {
        att.push({ name: n, time: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) });
        localStorage.setItem('ms_studio_att', JSON.stringify(att));
        alert("تم الحضور");
    }
}

function addNewChair() {
    let n = prompt("اسم الكرسي:");
    if(n) { chairs.push(n); localStorage.setItem('ms_studio_chairs', JSON.stringify(chairs)); renderChairs(); }
}

function removeChair() {
    let n = prompt("اكتب اسم الكرسي لحذفه:");
    chairs = chairs.filter(c => c !== n);
    localStorage.setItem('ms_studio_chairs', JSON.stringify(chairs));
    renderChairs();
}

function clearData(type) {
    if(confirm("تصفير البيانات؟")) {
        if(type==='money') { db=[]; localStorage.setItem('ms_studio_db','[]'); }
        else { att=[]; localStorage.setItem('ms_studio_att','[]'); }
        renderAdminStats();
    }
}

function closeAdmin() { 
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.user === currentUser && new Date(r.time).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('u-today').innerText = sum + " ج.م";
}
