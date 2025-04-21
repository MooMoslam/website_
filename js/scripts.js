/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

document.addEventListener("DOMContentLoaded", function () {
    // تحديث القيم من السيرفر
    function updateValues() {
        fetch("/temperature_Robot")
            .then(res => res.text())
            .then(temp => document.getElementById("temperature_Robot").innerText = ` ${temp} `)
            .catch(console.error);

        fetch("/humidity_Robot")
            .then(res => res.text())
            .then(humid => document.getElementById("humidity_Robot").innerText = ` ${humid} `)
            .catch(console.error);

        fetch("/temperature_room")
            .then(res => res.text())
            .then(tempRoom => document.getElementById("temperature_room").innerText = ` ${tempRoom} `)
            .catch(console.error);

        fetch("/humidity_room")
            .then(res => res.text())
            .then(humidRoom => document.getElementById("humidity_room").innerText = ` ${humidRoom} `)
            .catch(console.error);

        fetch("/water_level")
            .then(res => res.text())
            .then(water => document.getElementById("water_level").innerText = ` ${water} `)
            .catch(console.error);

        fetch("/tank_level")
            .then(res => res.text())
            .then(tank => document.getElementById("tank_level").innerText = ` ${tank} `)
            .catch(console.error);

        fetch("/BatteryLevel")
            .then(res => res.text())
            .then(battery => document.getElementById("BatteryLevel").innerText = ` ${battery} `)
            .catch(console.error);
    }

    updateValues();
    setInterval(updateValues, 2000);

    // استرجاع حالة السلايدرز
    const uvToggle = document.getElementById("uv");
    const sprayToggle = document.getElementById("spray");

    const savedUV = localStorage.getItem("uv");
    const savedSpray = localStorage.getItem("spray");

    if (savedUV === "ON") {
        uvToggle.checked = true;
        toggleUV(uvToggle, true);
    }

    if (savedSpray === "ON") {
        sprayToggle.checked = true;
        toggleSpray(sprayToggle, true);
    }

    // استعادة وقت العد التنازلي إن وجد
    const savedEndTime = localStorage.getItem("countdownEndTime");
    if (savedEndTime && new Date().getTime() < parseInt(savedEndTime)) {
        countdownTime = parseInt(savedEndTime);
        startCountdown(true); // استعادة
    }
});

// عداد تنازلي
let countdownInterval;
let countdownTime;
let countdownStarted = false;
let uvState = false;
let sprayState = false;

function startCountdown(resume = false) {
    if (!countdownStarted || resume) {
        countdownStarted = true;

        if (!resume) {
            countdownTime = new Date().getTime() + 1 * 60 * 1000; // ضبط وقت العد التنازلي
            localStorage.setItem("countdownEndTime", countdownTime); // حفظ الوقت في localStorage
        }

        countdownInterval = setInterval(function () {
            let now = new Date().getTime();
            let distance = countdownTime - now;

            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const countdownElem = document.getElementById("countdown");
            if (countdownElem) {
                countdownElem.innerHTML = minutes + "m " + seconds + "s ";
            }

            // تغيير اللون بناءً على الوقت المتبقي
            if (distance <= 10000) {  // أقل من 10 ثواني
                countdownElem.style.color = "#c40000";  // اللون الأحمر
            } else {
                countdownElem.style.color = "green";  // اللون الأخضر
            }

            if (distance < 0) {
                clearInterval(countdownInterval);
                if (countdownElem) {
                    countdownElem.innerHTML = "The sterilization process is complete.";
                    countdownElem.style.color = "blue";  // تغيير اللون
                    countdownElem.style.fontSize = "24px";  // تغيير الحجم
                    countdownElem.style.fontWeight = "bold";  // جعل الخط سميك
                }
                if (uvState) {
                    stopUV();
                    document.getElementById("uv").checked = false;
                }
                if (sprayState) {
                    stopSpray();
                    document.getElementById("spray").checked = false;
                }
                localStorage.removeItem("countdownEndTime");
                countdownStarted = false;
            }
        }, 1000);
    }
}

function stopCountdown() {
    clearInterval(countdownInterval);
    countdownStarted = false;
    localStorage.removeItem("countdownEndTime");
    const countdownElem = document.getElementById("countdown");
    if (countdownElem) countdownElem.innerHTML = "";
}

function stopUV() {
    uvState = false;
    localStorage.setItem("uv", "OFF");
    document.getElementById("uv-status").textContent = "OFF";
    document.getElementById("uv-status").style.color = "#c40000";
    fetch("/uv?state=OFF").catch(console.error);
}

function stopSpray() {
    sprayState = false;
    localStorage.setItem("spray", "OFF");
    document.getElementById("spray-status").textContent = "OFF";
    document.getElementById("spray-status").style.color = "#c40000";
    fetch("/spray?state=OFF").catch(console.error);
}

function toggleUV(checkbox, restoring = false) {
    const statusDiv = document.getElementById("uv-status");
    const state = checkbox.checked ? "ON" : "OFF";
    statusDiv.textContent = state;
    statusDiv.style.color = checkbox.checked ? "green" : "#c40000";
    localStorage.setItem("uv", state);

    fetch("/uv?state=" + state).catch(console.error);

    if (state === "ON") {
        if (!countdownStarted) startCountdown();
        uvState = true;
    } else {
        uvState = false;
        stopCountdownIfNeeded();
    }
}

function toggleSpray(checkbox, restoring = false) {
    const statusDiv = document.getElementById("spray-status");
    const state = checkbox.checked ? "ON" : "OFF";
    statusDiv.textContent = state;
    statusDiv.style.color = checkbox.checked ? "green" : "#c40000";
    localStorage.setItem("spray", state);

    fetch("/spray?state=" + state).catch(console.error);

    if (state === "ON") {
        if (!countdownStarted) startCountdown();
        sprayState = true;
    } else {
        sprayState = false;
        stopCountdownIfNeeded();
    }
}

function stopCountdownIfNeeded() {
    const currentUV = localStorage.getItem("uv");
    const currentSpray = localStorage.getItem("spray");

    if (currentUV === "OFF" && currentSpray === "OFF") {
        stopCountdown();
    }
}

function toggleEmergency(checkbox) {
    const statusDiv = document.getElementById("emergency-status");
    const state = checkbox.checked ? "ON" : "OFF";
    statusDiv.textContent = state;
    statusDiv.style.color = checkbox.checked ? "green" : "#c40000";

    fetch("/emergency?state=" + state).catch(console.error);
}

// تحديث لون النص حسب حالة السويتشات
document.querySelectorAll(".toggle-switch input").forEach(input => {
    input.addEventListener("change", function () {
        const statusDiv = this.closest('.card-1').querySelector('.status');
        const label = this.closest('.card-1').querySelector('.toggle-label');
        const state = this.checked ? "ON" : "OFF";
        label.textContent = state;
        statusDiv.style.color = this.checked ? "green" : "red";
    });
});

// ===== كود التحكم في حركة الروبوت والسرعة =====
let currentMove = null;

// إرسال أمر الحركة
function sendMove(direction) {
  if (currentMove !== direction) {
    currentMove = direction;
    fetch(`/move?dir=${direction}`)
      .then(() => console.log(`✅ Moving: ${direction}`))
      .catch(err => console.error("❌ Error sending move:", err));
  }
}

// إرسال أمر التوقف
function stopMove() {
  if (currentMove !== null) {
    fetch(`/move?dir=stop`)
      .then(() => console.log("🛑 Stopped"))
      .catch(err => console.error("❌ Error sending stop:", err));
    currentMove = null;
  }
}

// تحديث السرعة
function updateSpeed(val) {
  document.getElementById('speedVal').innerText = val;
  fetch(`/speed?val=${val}`)
    .then(() => console.log(`🚀 Speed: ${val}`))
    .catch(err => console.error("❌ Error setting speed:", err));
}

// إضافة أحداث اللمس والضغط
document.querySelectorAll('button[data-dir]').forEach(button => {
  // نمنع الـ copy والـ context menu
  button.addEventListener('contextmenu', (e) => e.preventDefault());

  // PC
  button.addEventListener('mousedown', (e) => {
    e.preventDefault();
    sendMove(e.target.dataset.dir);
  });
  button.addEventListener('mouseup', stopMove);
  button.addEventListener('mouseleave', stopMove);

  // Mobile
  button.addEventListener('touchstart', (e) => {
    e.preventDefault();
    sendMove(e.target.dataset.dir);
  });
  
  button.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopMove();
  });
});

  
  
