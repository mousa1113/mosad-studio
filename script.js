let allData = JSON.parse(localStorage.getItem('mosaad_pro_db')) || [];
let activeUser = "";
const PASSWORDS = { 'محمد': '11', 'محمود': '22', 'مسعد': '33', 'owner': '00' };

// تحديث الساعة
setInterval(() => {
    document.getElementById('live-time').innerText = "🕒 " + new Date().toLocaleTimeString('ar-EG');
}, 1000);

// دخول الحلاقين
function openLogin(user) {
    let pass = prompt(`أهلاً يا ${user}.. دخل باسوردك:`);
    if (pass === PASSWORDS[user]) {
        activeUser = user;
        document.getElementById('login-screen').style.display = "none";
        document.getElementById('barber-screen').style.display = "block";
        document.getElementById('user-display').innerText = "🧔 " + activeUser;
        
        // إظهار زر الإدارة لمسعد فقط
        document.getElementById('admin-access-btn').style.display = (activeUser === 'مسعد') ? "block" : "none";
        
        updateUserDailyTotal();
    } else { alert("عفواً.. الباسورد غلط!"); }
}

// دخول الإدارة (الأونر)
function openAdminPanel() {
    let pass = prompt("باسورد الخزنة (كابتن مسعد):");
    if (pass === PASSWORDS['owner']) {
        document.getElementById('barber-screen').style.display = "none";
        document.getElementById('admin-screen').style.display = "block";
        loadAdminData();
    } else { alert("ممنوع الدخول لغير الكابتن!"); }
}

function saveWork() {
    const name = document.getElementById('cust-name');
    const price = document.getElementById('cust-price');
    if (!name.value || !price.value) return alert("املا البيانات!");

    const record = {
        barber: activeUser,
        customer: name.value,
        amount: parseFloat(price.value),
        time: new Date().toISOString()
    };

    allData.push(record);
    localStorage.setItem('mosaad_pro_db', JSON.stringify(allData));
    
    // تأثير اهتزاز للموبايل عند الحفظ
    if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);

    name.value = ""; price.value = "";
    alert("تم الحفظ بنجاح.. الله ينور! ✅");
    updateUserDailyTotal();
}

function updateUserDailyTotal() {
    const today = new Date().toDateString();
    const total = allData
        .filter(r => r.barber === activeUser && new Date(r.time).toDateString() === today)
        .reduce((sum, r) => sum + r.amount, 0);
    document.getElementById('user-daily-total').innerText = total;
}

function loadAdminData() {
    const grandTotal = allData.reduce((sum, r) => sum + r.amount, 0);
    document.getElementById('grand-total').innerText = grandTotal;
    let html = "";
    allData.slice().reverse().forEach(r => {
        html += `<tr><td>${r.barber}</td><td>${r.amount} ج.م</td><td>${new Date(r.time).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</td></tr>`;
    });
    document.getElementById('log-body').innerHTML = html;
}

function viewReport(type) {
    const now = new Date();
    let filtered = allData.filter(r => {
        const d = new Date(r.time);
        if (type === 'day') return d.toDateString() === now.toDateString();
        if (type === 'week') return (now - d) / (1000*60*60*24) <= 7;
        if (type === 'month') return d.getMonth() === now.getMonth();
        if (type === 'year') return d.getFullYear() === now.getFullYear();
    });
    let sum = filtered.reduce((a, b) => a + b.amount, 0);
    document.getElementById('report-output').innerHTML = `إجمالي ${type}: <span style="color:var(--gold)">${sum} ج.م</span>`;
}

function logout() { location.reload(); }
function closeAdmin() { 
    document.getElementById('admin-screen').style.display = "none";
    document.getElementById('barber-screen').style.display = "block";
}
function wipeData() {
    if(confirm("سيتم مسح كل الحسابات نهائياً.. متأكد؟")) { localStorage.clear(); location.reload(); }
}
const cacheName = 'mosad-v1';
const assets = ['/', '/index.html', '/style.css', '/script.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('App Ready!'))
      .catch(err => console.log('App Failed', err));
  });
}
