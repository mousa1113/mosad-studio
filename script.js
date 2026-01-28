let db = JSON.parse(localStorage.getItem('mosad_mega_safe')) || [];
let user = "";

const PASSWORDS = { 'مسعد': '7007', 'محمد': '1397', 'محمود': '1593' };

function login(name) {
    let p = prompt(`قولنا سرك يا ${name} (الباسورد):`);
    if (p === PASSWORDS[name]) {
        user = name;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('work-screen').classList.remove('hidden');
        document.getElementById('active-user').innerText = "يا مراحب يا " + name;
        document.getElementById('active-img').src = name + ".jpg";
        if(name === 'مسعد') document.getElementById('admin-btn').classList.remove('hidden');
        updateUserTotal();
    } else { alert("لا يا برنس.. الباسورد ملوش علاقة بالحقيقة!"); }
}

function saveData() {
    let amt = document.getElementById('amount').value;
    let name = document.getElementById('cust-name').value;
    if (!amt) return alert("اكتب المبلغ.. إحنا بنلعب؟");

    db.push({
        barber: user,
        customer: name || "زبون طاير",
        price: parseFloat(amt),
        time: new Date().getTime() // الوقت بالثانية
    });

    localStorage.setItem('mosad_mega_safe', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("اتسجلت يا وحش.. رزق وجالك ✅");
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.barber === user && new Date(r.time).toDateString() === today)
                .reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

function showAdmin() {
    let p = prompt("باسورد الخزنة (المدير بس):");
    if (p !== '5050') return alert("المنطقة دي خطر عليك يا برنس!");
    
    document.getElementById('work-screen').classList.add('hidden');
    document.getElementById('admin-screen').classList.remove('hidden');

    let now = new Date().getTime();
    const filterByTime = (ms) => db.filter(r => (now - r.time) < ms).reduce((s, r) => s + r.price, 0);

    document.getElementById('s-day').innerText = filterByTime(86400000);
    document.getElementById('s-week').innerText = filterByTime(604800000);
    document.getElementById('s-month').innerText = filterByTime(2592000000);
    document.getElementById('s-year').innerText = filterByTime(31536000000);

    let html = "";
    db.slice().reverse().forEach(r => {
        let timeLabel = new Date(r.time).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        html += `<div class="log-item">
            <span><b>${r.barber}</b>: ${r.price} ج</span>
            <span style="color:gray">${timeLabel}</span>
        </div>`;
    });
    document.getElementById('log-body').innerHTML = html;
}

function hideAdmin() {
    document.getElementById('admin-screen').classList.add('hidden');
    document.getElementById('work-screen').classList.remove('hidden');
}
