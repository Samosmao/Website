
let timerInterval;
let time = 180; 


const packages = [
            { id: 1, amount: "86 Diamonds", price: "$1.50" },
            { id: 2, amount: "172 Diamonds", price: "$3.00" },
            { id: 3, amount: "257 Diamonds", price: "$4.50" },
            { id: 4, amount: "706 Diamonds", price: "$10.00" },
            { id: 5, amount: "Starlight Member", price: "$5.00" },
            { id: 6, amount: "Twilight Pass", price: "$10.00" }
        ];

        let selectedPackage = null;

        function initPackages() {
            const container = document.getElementById('package-list');
            packages.forEach(pkg => {
                const div = document.createElement('div');
                div.className = 'package-card p-3 rounded-xl flex flex-col items-center justify-center text-center';
                div.innerHTML = `
                    <img src="https://upload.wikimedia.org/wikipedia/en/2/29/Mobile_Legends_Bang_Bang_Logo.png" class="w-8 mb-2 opacity-50 grayscale" alt="ML">
                    <div class="text-xs font-bold mb-1">${pkg.amount}</div>
                    <div class="text-blue-400 font-bold text-sm">${pkg.price}</div>
                `;
                div.onclick = () => {
                    document.querySelectorAll('.package-card').forEach(c => c.classList.remove('active'));
                    div.classList.add('active');
                    selectedPackage = pkg;
                };
                container.appendChild(div);
            });
        }
        function processPayment() {
            const id = document.getElementById('game_id').value;
            if (!id) {
                showToast("សូមបញ្ចូលលេខសម្គាល់គណនី!");
                return;
            }
            if (!selectedPackage) {
                showToast("សូមជ្រើសរើសកញ្ចប់ដែលចង់ទិញ!");
                return;
            }

            showToast("កំពុងបញ្ជូនទៅកាន់ Bakong...");
            // Link to payment processing or redirect
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

        window.onload = initPackages;



function checkAccount() {

    const userId = document.getElementById('game_id').value;
    const zoneId = document.getElementById('zone_id').value;
    const submitBtn = document.getElementById('submit');
    const accountDisplay = document.getElementById('account_display');
    const accountNameSpan = document.getElementById('account_name');

    if (!userId || !zoneId) {
        showToast("សូមបញ្ចូល ID និង Zone ឱ្យបានត្រឹមត្រូវ!");
        return;
    }

    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុងឆែក...';
    submitBtn.disabled = true;

    const url = `https://api.isan.eu.org/nickname/ml?id=${userId}&zone=${zoneId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show the display box and set the name
                accountDisplay.classList.remove('hidden');
                accountNameSpan.innerText = data.name;
                accountNameSpan.style.color = ""; 
                showToast("រកឃើញឈ្មោះគណនីជោគជ័យ!");
            } else {
                // Handle user not found
                accountDisplay.classList.remove('hidden');
                accountNameSpan.innerText = 'រកមិនឃើញគណនីឡើយ';
                accountNameSpan.style.color = "red";
                showToast("រកមិនឃើញគណនីឡើយ!");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast("មានបញ្ហាបច្ចេកទេសក្នុងការតភ្ជាប់!");
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> ពិនិត្យឈ្មោះគណនី';
            submitBtn.disabled = false;
        });
}

function showAlert(message, type) {

}

// 1. Updated Process Payment to show the Modal first
function processPayment() {
    const id = document.getElementById('game_id').value;
    const zone = document.getElementById('zone_id').value;
    const accountName = document.getElementById('account_name').innerText;

    // Validation
    if (!id || !zone) {
        showToast("សូមបញ្ចូលលេខសម្គាល់គណនី!");
        return;
    }
    if (!selectedPackage) {
        showToast("សូមជ្រើសរើសកញ្ចប់ដែលចង់ទិញ!");
        return;
    }
    // Check if account was actually verified
    if (accountName === "..." || accountName === "រកមិនឃើញគណនីឡើយ") {
        showToast("សូមពិនិត្យឈ្មោះគណនីជាមុនសិន!");
        return;
    }

    // Populate Modal Data
    document.getElementById('modal_acc_name').innerText = accountName;
    document.getElementById('modal_acc_id').innerText = `${id} (${zone})`;
    document.getElementById('modal_package').innerText = selectedPackage.amount;
    document.getElementById('modal_price').innerText = selectedPackage.price;

    // Show Modal
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// 2. Function to close modal
function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// 3. Final action when user clicks "Confirm" in the modal
function finalCheckout() {
    closeConfirmModal();
    showToast("កំពុងបញ្ជូនទៅកាន់ Bakong...");
    
    // Trigger your QR Generation logic
    // Using your existing variables
    const cleanPrice = parseFloat(selectedPackage.price.replace('$', ''));
    
    // Call your existing KHQR logic
    generateOrder(cleanPrice, selectedPackage.amount);
}

// Helper to bridge your existing buyNow logic
function generateOrder(price, name) {
    // This matches the logic you had in buyNow()
    fetch(apiLink + "/generatekhqr", {
        method: "POST",
        body: JSON.stringify({
            price: price,
            planName: name
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .then((json) => {
        if(json.data) {
            const { price, qr, md5 } = json.data;
            setShowQR(price, qr);
            checkUserPayment(md5);
        }
    })
    .catch(err => showToast("Error connecting to server"));
}

function startTimer() {
  const timerElement = document.getElementById("timer");
  if (!timerElement) return; 
  
  let minutes, seconds;
  timerInterval = setInterval(() => {
    minutes = Math.floor(time / 60);
    seconds = time % 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerElement.textContent = `${minutes}:${seconds}`;

    if (time > 0) {
      time--;
    } else {
      clearInterval(timerInterval);
      closeQR();
    }
  }, 1000);
}

function resetTimer() {
  time = 180;
  if (timerInterval) {
    clearInterval(timerInterval); 
  }
  startTimer(); 
}

function setShowQR(price, qr) {
  const showQR = document.getElementById('showQR');
  showQR.innerHTML = `
    <div class="KHQR">
        <div class="KHQRcontainer">
          <div class="card">
            <div class="KHQRheader">
              <img class="logoKHQR" src="img/KHQR Logo.png" alt="">
            </div>
            <div class="right"></div>
            <div class="name">
            <div class="flexqr">
              <div class="oneBox">
                <span class="shop-name">Annoymous Shop</span>
                <div class="amount">${price} <span class="currency">USD</span></div>
              </div>
              <div class="loader-container">
                  <svg class="spin" width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="12" r="9" stroke="#E8EEF1" stroke-width="4"/>
    <circle cx="11" cy="12" r="9" stroke="url(#paint0_linear)" stroke-width="4"/>
    <path d="M11.2001 2.70005C16.4801 2.70005 20.0001 6.63995 20.0001 11.5001C20.0001 16.3602 16.4801 21.1801 11.2001 21.1801" stroke="url(#paint1_linear)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear" x1="25.08" y1="14.2" x2="11" y2="12" gradientUnits="userSpaceOnUse">
        <stop stop-color="#28B4C3"/>
        <stop offset="1" stop-color="#E8EEF1"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="15.8401" y1="20.3601" x2="12.8663" y2="4.9307" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0BBCD4"/>
        <stop offset="1" stop-color="#0BBCD4" stop-opacity="0"/>
      </linearGradient>
    </defs>
  </svg>
                  <div class="timer" id="timer">03:00</div>
                </div>
              
            </div>
            <svg width="auto" height="2" viewBox="0 0 400 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0.845703H400" stroke="black" stroke-opacity="0.5" stroke-dasharray="8 8"/>
            </svg>
            <div class="QRImg">
              <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr}" alt="">
              <img class="usd" src="img/usd-khqr-logo.svg" alt="">
            </div>
          </div>
        </div>
      </div>
  `;

  resetTimer();
}

function closeQR() {
  const showQR = document.getElementById('showQR');
  showQR.innerHTML = "";
}

const apiLink = "http://127.0.0.1/api";

const buyNow = () => {
  fetch(apiLink + "/generatekhqr", {
    method: "POST",
    body: JSON.stringify({
      price: selectedItemPrice,
      planName: selectedItemName
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then((response) => response.json())
    .then((json) => {
      const { price, qr, md5 } = json.data;
      setShowQR(price, qr);
      checkUserPayment(md5);
    });
}

const checkUserPayment = (md5) => {
  sleep(2000).then(() => {
    fetch(apiLink + "/checkkhqr", {
      method: "POST",
      body: JSON.stringify({
        md5
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          closeQR();
          showInvoice(selectedItemPrice, selectedItemName);
        } else {
          checkUserPayment(md5);
        }
      });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
}

function showInvoice(price, itemName) {
  const invoiceContainer = document.createElement('div');
  invoiceContainer.className = 'invoice';
  const currentDate = getCurrentDate();
  const userName = document.getElementById('responseName').innerText;

  invoiceContainer.innerHTML = `
  <div class="invoice">
    <h2>Payment Success</h2>
    <p class="item-value1">Date: <p class="statusthree">${currentDate}</p></p>
    <p class="item-value2">Item: <p class="statusthree">${itemName}</p></p>
    <p class="item-value3">Total Price: <p class="statusthree">${price.toFixed(2)}$</p></p>
    <p class="item-value4">User: <span id="responseName">${userName}</span></p>
    <p class="item-value5">Status: <p class="status">Success</p></p>
    <button id="closeInvoice">Close</button>
  </div>
  `;

  document.body.appendChild(invoiceContainer);

  document.getElementById('closeInvoice').addEventListener('click', () => {
    document.body.removeChild(invoiceContainer);
  });
}
