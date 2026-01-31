let db = JSON.parse(localStorage.getItem('ms_ultimate_db')) || [];
let att = JSON.parse(localStorage.getItem('ms_ultimate_att')) || [];
let chairs = JSON.parse(localStorage.getItem('ms_ultimate_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let currentChair = "";
let currentFilter = "الكل";

window.onload = () => {
    renderGrid();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function renderGrid() {
    document.getElementById('main-grid').innerHTML = chairs.map(c => `
        <div class="chair-box-creative" onclick="openChair('${c}')">
            <h3>${c}</h3>
            <div class="spark"></div>
        </div>
    `).join('');
}

function openChair(name) {
    currentChair = name;
    document.getElementById('current-chair').innerText = name;
    switchView('work-view');
    updateChairSum();
}

function saveTransaction() {
    let amt = document.getElementById('cust-amt').value;
    let name = document.getElementById('cust-name').value || "عميل";
    if(!amt) return;
    db.push({
        chair: currentChair,
        cust: name,
        price: parseFloat(amt),
        ts: new Date().getTime(),
        timeStr: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'}),
        date: new Date().toLocaleDateString('ar-EG')
    });
    localStorage.setItem('ms_ultimate_db', JSON.stringify(db));
    document.getElementById('cust-amt').value = "";
    document.getElementById('cust-name').value = "";
    updateChairSum();
    alert("تم الحفظ بنجاح ✅");
}

function enterVault() {
    if(prompt("باسورد الإدارة:") === '5050') {
        document.getElementById('vault-panel').style.display = 'block';
        renderTabs();
        loadVault();
    }
}

function renderTabs() {
    let html = `<button class="t-btn active" onclick="setFilter('الكل')">الكل</button>`;
    html += chairs.map(c => `<button class="t-btn" onclick="setFilter('${c}')">${c}</button>`).join('');
    document.getElementById('tabs').innerHTML = html;
}

function setFilter(name) {
    currentFilter = name;
    document.querySelectorAll('.t-btn').forEach(b => b.classList.toggle('active', b.innerText === name));
    loadVault();
}

function loadVault() {
    const now = new Date().getTime();
    const data = currentFilter === "الكل" ? db : db.filter(x => x.chair === currentFilter);
    const sum = (ms) => data.filter(x => (now - x.ts) < ms).reduce((a, b) => a + b.price, 0);

    document.getElementById('v-day').innerText = sum(86400000);
    document.getElementById('v-week').innerText = sum(604800000);
    document.getElementById('v-month').innerText = sum(2592000000);
    document.getElementById('v-year').innerText = sum(31536000000);

    document.getElementById('money-log').innerHTML = data.slice().reverse().map(i => `
        <div class="log-item"><b>${i.chair}</b>|${i.price}ج|${i.cust}<br><small>${i.timeStr}</small></div>
    `).join('');
    
    document.getElementById('att-log').innerHTML = att.slice().reverse().map(a => `
        <div class="log-item">${a.name}<br><small>${a.time}</small></div>
    `).join('');
}

function addChair() {
    let n = prompt("اسم الكرسي الجديد:");
    if(n) { chairs.push(n); localStorage.setItem('ms_ultimate_chairs', JSON.stringify(chairs)); renderGrid(); renderTabs(); }
}

function delChair() {
    let n = prompt("اسم الكرسي لحذفه:");
    if(["الكرسي 1", "الكرسي 2", "الكرسي 3"].includes(n)) return alert("ممنوع حذف الكراسي الأساسية!");
    chairs = chairs.filter(x => x !== n);
    localStorage.setItem('ms_ultimate_chairs', JSON.stringify(chairs));
    renderGrid(); renderTabs();
}

function switchView(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function showHome() { switchView('home-view'); }
function closeVault() { document.getElementById('vault-panel').style.display = 'none'; }
function clearDB(t) { if(confirm("مسح؟")) { if(t==='money') db=[]; else att=[]; localStorage.setItem(t==='money'?'ms_ultimate_db':'ms_ultimate_att', '[]'); loadVault(); } }
function recordAtt() {
    let n = prompt("الاسم:");
    if(n) { att.push({name: n, time: new Date().toLocaleString('ar-EG')}); localStorage.setItem('ms_ultimate_att', JSON.stringify(att)); alert("تم"); }
}
function updateChairSum() {
    let today = new Date().toDateString();
    let sum = db.filter(x => x.chair === currentChair && new Date(x.ts).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('chair-sum').innerText = sum;
}
