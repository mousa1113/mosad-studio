let db = JSON.parse(localStorage.getItem('ms_pro_db')) || [];
let att = JSON.parse(localStorage.getItem('ms_pro_att')) || [];
let chairs = JSON.parse(localStorage.getItem('ms_pro_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let currentChair = "";

window.onload = () => {
    initChairs();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function initChairs() {
    document.getElementById('chairs-grid').innerHTML = chairs.map(c => `
        <div class="chair-box" onclick="openChair('${c}')">
            <h3 style="margin:0">${c}</h3>
        </div>
    `).join('');
}

function openChair(name) {
    currentChair = name;
    document.getElementById('target-chair').innerText = name;
    switchView('action-view');
    updateChairSum();
}

function submitCash() {
    let amt = document.getElementById('cash-val').value;
    let info = document.getElementById('cust-info').value || "عميل";
    if(!amt) return;
    db.push({
        chair: currentChair,
        cust: info,
        price: parseFloat(amt),
        time: new Date().getTime(),
        fullDate: new Date().toLocaleString('ar-EG')
    });
    localStorage.setItem('ms_pro_db', JSON.stringify(db));
    document.getElementById('cash-val').value = "";
    updateChairSum();
    alert("تم الحفظ ✅");
}

function authAdmin() {
    if(prompt("باسورد الخزنة:") === '5050') {
        document.getElementById('admin-panel').style.display = 'block';
        loadReports();
    }
}

function loadReports() {
    const now = new Date().getTime();
    const f = (ms) => db.filter(x => (now - x.time) < ms).reduce((a, b) => a + b.price, 0);

    document.getElementById('r-day').innerText = f(86400000);
    document.getElementById('r-week').innerText = f(604800000);
    document.getElementById('r-month').innerText = f(2592000000);
    document.getElementById('r-year').innerText = f(31536000000);

    document.getElementById('money-log').innerHTML = db.slice().reverse().map(i => `
        <div class="data-item"><b>${i.chair}</b> | ${i.cust} | <b>${i.price}ج</b> <br> <small>${i.fullDate}</small></div>
    `).join('');

    document.getElementById('att-log').innerHTML = att.slice().reverse().map(a => `
        <div class="data-item">${a.name} | <small>${a.time}</small></div>
    `).join('');
}

// ميزة الطباعة اللي طلبتها لكل حاجة لوحدها
function printReport(type) {
    let filtered = [];
    const now = new Date().getTime();
    if(type === 'day') filtered = db.filter(x => (now - x.time) < 86400000);
    // ... يمكن التوسع هنا لفلترة الكرسي لوحده
    alert("جارِ تجهيز تقرير الـ " + type + " للطباعة");
    window.print();
}

function addChair() {
    let n = prompt("اسم الكرسي:");
    if(n) { chairs.push(n); localStorage.setItem('ms_pro_chairs', JSON.stringify(chairs)); initChairs(); }
}

function delChair() {
    let n = prompt("اكتب اسم الكرسي لحذفه بدقة:");
    chairs = chairs.filter(x => x !== n);
    localStorage.setItem('ms_pro_chairs', JSON.stringify(chairs));
    initChairs();
}

function resetDB(type) {
    if(confirm("تصفير السجلات؟")) {
        if(type==='money') { db=[]; localStorage.setItem('ms_pro_db','[]'); }
        else { att=[]; localStorage.setItem('ms_pro_att','[]'); }
        loadReports();
    }
}

function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showChairs() { switchView('chairs-view'); }
function hideAdmin() { document.getElementById('admin-panel').style.display = 'none'; }
function updateChairSum() {
    let today = new Date().toDateString();
    let sum = db.filter(x => x.chair === currentChair && new Date(x.time).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('chair-sum').innerText = sum;
}

function recordAtt() {
    let n = prompt("اسم الموظف:");
    if(n) {
        att.push({name: n, time: new Date().toLocaleString('ar-EG')});
        localStorage.setItem('ms_pro_att', JSON.stringify(att));
        alert("تم الحضور");
    }
}
