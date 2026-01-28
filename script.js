// استعادة البيانات والباسوردات من الذاكرة أو وضع القيم الافتراضية
let db = JSON.parse(localStorage.getItem('mosad_mega_safe')) || [];
let PASSWORDS = JSON.parse(localStorage.getItem('mosad_passwords')) || { 
    'مسعد': '7007', 
    'محمد': '1397', 
    'محمود': '1593' 
};
let user = "";

function login(name) {
    let p = prompt(`قولنا سرك يا ${name} (الباسورد):`);
    if (p === PASSWORDS[name]) {
        user = name;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('work-screen').classList.remove('hidden');
        document.getElementById('active-user').innerText = "يا مراحب يا " + name;
        document.getElementById('active-img').src = name + ".jpg";
        
        // زرار الإدارة يظهر لمسعد بس
        document.getElementById('admin-btn').classList.toggle('hidden', name !== 'مسعد');
        
        updateUserTotal();
    } else { alert("لا يا برنس.. الباسورد غلط!"); }
}

function saveData() {
    let amt = document.getElementById('amount').value;
    let name = document.getElementById('cust-name').value;
    if (!amt || amt <= 0) return alert("اكتب الفلوس صح يا معلم!");

    db.push({
        barber: user,
        customer: name || "زبون طاير",
        price: parseFloat(amt),
        time: new Date().getTime()
    });

    localStorage.setItem('mosad_mega_safe', JSON.stringify(db));
    document.getElementById('amount').value = "";
    document.getElementById('cust-name').value = "";
    updateUserTotal();
    alert("اتسجلت يا وحش ✅");
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.barber === user && new Date(r.time).toDateString() === today)
                .reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

function showAdmin() {
    let p = prompt("باسورد الخزنة السري (المدير بس):");
    if (p !== '5050') return alert("المنطقة دي خطر عليك!");
    
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
        let t = new Date(r.time).toLocaleTimeString('ar-EG');
        html += `<div class="log-item"><span><b>${r.barber}</b>: ${r.price} ج</span><span style="color:gray">${t}</span></div>`;
    });
    document.getElementById('log-body').innerHTML = html;
}

// دالة تغيير الباسورد (لمسعد فقط جوه اللوحة)
function changePass(targetUser) {
    let newPass = prompt(`اكتب الباسورد الجديد لـ ${targetUser}:`);
    if (newPass && newPass.length >= 2) {
        PASSWORDS[targetUser] = newPass;
        localStorage.setItem('mosad_passwords', JSON.stringify(PASSWORDS));
        alert(`تم تغيير باسورد ${targetUser} بنجاح ✅`);
    } else {
        alert("الباسورد قصير اوي يا كنج!");
    }
}

function clearAllData() {
    if (confirm("هتصفر الخزنة؟ مفيش رجوع!") && confirm("تأكيد نهائي؟")) {
        db = [];
        localStorage.setItem('mosad_mega_safe', JSON.stringify(db));
        location.reload();
    }
}

function hideAdmin() {
    document.getElementById('admin-screen').classList.add('hidden');
    document.getElementById('work-screen').classList.remove('hidden');
}
