let db = JSON.parse(localStorage.getItem('ms_data')) || [];
let attendance = JSON.parse(localStorage.getItem('ms_att')) || [];
let chairs = JSON.parse(localStorage.getItem('ms_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let currentUser = "";

window.onload = () => {
    updateClock();
    setInterval(updateClock, 1000);
    renderChairs();
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

function updateClock() {
    document.getElementById('digital-clock').innerText = new Date().toLocaleTimeString('ar-EG');
}

function renderChairs() {
    const grid = document.getElementById('chairs-grid');
    grid.innerHTML = chairs.map(c => `
        <div class="chair-btn" onclick="selectUser('${c}')">
            <b>${c}</b>
        </div>
    `).join('');
}

function selectUser(name) {
    let p = prompt(`كلمة المرور الخاصة بـ ${name}:`);
    if(p === '1234' || name === 'الكرسي 1') { // عدل الباسوردات هنا
        currentUser = name;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('work-screen').classList.remove('hidden');
        document.getElementById('active-user-display').innerText = name;
        updateUserTotal();
    }
}

function saveTransaction() {
    let amt = document.getElementById('amount').value;
    if(!amt) return alert("يرجى إدخال المبلغ");
    db.push({
        user: currentUser,
        price: parseFloat(amt),
        time: new Date().getTime(),
        dateStr: new Date().toLocaleString('ar-EG')
    });
    localStorage.setItem('ms_data', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم التسجيل");
}

function accessAdmin() {
    let p = prompt("كلمة مرور الإدارة:");
    if(p === '5050') {
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

    document.getElementById('money-log').innerHTML = db.slice().reverse().map(r => `
        <div style="padding:5px; border-bottom:1px solid #333">${r.user}: ${r.price}ج - ${r.dateStr}</div>
    `).join('');
}

function handleAttendance() {
    let name = prompt("اسم الموظف:");
    if(name) {
        attendance.push({ name, time: new Date().toLocaleString('ar-EG') });
        localStorage.setItem('ms_att', JSON.stringify(attendance));
        alert("تم تسجيل الحضور");
    }
}

function addNewChair() {
    let name = prompt("اسم الكرسي الجديد:");
    if(name) {
        chairs.push(name);
        localStorage.setItem('ms_chairs', JSON.stringify(chairs));
        renderChairs();
    }
}

function clearData(type) {
    if(confirm("هل أنت متأكد؟")) {
        if(type === 'money') { db = []; localStorage.setItem('ms_data', '[]'); }
        else { attendance = []; localStorage.setItem('ms_att', '[]'); }
        renderAdminStats();
    }
}

function toggleTheme(init=false) {
    if(!init) document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }
function exitWork() { location.reload(); }
function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.user === currentUser && new Date(r.time).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('u-today-val').innerText = sum + " ج.م";
}
