let paymentInterval = null;
let paymentInProgress = false;
let paymentAbortController = null;
let timerInterval = null;
let time = 180;

const apiLink = "https://annoymous-production.up.railway.app/api";

// Packages loaded from backend — fallback if API fails
let packages = [];

let selectedPackage = null;
let accountState = { id: "", zone: "", name: "" };
let lastOrder = null;

function stopPaymentPolling() {
  paymentInProgress = false;
  if (paymentInterval) {
    clearInterval(paymentInterval);
    paymentInterval = null;
  }
  if (paymentAbortController) {
    paymentAbortController.abort();
    paymentAbortController = null;
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

// ── Load packages from backend ──────────────────────────────────
async function loadPackages() {
  try {
    const res = await fetch(apiLink + "/products");
    const json = await res.json();
    if (json?.data?.length > 0) {
      packages = json.data.map(p => ({
        id: p._id,
        amount: p.name,
        price: "$" + Number(p.price).toFixed(2),
        priceRaw: p.price,
        apiCode: p.apiCode || "",
        img: p.img || "",
        status: p.status,
      }));
    } else {
      throw new Error("No products");
    }
  } catch (e) {
    // Fallback hardcoded packages
    packages = [
      { id: 1, amount: "86 Diamonds",    price: "$0.99",  priceRaw: 0.99,  apiCode: "ML86",  img: "", status: "active" },
      { id: 2, amount: "172 Diamonds",   price: "$3.00",  priceRaw: 3.00,  apiCode: "ML172", img: "", status: "active" },
      { id: 3, amount: "257 Diamonds",   price: "$4.50",  priceRaw: 4.50,  apiCode: "ML257", img: "", status: "active" },
      { id: 4, amount: "706 Diamonds",   price: "$10.00", priceRaw: 10.00, apiCode: "ML706", img: "", status: "active" },
      { id: 5, amount: "Starlight Member", price: "$5.00", priceRaw: 5.00, apiCode: "MLSL",  img: "", status: "active" },
      { id: 6, amount: "Twilight Pass",  price: "$10.00", priceRaw: 10.00, apiCode: "MLTWI", img: "", status: "active" },
    ];
  }
  renderPackages();
}

function renderPackages() {
  const container = document.getElementById("package-list");
  if (!container) return;
  container.innerHTML = "";

  packages.forEach((pkg) => {
    const div = document.createElement("div");
    // បន្ថែម class package-card ដើម្បីងាយស្រួល Select ក្នុង CSS/JS
    div.className = "package-card p-3 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border border-slate-700 hover:border-blue-500/50";

    const imgSrc = pkg.img || "./img/mllogo.png";
    div.innerHTML = `
      <img src="${imgSrc}" class="w-10 h-10 mb-2 object-contain">
      <div class="text-[11px] font-bold text-slate-200">${pkg.amount}</div>
      <div class="text-blue-400 font-bold text-xs">${pkg.price}</div>
    `;

    div.onclick = () => {
      // ១. កែ Class Active
      document.querySelectorAll(".package-card").forEach(c => c.classList.remove("active", "border-blue-500", "bg-blue-500/10"));
      div.classList.add("active", "border-blue-500", "bg-blue-500/10");
      
      // ២. រក្សាទុកទិន្នន័យ
      selectedPackage = pkg;

      // ៣. បង្ហាញ Summary Box ខាងក្រោម (ដូច SakTopUp)
      const summary = document.getElementById('selection-summary');
      summary.classList.remove('invisible'); // បង្ហាញឱ្យឃើញ
      
      document.getElementById('selected-plan-price').innerText = pkg.price;
      document.getElementById('selected-plan-name').innerText = pkg.amount;
      
      // ៤. Animation បន្តិចឱ្យដឹងថាប្តូរ
      summary.animate([
        { transform: 'translateY(5px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ], { duration: 200 });
    };

    container.appendChild(div);
  });
}

function updateSummaryBox(pkg) {
    const summaryBox = document.getElementById('selection-summary');
    const displayPlan = document.getElementById('selected-plan-name');
    const displayPrice = document.getElementById('selected-plan-price');

    if (summaryBox && pkg) {
        // បង្ហាញ Box
        summaryBox.classList.remove('hidden');
        
        // បញ្ចូលទិន្នន័យ
        displayPlan.innerText = pkg.amount;
        displayPrice.innerText = pkg.price;

        // បន្ថែម Effect ភ្លឹបភ្លែតបន្តិចឱ្យ User ចាប់អារម្មណ៍
        summaryBox.classList.add('ring-2', 'ring-blue-500/50');
        setTimeout(() => summaryBox.classList.remove('ring-2', 'ring-blue-500/50'), 400);
    }
}

window.onload = loadPackages;

// ── Check Account ───────────────────────────────────────────────
function checkAccount() {
  const userId = document.getElementById("game_id")?.value?.trim();
  const zoneId = document.getElementById("zone_id")?.value?.trim();
  const submitBtn = document.getElementById("submit");
  const accountDisplay = document.getElementById("account_display");
  const accountNameSpan = document.getElementById("account_name");

  if (!userId || !zoneId) {
    showToast("សូមបញ្ចូល ID និង Zone ឱ្យបានត្រឹមត្រូវ!");
    return;
  }

  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> កំពុងឆែក...';
    submitBtn.disabled = true;
  }

  const url = `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(userId)}&zone=${encodeURIComponent(zoneId)}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!accountDisplay || !accountNameSpan) return;
      accountDisplay.classList.remove("hidden");
      if (data.success) {
        accountNameSpan.innerText = data.name;
        accountNameSpan.style.color = "";
        accountState = { id: userId, zone: zoneId, name: data.name };
      } else {
        accountNameSpan.innerText = "រកមិនឃើញគណនីឡើយ";
        accountNameSpan.style.color = "red";
        accountState = { id: userId, zone: zoneId, name: "" };
        showToast("រកមិនឃើញគណនីឡើយ!");
      }
    })
    .catch(() => {
      showToast("មានបញ្ហាបច្ចេកទេសក្នុងការតភ្ជាប់!");
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> ពិនិត្យឈ្មោះគណនី';
        submitBtn.disabled = false;
      }
    });
}

// ── Process Payment ─────────────────────────────────────────────
function processPayment() {
  const id = document.getElementById("game_id")?.value?.trim();
  const zone = document.getElementById("zone_id")?.value?.trim();
  const accountName = document.getElementById("account_name")?.innerText;

  if (!id || !zone) {
    showToast("សូមបញ្ចូលលេខសម្គាល់គណនី!");
    return;
  }
  if (!selectedPackage) {
    showToast("សូមជ្រើសរើសកញ្ចប់ដែលចង់ទិញ!");
    return;
  }
  if (!accountName || accountName === "..." || accountName === "រកមិនឃើញគណនីឡើយ") {
    showToast("សូមពិនិត្យឈ្មោះគណនីជាមុនសិន!");
    return;
  }

  document.getElementById("modal_acc_name").innerText = accountName;
  document.getElementById("modal_acc_id").innerText = `${id} (${zone})`;
  document.getElementById("modal_package").innerText = selectedPackage.amount;
  document.getElementById("modal_price").innerText = selectedPackage.price;

  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function finalCheckout() {
  closeConfirmModal();
  const cleanPrice = selectedPackage.priceRaw ?? parseFloat(selectedPackage.price.replace("$", ""));
  generateOrder(cleanPrice, selectedPackage.amount, selectedPackage.apiCode);
}

// ── Generate Order + KHQR ───────────────────────────────────────
async function generateOrder(price, planName, apiCode) {
  try {
    const response = await fetch(apiLink + "/generatekhqr", {
      method: "POST",
      body: JSON.stringify({
        price,
        planName,
        apiCode: apiCode || "",
        userId:   accountState.id,
        zone:     accountState.zone,
        userName: accountState.name,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const json = await response.json();
    console.log("generateOrder:", response.status, json);

    if (!response.ok || !json?.data?.qr || !json?.data?.md5) {
      throw new Error("Invalid server response");
    }

    const { qr, md5, orderId } = json.data;
    lastOrder = { price, planName, orderId };
    setShowQR(price, qr);
    checkUserPayment(md5);
  } catch (error) {
    console.error("generateOrder error:", error);
    showToast("Error connecting to server");
  }
}

// ── Poll Payment ────────────────────────────────────────────────
function checkUserPayment(md5) {
  stopPaymentPolling();
  paymentInProgress = true;

  paymentInterval = setInterval(async () => {
    if (!paymentInProgress) return;

    paymentAbortController = new AbortController();

    try {
      const response = await fetch(apiLink + "/checkkhqr", {
        method: "POST",
        body: JSON.stringify({ md5 }),
        headers: { "Content-Type": "application/json" },
        signal: paymentAbortController.signal,
      });

      if (!paymentInProgress) return;

      const json = await response.json();
      console.log("checkkhqr:", response.status, json);

      const paid =
        json?.success === true ||
        json?.success === "true" ||
        json?.success === 1 ||
        json?.responseCode === 0 ||
        json?.responseCode === "0" ||
        json?.data?.responseCode === 0 ||
        json?.details?.responseCode === 0 ||
        json?.details?.responseCode === "0";

      if (paid && paymentInProgress) {
        stopPaymentPolling();
        stopTimer();
        closeQR();
        showReceipt();
      }
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("checkUserPayment error:", error);
    }
  }, 2000);
}

// ── Timer ───────────────────────────────────────────────────────
function startTimer() {
  const timerElement = document.getElementById("timer");
  if (!timerElement) return;
  stopTimer();
  timerInterval = setInterval(() => {
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    timerElement.textContent = `${minutes}:${seconds}`;
    if (time > 0) {
      time--;
    } else {
      stopTimer();
      closeQR();
      showToast("QR ផុតកំណត់");
    }
  }, 1000);
}

function resetTimer() {
  time = 180;
  startTimer();
}

// ── QR Display ──────────────────────────────────────────────────
function setShowQR(price, qr) {
  const showQR = document.getElementById("showQR");
  if (!showQR) return;

  showQR.innerHTML = `
    <div id="qrOverlay" style="
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 150;
    ">
      <div class="KHQR" id="qrContent">
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
                        <stop stop-color="#28B4C3"/><stop offset="1" stop-color="#E8EEF1"/>
                      </linearGradient>
                      <linearGradient id="paint1_linear" x1="15.8401" y1="20.3601" x2="12.8663" y2="4.9307" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#0BBCD4"/><stop offset="1" stop-color="#0BBCD4" stop-opacity="0"/>
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
                <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qr)}" alt="">
                <img class="usd" src="img/usd-khqr-logo.svg" alt="">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  resetTimer();

  const overlay = document.getElementById("qrOverlay");
  const card = overlay?.querySelector(".card");

  const handleOutsideClick = (e) => {
    if (card && !card.contains(e.target)) closeQR();
  };
  overlay?.addEventListener("click", handleOutsideClick);
  overlay?.querySelector(".KHQR")?.addEventListener("click", handleOutsideClick);
}

function closeQR() {
  stopPaymentPolling();
  stopTimer();
  const showQR = document.getElementById("showQR");
  if (showQR) showQR.innerHTML = "";
}

// ── Receipt ─────────────────────────────────────────────────────
function getCurrentDate() {
  const today = new Date();
  return `${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;
}

function showReceipt() {
  const name     = accountState.name || document.getElementById("account_name")?.innerText || "";
  const id       = accountState.id   || document.getElementById("game_id")?.value || "";
  const zone     = accountState.zone || document.getElementById("zone_id")?.value || "";
  const planName = lastOrder?.planName || selectedPackage?.amount || "";
  const price    = lastOrder?.price ?? parseFloat(selectedPackage?.price?.replace("$","") || "0");
  const orderId  = lastOrder?.orderId || "";

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px";

  overlay.innerHTML = `
    <div style="width:100%;max-width:380px;background:#0f172a;border:1px solid rgba(148,163,184,.2);border-radius:20px;overflow:hidden">
      <div style="padding:16px;background:#2563eb;color:#fff;text-align:center;font-weight:700">✅ Payment Success!</div>
      <div style="padding:16px;color:#e2e8f0;font-size:14px;line-height:1.8">
        ${orderId ? `<div><b>Order ID:</b> <span style="font-family:monospace;font-size:12px;color:#60a5fa">${escapeHtml(orderId)}</span></div>` : ""}
        <div><b>Date:</b> ${getCurrentDate()}</div>
        <div><b>User:</b> ${escapeHtml(name)}</div>
        <div><b>ID:</b> ${escapeHtml(id)} (${escapeHtml(zone)})</div>
        <div><b>Package:</b> ${escapeHtml(planName)}</div>
        <div style="margin-top:8px;font-size:18px"><b>Total:</b> <span style="color:#4ade80">$${Number(price).toFixed(2)}</span></div>
        <div style="margin-top:8px;font-size:11px;color:#94a3b8">Diamonds will be delivered to your account shortly.</div>
        <button id="receiptCloseBtn" style="margin-top:14px;width:100%;padding:12px;border-radius:14px;border:0;background:#334155;color:#fff;font-weight:700;cursor:pointer">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const closeReceipt = () => { if (document.body.contains(overlay)) document.body.removeChild(overlay); };
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeReceipt(); });
  overlay.querySelector("#receiptCloseBtn")?.addEventListener("click", closeReceipt);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

window.checkAccount     = checkAccount;
window.processPayment   = processPayment;
window.closeConfirmModal = closeConfirmModal;
window.finalCheckout    = finalCheckout;
