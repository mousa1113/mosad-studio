let db = JSON.parse(localStorage.getItem('m_studio_db')) || [];
let att = JSON.parse(localStorage.getItem('m_studio_att')) || [];
let chairs = JSON.parse(localStorage.getItem('m_studio_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
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
    grid.innerHTML = chairs.map(c => `<div class="chair-card" onclick="selectChair('${c}')"><h3>${c}</h3></div>`).join('');
}

function selectChair(name) {
    currentUser = name;
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('work-screen').classList.remove('hidden');
    document.getElementById('active-user-name').innerText = name;
    updateUserTotal();
}

function saveData() {
    let amt = document.getElementById('amount').value;
    if(!amt) return alert("يرجى إدخال المبلغ");
    db.push({
        user: currentUser,
        cust: document.getElementById('cust-name').value || "عميل",
        price: parseFloat(amt),
        time: new Date().getTime(),
        fullTime: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'})
    });
    localStorage.setItem('m_studio_db', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("تم الحفظ بنجاح ✅");
}

function openAdmin() {
    if(prompt("كلمة سر الإدارة:") === '5050') {
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
        <div style="border-bottom:1px solid #333; padding:5px">${r.user}: ${r.price}ج | ${r.fullTime}</div>
    `).join('');

    document.getElementById('att-log').innerHTML = att.slice().reverse().map(a => `
        <div style="border-bottom:1px solid #333; padding:5px">${a.name} | ${a.time}</div>
    `).join('');
}

function recordAttendance() {
    let name = prompt("اسم الموظف:");
    if(name) {
        att.push({ name, time: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'}) });
        localStorage.setItem('m_studio_att', JSON.stringify(att));
        alert("تم تسجيل حضورك");
    }
}

function addNewChair() {
    let n = prompt("اسم الكرسي الجديد:");
    if(n) { chairs.push(n); localStorage.setItem('m_studio_chairs', JSON.stringify(chairs)); renderChairs(); }
}

function deleteChair() {
    let n = prompt("اسم الكرسي المراد حذفه:");
    chairs = chairs.filter(c => c !== n);
    localStorage.setItem('m_studio_chairs', JSON.stringify(chairs));
    renderChairs();
}

function clearData(type) {
    if(confirm("هل تريد تصفير البيانات نهائياً؟")) {
        if(type === 'money') { db = []; localStorage.setItem('m_studio_db', '[]'); }
        else { att = []; localStorage.setItem('m_studio_att', '[]'); }
        renderAdminStats();
    }
}

function toggleTheme(init=false) {
    if(!init) document.body.classList.toggle('light-theme');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

function closeAdmin() { document.getElementById('admin-panel').classList.add('hidden'); }
function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.user === currentUser && new Date(r.time).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('u-today').innerText = sum + " ج.م";
}
