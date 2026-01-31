let db = JSON.parse(localStorage.getItem('ms_studio_v2')) || [];
let att = JSON.parse(localStorage.getItem('ms_att_v2')) || [];
let chairs = JSON.parse(localStorage.getItem('ms_chairs_v2')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let currentChair = "";
let filterChair = "الكل";

window.onload = () => {
    renderMainGrid();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function renderMainGrid() {
    document.getElementById('main-grid').innerHTML = chairs.map(c => `
        <div class="chair-card" onclick="openEntry('${c}')"><h3>${c}</h3></div>
    `).join('');
}

function openEntry(name) {
    currentChair = name;
    document.getElementById('active-chair-name').innerText = name;
    switchView('entry-view');
    updateChairSum();
}

function saveOp() {
    let amt = document.getElementById('cash-amt').value;
    let info = document.getElementById('cust-info').value || "عميل";
    if(!amt) return;
    db.push({
        chair: currentChair,
        cust: info,
        amt: parseFloat(amt),
        ts: new Date().getTime(),
        fullTime: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'}),
        date: new Date().toLocaleDateString('ar-EG')
    });
    localStorage.setItem('ms_studio_v2', JSON.stringify(db));
    document.getElementById('cash-amt').value = "";
    document.getElementById('cust-info').value = "";
    updateChairSum();
    alert("تم التسجيل بالثانية والدقيقة ✅");
}

function openVault() {
    if(prompt("باسورد الإدارة:") === '5050') {
        document.getElementById('vault-panel').style.display = 'block';
        renderVaultTabs();
        loadVaultStats();
    }
}

function renderVaultTabs() {
    let html = `<button class="tab-btn active" onclick="setFilter('الكل')">الكل</button>`;
    html += chairs.map(c => `<button class="tab-btn" onclick="setFilter('${c}')">${c}</button>`).join('');
    document.getElementById('chair-tabs').innerHTML = html;
}

function setFilter(name) {
    filterChair = name;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    loadVaultStats();
}

function loadVaultStats() {
    let now = new Date().getTime();
    let filteredDB = filterChair === "الكل" ? db : db.filter(x => x.chair === filterChair);

    const calc = (ms) => filteredDB.filter(x => (now - x.ts) < ms).reduce((a, b) => a + b.amt, 0);

    document.getElementById('v-day').innerText = calc(86400000);
    document.getElementById('v-week').innerText = calc(604800000);
    document.getElementById('v-month').innerText = calc(2592000000);
    document.getElementById('v-year').innerText = calc(31536000000);

    document.getElementById('money-log').innerHTML = filteredDB.slice().reverse().map(i => `
        <div style="border-bottom:1px solid #222; padding:5px;">
            <b>${i.chair}</b> | ${i.amt}ج | ${i.cust} <br> <small>${i.date} - ${i.fullTime}</small>
        </div>
    `).join('');

    document.getElementById('att-log').innerHTML = att.slice().reverse().map(a => `
        <div style="border-bottom:1px solid #222; padding:5px;">${a.name} | ${a.time}</div>
    `).join('');
}

function printFiltered(period) {
    alert("جارِ طباعة تقرير " + period + " لـ " + filterChair);
    window.print();
}

function addChair() {
    let n = prompt("اسم الكرسي:");
    if(n) { chairs.push(n); localStorage.setItem('ms_chairs_v2', JSON.stringify(chairs)); renderMainGrid(); }
}

function delChair() {
    let n = prompt("اسم الكرسي للحذف:");
    chairs = chairs.filter(x => x !== n);
    localStorage.setItem('ms_chairs_v2', JSON.stringify(chairs));
    renderMainGrid();
}

function resetDB(type) {
    if(confirm("تصفير السجل؟")) {
        if(type==='money') { db=[]; localStorage.setItem('ms_studio_v2','[]'); }
        else { att=[]; localStorage.setItem('ms_att_v2','[]'); }
        loadVaultStats();
    }
}

function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function goHome() { switchView('home-view'); }
function closeVault() { document.getElementById('vault-panel').style.display = 'none'; }
function recordAtt() {
    let n = prompt("الاسم:");
    if(n) {
        att.push({name: n, time: new Date().toLocaleString('ar-EG')});
        localStorage.setItem('ms_att_v2', JSON.stringify(att));
        alert("تم الحضور");
    }
}
function updateChairSum() {
    let today = new Date().toDateString();
    let sum = db.filter(x => x.chair === currentChair && new Date(x.ts).toDateString() === today).reduce((a,b)=>a+b.amt, 0);
    document.getElementById('chair-daily-sum').innerText = sum;
}
