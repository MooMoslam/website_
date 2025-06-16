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
// Update values ​​from the server    
    function updateValues() {
        fetch("/temperature_Robot")
            .then(res => res.text())
            .then(temp => {
                document.getElementById("temperature_Robot").innerText = ` ${temp} `
                checkTemperatureEmergency(parseFloat(temp)); 
            })
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
    setInterval(updateValues, 1000);


    // Restore sliders state
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


    // Restore the countdown time if any    
    const savedEndTime = localStorage.getItem("countdownEndTime");
    if (savedEndTime && new Date().getTime() < parseInt(savedEndTime)) {
        countdownTime = parseInt(savedEndTime);
        startCountdown(true); // استعادة
    }
});


function checkTemperatureEmergency(temp) {
    if (temp > 30) {
        console.log("🚨 High Temperature Detected!");

        // وقف UV لو شغال
        if (uvState) {
            stopUV();
            document.getElementById("uv").checked = false;
        }

        // وقف Spray لو شغال
        if (sprayState) {
            stopSpray();
            document.getElementById("spray").checked = false;
        }

        // وقف المواتير
        stopMove();

        // وقف العداد التنازلي
        stopCountdown();

        // عرض رسالة طوارئ
        const countdownElem = document.getElementById("countdown");
        if (countdownElem) {
            countdownElem.innerHTML = "🚨 Emergency: High Temperature Detected!";
            countdownElem.style.color = "red";
            countdownElem.style.fontSize = "30px";
            countdownElem.style.fontWeight = "bold";
        }
    }
}


let countdownSeconds = 60; // البداية الافتراضية: دقيقة واحدة
let initialCountdownDuration = 0;
let countdownInterval;
let countdownTime;
let countdownStarted = false;
let uvState = false;
let sprayState = false;

// عرض الوقت على الشاشة
 function updateCountdownDisplay() {
    let hours = Math.floor(countdownSeconds / 3600);
    let minutes = Math.floor((countdownSeconds % 3600) / 60);
    let seconds = countdownSeconds % 60;

    document.getElementById("countdown").textContent =
        `${String(hours).padStart(2, '0')} h:${String(minutes).padStart(2, '0')} m:${String(seconds).padStart(2, '0')} s`;
}

// تعديل الوقت
function addMinutes(mins) {
    countdownSeconds = Math.max(0, countdownSeconds + mins * 60);
    updateCountdownDisplay();
}


function addHours(hrs) {
    countdownSeconds = Math.max(0, countdownSeconds + hrs * 3600);
    updateCountdownDisplay();
}


// أول تحديث عند التحميل
updateCountdownDisplay();


// بدء العداد
function startCountdown(resume = false) {
    const loadingCircle = document.getElementById("loading-circle");
    const progressBar = document.getElementById("progress-bar");

    if (!countdownStarted || resume) {
        countdownStarted = true;
        countdownSeconds = Math.max(1, countdownSeconds); // لا تقل عن ثانية واحدة

        if (!resume) {
            const now = new Date().getTime();
            initialCountdownDuration = countdownSeconds * 1000;
            countdownTime = now + initialCountdownDuration;
            localStorage.setItem("countdownEndTime", countdownTime);
        }

        loadingCircle.style.display = "block";

        countdownInterval = setInterval(function () {
            let now = new Date().getTime();
            let distance = countdownTime - now;

            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const countdownElem = document.getElementById("countdown");
            if (countdownElem) {
                countdownElem.textContent =
                    `${String(Math.floor(distance / 3600000)).padStart(2, '0')} h:` +
                    `${String(minutes).padStart(2, '0')} m:` +
                    `${String(seconds).padStart(2, '0')} s`;
            }

            const progress = 100 - Math.round((distance / initialCountdownDuration) * 100);
            progressBar.style.width = `${progress}%`;
            document.getElementById("progress-text").innerText = (progress >= 100) ? "Done..!" : `${progress}%`;

            countdownElem.style.color = (distance <= 10000) ? "#c40000" : "green";

            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownElem.textContent = "The sterilization process is complete.";
                countdownElem.style.color = "blue";
                countdownElem.style.fontSize = "40px";
                countdownElem.style.fontWeight = "bold";
                loadingCircle.style.display = "none";

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
                return;
            }
        }, 1000);
    }
}


function stopCountdown() {
    clearInterval(countdownInterval);
    countdownStarted = false;
    localStorage.removeItem("countdownEndTime");

    const countdownElem = document.getElementById("countdown");
    const loadingCircle = document.getElementById("loading-circle");
    const progressBar = document.getElementById("progress-bar");

    // إعادة تعيين العداد إلى 1:00
    if (countdownElem) {
        countdownElem.innerHTML = "00h : 1m : 00s";
        countdownElem.style.color = "black";
        countdownElem.style.fontSize = "40px";
        countdownElem.style.fontWeight = "bold";
    }

    if (progressBar) {
        progressBar.style.width = "0%";
    }
    
    const progressText = document.getElementById("progress-text");
    if (progressText) {
        progressText.innerText = "0%";
    }
    

    // إيقاف دائرة التحميل
    if (loadingCircle) {
        loadingCircle.style.display = "none";
    }
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


// Update text color according to switch status
document.querySelectorAll(".toggle-switch input").forEach(input => {
    input.addEventListener("change", function () {
        const statusDiv = this.closest('.card-1').querySelector('.status');
        const label = this.closest('.card-1').querySelector('.toggle-label');
        const state = this.checked ? "ON" : "OFF";
        label.textContent = state;
        statusDiv.style.color = this.checked ? "green" : "red";
    });
});

// Activate the active link
const links = document.querySelectorAll('nav ul li a');
links.forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});


// Robot movement and speed control code 
let currentMove = null;
let speed = 0; // السرعة المبدئية


// Send movement command
function sendMove(direction) {
    if (currentMove !== direction) {
        currentMove = direction;
        // إرسال الحركة للمحرك
        fetch(`/move?dir=${direction}&speed=${speed}`)
            .then(() => console.log(`✅ Moving: ${direction} at speed ${speed}`))
            .catch(err => console.error("❌ Error sending move:", err));
    }
}


function stopMove() {
    if (currentMove !== null) {
        fetch(`/move?dir=stop`) // إرسال أمر التوقف
            .then(() => console.log("🛑 Stopped"))
            .catch(err => console.error("❌ Error sending stop:", err));
        currentMove = null;
    }
}


// Update speed
function updateSpeed(val) {
  document.getElementById('speedVal').innerText = val;
  fetch(`/speed?val=${val}`)
    .then(() => console.log(`🚀 Speed: ${val}`))
    .catch(err => console.error("❌ Error setting speed:", err));
}


// Add touch and click events
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
