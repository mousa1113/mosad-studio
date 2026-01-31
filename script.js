let dataStore = JSON.parse(localStorage.getItem('mosad_pro_db')) || [];
let attStore = JSON.parse(localStorage.getItem('mosad_pro_att')) || [];
let chairList = JSON.parse(localStorage.getItem('mosad_pro_chairs')) || ["كرسي 1", "كرسي 2", "كرسي 3"];
let activeChair = "";

window.onload = () => {
    refreshChairs();
    setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString('ar-EG'); }, 1000);
};

function refreshChairs() {
    document.getElementById('chairs-container').innerHTML = chairList.map(c => `
        <div class="chair-box" onclick="enterChair('${c}')">
            <div class="icon">💺</div>
            <h3>${c}</h3>
        </div>
    `).join('');
}

function enterChair(name) {
    activeChair = name;
    document.getElementById('selection-screen').classList.add('hidden-view');
    document.getElementById('work-screen').classList.remove('hidden-view');
    document.getElementById('current-chair-title').innerText = name;
    updateChairTotal();
}

function commitMoney() {
    let val = document.getElementById('val-amount').value;
    if(!val) return;
    dataStore.push({
        chair: activeChair,
        amount: parseFloat(val),
        ts: new Date().getTime(),
        timeStr: new Date().toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit', second:'2-digit'})
    });
    localStorage.setItem('mosad_pro_db', JSON.stringify(dataStore));
    document.getElementById('val-amount').value = "";
    updateChairTotal();
}

function goAdmin() {
    if(prompt("كلمة السر:") === '5050') {
        document.getElementById('main-content').classList.add('hidden-view');
        document.getElementById('admin-view').classList.remove('hidden-view');
        loadReports();
    }
}

function loadReports() {
    let now = new Date().getTime();
    const calc = (ms) => dataStore.filter(x => (now - x.ts) < ms).reduce((a, b) => a + b.amount, 0);

    document.getElementById('d-val').innerText = calc(86400000) + " ج";
    document.getElementById('w-val').innerText = calc(604800000) + " ج";
    document.getElementById('m-val').innerText = calc(2592000000) + " ج";
    document.getElementById('y-val').innerText = calc(31536000000) + " ج";

    document.getElementById('money-list').innerHTML = dataStore.slice().reverse().map(i => `
        <div class="data-row"><span>${i.chair}</span> <b>${i.amount}ج</b> <small>${i.timeStr}</small></div>
    `).join('');
}

function addChair() {
    let n = prompt("اسم الكرسي الجديد:");
    if(n) { chairList.push(n); localStorage.setItem('mosad_pro_chairs', JSON.stringify(chairList)); refreshChairs(); }
}

function delChair() {
    let n = prompt("اسم الكرسي للحذف:");
    chairList = chairList.filter(x => x !== n);
    localStorage.setItem('mosad_pro_chairs', JSON.stringify(chairList));
    refreshChairs();
}

function resetData(type) {
    if(confirm("سيتم تصفير السجل نهائياً؟")) {
        if(type === 'money') dataStore = []; else attStore = [];
        localStorage.setItem(type === 'money' ? 'mosad_pro_db' : 'mosad_pro_att', '[]');
        loadReports();
    }
}

function exitAdmin() { location.reload(); }
function updateChairTotal() {
    let today = new Date().toDateString();
    let total = dataStore.filter(x => x.chair === activeChair && new Date(x.ts).toDateString() === today).reduce((a, b) => a + b.amount, 0);
    document.getElementById('u-total').innerText = total + " ج.م";
}

function openAtt() {
    let n = prompt("الاسم للبصمة:");
    if(n) {
        attStore.push({name: n, time: new Date().toLocaleTimeString('ar-EG')});
        localStorage.setItem('mosad_pro_att', JSON.stringify(attStore));
        alert("تم تسجيل الحضور ✅");
    }
}
