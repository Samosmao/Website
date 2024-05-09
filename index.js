const choEllist = document.querySelectorAll('.cho');

choEllist.forEach(choEl => {
  choEl.addEventListener('click', () => {
    document.querySelector('.nice')?.classList.remove('nice');
    choEl.classList.add('nice');
  });
});

let Abatotal = 0;
let Buytotal = 0;

const diamondPrices = {
  '0.2': 0.2,
  '0.5': 0.5,
  '1': 1,
  '2': 2,
  '5': 5,
  '10': 10,
  '20': 20,
  '50': 50,
  '100': 100,
  '200': 200,
  '500': 500,
  '1000': 1000,
};

function selectDiamond(diamondAmount) {
  Abatotal = diamondPrices[diamondAmount] || 0;
  Buytotal = diamondPrices[diamondAmount] || 0;

  updateTotal();
}

function updateTotal() {
  document.getElementById('Abatotal').textContent = `$${Abatotal.toFixed(2)}`;
  document.getElementById('Buytotal').textContent = `$${Buytotal.toFixed(2)}`;
}

function checkout() {
  const totalAmount = Abatotal + Buytotal;
  alert(`Total Amount: $${totalAmount.toFixed(2)}`);
}

function openModal() {
  document.getElementById('termsModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('termsModal').style.display = 'none';
}

const button = document.getElementById('btn');

button.addEventListener('click', () => {

  alert('successfully!');
});