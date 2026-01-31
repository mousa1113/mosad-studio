let db = JSON.parse(localStorage.getItem('mosad_mega_safe')) || [];
let att = JSON.parse(localStorage.getItem('mosad_attendance')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_chairs')) || [
    {name: 'مسعد', img: 'mosad.jpg', pass: '7007'},
    {name: 'محمد', img: 'mohamed.jpg', pass: '1397'},
    {name: 'محمود', img: 'mahmoud.jpg', pass: '1593'}
];
let user = "";

window.onload = () => {
    renderChairs();
    setInterval(updateClock, 1000);
    if(localStorage.getItem('theme') === 'light') toggleTheme(true);
};

function updateClock() {
    document.getElementById('digital-clock').innerText = new Date().toLocaleTimeString('ar-EG');
}

function renderChairs() {
    document.getElementById('barbers-grid').innerHTML = chairs.map(c => `
        <div class="barber-item" onclick="login('${c.name}')">
            <img src="${c.img}" onerror="this.src='https://via.placeholder.com/60'">
            <h3>${c.name}</h3>
        </div>
    `).join('');
}

function login(name) {
    let chair = chairs.find(c => c.name === name);
    let p = prompt(`كلمة السر يا برنس ${name}:`);
    if (p === chair.pass) {
        user = name;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('work-screen').classList.remove('hidden');
        document.getElementById('active-user').innerText = "البرنس " + name;
        document.getElementById('active-img').src = chair.img;
        updateUserTotal();
    } else { alert("الباسورد ملوش علاقة بالحقيقة!"); }
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
    localStorage.setItem('mosad_mega_safe', JSON.stringify(db));
    document.getElementById('amount').value = "";
    updateUserTotal();
    alert("تم التسجيل في الخزنة ✅");
}

function askAdminPass() {
    let p = prompt("باسورد الخزنة:");
    if (p === '5050') {
        document.getElementById('main-app').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
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

    document.getElementById('money-log').innerHTML = db.slice(-20).reverse().map(r => `
        <div class="log-item">💰 ${r.barber}: ${r.price}ج <small>${r.timeStr}</small></div>
    `).join('');
}

function openAttendance() {
    let name = prompt("سجل اسمك للحضور:");
    if(name) {
        att.push({ name, timeStr: new Date().toLocaleString('ar-EG') });
        localStorage.setItem('mosad_attendance', JSON.stringify(att));
        alert("تم تسجيل الحضور بنجاح!");
    }
}

function addNewChair() {
    let name = prompt("اسم الكرسي الجديد:");
    let pass = prompt("باسورد الكرسي:");
    if(name && pass) {
        chairs.push({name, img: 'default.jpg', pass});
        localStorage.setItem('mosad_chairs', JSON.stringify(chairs));
        renderChairs();
    }
}

function clearLog(type) {
    if(confirm("تمسح السجل نهائياً؟")) {
        if(type === 'money') { db = []; localStorage.setItem('mosad_mega_safe', '[]'); }
        else { att = []; localStorage.setItem('mosad_attendance', '[]'); }
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
