let salesDB = JSON.parse(localStorage.getItem('mosad_sales')) || [];
let attendanceDB = JSON.parse(localStorage.getItem('mosad_att')) || [];
let chairsDB = JSON.parse(localStorage.getItem('mosad_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let currentChair = "";
let currentFilter = "الكل";

window.onload = () => {
    renderChairs();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function renderChairs() {
    document.getElementById('chairs-render').innerHTML = chairsDB.map(c => `
        <div class="chair-box" onclick="goToWork('${c}')"><h3>${c}</h3></div>
    `).join('');
}

function goToWork(name) {
    currentChair = name;
    document.getElementById('chair-label').innerText = name;
    showScreen('work-screen');
    updateChairTotal();
}

function processSale() {
    let amt = document.getElementById('cust-price').value;
    let cust = document.getElementById('cust-name').value || "عميل";
    if(!amt) return;
    salesDB.push({
        chair: currentChair,
        cust: cust,
        price: parseFloat(amt),
        ts: new Date().getTime(),
        timeStr: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'}),
        dateStr: new Date().toLocaleDateString('ar-EG')
    });
    localStorage.setItem('mosad_sales', JSON.stringify(salesDB));
    document.getElementById('cust-price').value = ""; document.getElementById('cust-name').value = "";
    updateChairTotal();
    alert("تم التسجيل بالثانية والدقيقة ✅");
}

function authAdmin() {
    if(document.getElementById('admin-key').value === '5050') {
        closeModal('admin-auth-modal');
        document.getElementById('admin-dashboard').style.display = 'block';
        renderDashTabs();
        updateDashStats();
    } else { alert("كلمة المرور خطأ!"); }
}

function renderDashTabs() {
    let html = `<button class="t-btn ${currentFilter==='الكل'?'active':''}" onclick="setFilter('الكل')">الكل</button>`;
    html += chairsDB.map(c => `<button class="t-btn ${currentFilter===c?'active':''}" onclick="setFilter('${c}')">${c}</button>`).join('');
    document.getElementById('dash-tabs').innerHTML = html;
}

function setFilter(f) {
    currentFilter = f;
    renderDashTabs();
    updateDashStats();
}

function updateDashStats() {
    const now = new Date().getTime();
    const data = currentFilter === "الكل" ? salesDB : salesDB.filter(x => x.chair === currentFilter);
    const sum = (ms) => data.filter(x => (now - x.ts) < ms).reduce((a, b) => a + b.price, 0);

    document.getElementById('d-total').innerText = sum(86400000);
    document.getElementById('w-total').innerText = sum(604800000);
    document.getElementById('m-total').innerText = sum(2592000000);
    document.getElementById('y-total').innerText = sum(31536000000);

    document.getElementById('sales-log').innerHTML = data.slice().reverse().map(i => `
        <div style="border-bottom:1px solid #222; padding:5px"><b>${i.chair}</b>|${i.price}ج|${i.cust}<br><small>${i.dateStr} ${i.timeStr}</small></div>
    `).join('');
    
    document.getElementById('att-log').innerHTML = attendanceDB.slice().reverse().map(a => `
        <div style="border-bottom:1px solid #222; padding:5px">${a.user}<br><small>${a.time}</small></div>
    `).join('');
}

function printData(p) { alert("تجهيز تقرير " + p + " لـ " + currentFilter); window.print(); }

function addChair() {
    let n = prompt("اسم الكرسي الجديد:");
    if(n) { chairsDB.push(n); localStorage.setItem('mosad_chairs', JSON.stringify(chairsDB)); renderChairs(); renderDashTabs(); }
}

function delChair() {
    let n = prompt("اكتب اسم الكرسي المراد حذفه:");
    if(["الكرسي 1", "الكرسي 2", "الكرسي 3"].includes(n)) return alert("ممنوع حذف الكراسي الأساسية!");
    chairsDB = chairsDB.filter(x => x !== n);
    localStorage.setItem('mosad_chairs', JSON.stringify(chairsDB)); renderChairs(); renderDashTabs();
}

function showScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function closeDashboard() { document.getElementById('admin-dashboard').style.display = 'none'; }

function confirmAtt() {
    let u = document.getElementById('staff-user').value;
    if(u) {
        attendanceDB.push({user: u, time: new Date().toLocaleString('ar-EG')});
        localStorage.setItem('mosad_att', JSON.stringify(attendanceDB));
        closeModal('attendance-modal'); alert("تم الحضور ✅");
    }
}

function updateChairTotal() {
    let today = new Date().toLocaleDateString('ar-EG');
    let s = salesDB.filter(x => x.chair === currentChair && x.dateStr === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('chair-day-total').innerText = s + " ج.م";
}

function resetData(t) { if(confirm("مسح السجلات؟")) { if(t==='money') salesDB=[]; else attendanceDB=[]; localStorage.setItem(t==='money'?'mosad_sales':'mosad_att', '[]'); updateDashStats(); } }
