let db = JSON.parse(localStorage.getItem('mosad_v3_db')) || [];
let att = JSON.parse(localStorage.getItem('mosad_v3_att')) || [];
let chairs = JSON.parse(localStorage.getItem('mosad_v3_chairs')) || ["الكرسي 1", "الكرسي 2", "الكرسي 3"];
let activeChair = "";

window.onload = () => {
    renderChairs();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function renderChairs() {
    document.getElementById('chairs-grid').innerHTML = chairs.map(c => `
        <div class="chair-card-ui" onclick="enterChair('${c}')"><h3>${c}</h3></div>
    `).join('');
}

function enterChair(name) {
    activeChair = name;
    document.getElementById('chair-title').innerText = name;
    showView('view-chair-work');
    updateChairTotal();
}

function saveData() {
    let amt = document.getElementById('c-amt').value;
    let name = document.getElementById('c-name').value || "عميل";
    if(!amt) return;
    db.push({ chair: activeChair, cust: name, price: parseFloat(amt), ts: new Date().getTime(), time: new Date().toLocaleTimeString('ar-EG') });
    localStorage.setItem('mosad_v3_db', JSON.stringify(db));
    document.getElementById('c-amt').value = ""; document.getElementById('c-name').value = "";
    updateChairTotal(); alert("تم الحفظ ✅");
}

function checkAdmin() {
    if(document.getElementById('admin-pass').value === '5050') {
        closeModal('auth-modal');
        document.getElementById('vault-panel').style.display = 'block';
        loadVault();
    } else { alert("غلط!"); }
}

function loadVault() {
    const now = new Date().getTime();
    const sum = (ms) => db.filter(x => (now - x.ts) < ms).reduce((a,b) => a + b.price, 0);
    document.getElementById('d-val').innerText = sum(86400000);
    document.getElementById('w-val').innerText = sum(604800000);
    document.getElementById('m-val').innerText = sum(2592000000);
    document.getElementById('y-val').innerText = sum(31536000000);

    document.getElementById('money-list').innerHTML = db.slice().reverse().map(i => `<div>${i.chair}|${i.price}ج<br>${i.time}</div>`).join('');
    document.getElementById('att-list').innerHTML = att.slice().reverse().map(a => `<div>${a.name}|${a.time}</div>`).join('');
}

function addChair() {
    let n = prompt("الاسم:");
    if(n) { chairs.push(n); localStorage.setItem('mosad_v3_chairs', JSON.stringify(chairs)); renderChairs(); }
}

function delChair() {
    let n = prompt("الاسم للحذف:");
    if(["الكرسي 1", "الكرسي 2", "الكرسي 3"].includes(n)) return;
    chairs = chairs.filter(x => x !== n);
    localStorage.setItem('mosad_v3_chairs', JSON.stringify(chairs)); renderChairs();
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function showView(id) { document.querySelectorAll('.view').forEach(v => v.classList.remove('active')); document.getElementById(id).classList.add('active'); }
function closeVault() { document.getElementById('vault-panel').style.display = 'none'; }
function confirmAtt() {
    let n = document.getElementById('staff-name').value;
    if(n) { att.push({name: n, time: new Date().toLocaleString('ar-EG')}); localStorage.setItem('mosad_v3_att', JSON.stringify(att)); closeModal('att-modal'); alert("تم الحضور"); }
}
function updateChairTotal() {
    let today = new Date().toDateString();
    let s = db.filter(x => x.chair === activeChair && new Date(x.ts).toDateString() === today).reduce((a,b)=>a+b.price, 0);
    document.getElementById('c-sum').innerText = s;
}
