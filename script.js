let db = JSON.parse(localStorage.getItem('mosad_final_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_final_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_final_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let currentChair = "";
let currentPeriod = "";

window.onload = () => {
    renderMainGrid();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function renderMainGrid() {
    document.getElementById('grid-chairs').innerHTML = chairs.map(c => `<div class="chair-unit" onclick="openChairWork('${c}')"><h3>${c}</h3></div>`).join('');
}

function openChairWork(name) {
    currentChair = name;
    document.getElementById('current-chair-name').innerText = name;
    showView('view-work');
    updateChairSum();
}

function confirmSale() {
    let amt = document.getElementById('in-amt').value;
    let cust = document.getElementById('in-cust').value || "بدون اسم";
    if(!amt) return;
    db.push({ chair: currentChair, cust: cust, price: parseFloat(amt), ts: new Date().getTime(), timeStr: new Date().toLocaleString('ar-EG') });
    localStorage.setItem('mosad_final_db', JSON.stringify(db));
    document.getElementById('in-amt').value = ""; document.getElementById('in-cust').value = "";
    updateChairSum(); alert("تم تسجيل العملية بنجاح ✅");
}

function checkAuth() {
    if(document.getElementById('pass-field').value === '5050') {
        closePopup('pop-auth');
        document.getElementById('admin-panel').style.display = 'block';
        loadAllLogs();
    } else { alert("خطأ!"); }
}

// نظام التقارير اللي طلبته (تختار الفترة وبعدين الكرسي)
function showReportOptions(period) {
    currentPeriod = period;
    document.getElementById('report-type-title').innerText = "تقرير " + period + " - اختر الكرسي:";
    let html = `<button class="r-chair-btn" style="background:var(--gold); color:#000" onclick="filterReport('الكل')">كل الكراسي</button>`;
    html += chairs.map(c => `<button class="r-chair-btn" onclick="filterReport('${c}')">${c}</button>`).join('');
    document.getElementById('report-chair-btns').innerHTML = html;
    document.getElementById('report-sub-menu').classList.remove('hidden');
}

function filterReport(target) {
    const now = new Date().getTime();
    let ms = 86400000; // يومي
    if(currentPeriod === 'أسبوعي') ms = 604800000;
    if(currentPeriod === 'شهري') ms = 2592000000;
    if(currentPeriod === 'سنوي') ms = 31536000000;

    let filtered = db.filter(x => (now - x.ts) < ms);
    if(target !== 'الكل') filtered = filtered.filter(x => x.chair === target);

    let total = filtered.reduce((a, b) => a + b.price, 0);
    alert("تقرير " + currentPeriod + " لـ (" + target + ")\nالإجمالي: " + total + " ج.م");
    
    // عرض النتائج في السجل للطباعة
    document.getElementById('sales-log').innerHTML = filtered.slice().reverse().map(i => `
        <div style="border-bottom:1px solid #333; padding:5px"><b>${i.chair}</b> | ${i.price}ج | ${i.cust} <br> <small>${i.timeStr}</small></div>
    `).join('');
}

function addChair() {
    let n = prompt("اسم الكرسي:");
    if(n) { chairs.push(n); localStorage.setItem('mosad_final_chairs', JSON.stringify(chairs)); renderMainGrid(); }
}

function delChair() {
    let n = prompt("اسم الكرسي لحذفه:");
    if(["الكرسي 1", "الكرسي 2", "الكرسي 3"].includes(n)) return alert("أساسي!");
    chairs = chairs.filter(x => x !== n);
    localStorage.setItem('mosad_final_chairs', JSON.stringify(chairs)); renderMainGrid();
}

function openPopup(id) { document.getElementById(id).style.display = 'flex'; }
function closePopup(id) { document.getElementById(id).style.display = 'none'; }
function showView(id) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function closeAdmin() { document.getElementById('admin-panel').style.display = 'none'; }
function updateChairSum() {
    let today = new Date().toDateString();
    let s = db.filter(x => x.chair === currentChair && new Date(x.ts).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('chair-sum-val').innerText = s;
}
function loadAllLogs() {
    document.getElementById('sales-log').innerHTML = db.slice().reverse().map(i => `<div>${i.chair}|${i.price}ج|${i.cust}</div>`).join('');
    document.getElementById('att-log').innerHTML = att.slice().reverse().map(a => `<div>${a.name}|${a.time}</div>`).join('');
}
function resetData(t) { if(confirm("مسح؟")) { if(t==='sales') db=[]; else att=[]; localStorage.setItem(t==='sales'?'mosad_final_db':'mosad_final_att', '[]'); loadAllLogs(); } }
