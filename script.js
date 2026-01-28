let db = JSON.parse(localStorage.getItem('mosad_mega_safe')) || [];
let user = "";

const PASSWORDS = { 
    'مسعد': '7007', 
    'محمد': '1397', 
    'محمود': '1593' 
};

function login(name) {
    let p = prompt(`قولنا سرك يا ${name} (الباسورد):`);
    if (p === PASSWORDS[name]) {
        user = name;
        
        // خفينا شاشة الدخول وظهرنا شاشة الشغل
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('work-screen').classList.remove('hidden');
        
        document.getElementById('active-user').innerText = "يا مراحب يا " + name;
        document.getElementById('active-img').src = name + ".jpg";

        // الحتة دي هي السحر: الزرار بيختفي الأول
        document.getElementById('admin-btn').classList.add('hidden');

        // لو اللي داخل هو "مسعد" بس.. الزرار يظهرله
        if (name === 'مسعد') {
            document.getElementById('admin-btn').classList.remove('hidden');
        }

        updateUserTotal();
    } else { 
        alert("لا يا برنس.. الباسورد غلط، ركز شوية!"); 
    }
}

function saveData() {
    let amt = document.getElementById('amount').value;
    let name = document.getElementById('cust-name').value;
    
    if (!amt || amt <= 0) return alert("اكتب الفلوس صح يا معلم، متهزرش!");

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
    alert("اتسجلت يا وحش.. رزق وجالك ✅");
}

function updateUserTotal() {
    let today = new Date().toDateString();
    let sum = db.filter(r => r.barber === user && new Date(r.time).toDateString() === today)
                .reduce((s, r) => s + r.price, 0);
    document.getElementById('u-today').innerText = sum;
}

function showAdmin() {
    // زيادة تأكيد: بنسأله تاني على باسورد الخزنة (5050)
    let p = prompt("باسورد الخزنة السري (للمدير بس):");
    if (p !== '5050') {
        alert("المنطقة دي خطر عليك يا برنس.. ابعد عنها!");
        return;
    }
    
    document.getElementById('work-screen').classList.add('hidden');
    document.getElementById('admin-screen').classList.remove('hidden');

    let now = new Date().getTime();
    
    // فلترة الحسابات بالثانية
    const filterByTime = (ms) => db.filter(r => (now - r.time) < ms).reduce((s, r) => s + r.price, 0);

    document.getElementById('s-day').innerText = filterByTime(86400000); // 24 ساعة
    document.getElementById('s-week').innerText = filterByTime(604800000); // 7 أيام
    document.getElementById('s-month').innerText = filterByTime(2592000000); // 30 يوم
    document.getElementById('s-year').innerText = filterByTime(31536000000); // سنة كاملة

    let html = "";
    db.slice().reverse().forEach(r => {
        let dateObj = new Date(r.time);
        let timeLabel = dateObj.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        let dateLabel = dateObj.toLocaleDateString('ar-EG');
        
        html += `<div class="log-item">
            <span><b>${r.barber}</b>: ${r.price} ج <br><small>${r.customer}</small></span>
            <span style="color:gray; font-size: 10px; text-align: left;">${dateLabel}<br>${timeLabel}</span>
        </div>`;
    });
    document.getElementById('log-body').innerHTML = html;
}

function hideAdmin() {
    document.getElementById('admin-screen').classList.add('hidden');
    document.getElementById('work-screen').classList.remove('hidden');
}
