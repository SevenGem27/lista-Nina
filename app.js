const firebaseConfig = {
  apiKey: "AIzaSyC2zsBDV2dO8zqI1H6Brpy3ENpGRBApqc0",
  authDomain: "lista-nina.firebaseapp.com",
  databaseURL: "https://lista-nina-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lista-nina",
  storageBucket: "lista-nina.firebasestorage.app",
  messagingSenderId: "988324882362",
  appId: "1:988324882362:web:07099ba20165d8ca7e1f83"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const giftsRef = db.ref('regali');
const listContainer = document.getElementById('gift-list');

const adminBtn = document.getElementById('admin-btn');
const addGiftBtn = document.getElementById('add-gift-btn');
const newGiftInput = document.getElementById('new-gift-input');
let isAdmin = false;

// Ascolto in tempo reale
giftsRef.on('value', (snapshot) => {
  listContainer.innerHTML = '';
  const data = snapshot.val();
  
  if (data) {
    Object.keys(data).forEach(key => {
      const gift = data[key];
      renderGift(key, gift.nome, gift.prenotato);
    });
  }
});

// Creazione della lista
function renderGift(id, name, isBooked) {
  const li = document.createElement('li');
  li.className = `gift-item ${isBooked ? 'booked' : ''}`;
  const safeName = name.replace(/'/g, "\\'");

  li.innerHTML = `
    <div class="gift-info">
      <div class="gift-name">${name}</div>
    </div>
    <div class="gift-actions">
      <button class="delete-btn" onclick="deleteGift('${id}', '${safeName}')">🗑️</button>
      <div class="checkbox-wrapper">
        <input type="checkbox" id="${id}" ${isBooked ? 'checked' : ''} onchange="toggleGift('${id}', '${safeName}', this.checked, this)">
        <span class="checkmark"></span>
      </div>
    </div>
  `;
  listContainer.appendChild(li);
}

// DOPPIA CONFERMA (Per prenotare e per disdire)
function toggleGift(id, name, isBooked, checkboxElement) {
  if (isBooked) {
    // L'utente ha cliccato per PRENOTARE il regalo
    const conferma = window.confirm(`Confermi di voler prenotare "${name}"?`);
    if (conferma) {
      db.ref('regali/' + id).update({ prenotato: true });
    } else {
      checkboxElement.checked = false; // Toglie la spunta se l'utente annulla
    }
  } else {
    // L'utente ha cliccato per DISDIRE il regalo
    const conferma = window.confirm(`"${name}" risulta già spuntato: desideri reinserirlo in lista?`);
    if (conferma) {
      db.ref('regali/' + id).update({ prenotato: false });
    } else {
      checkboxElement.checked = true; // Rimette la spunta se l'utente annulla
    }
  }
}

// LOGICA MAMMA E PAPÀ
adminBtn.addEventListener('click', () => {
  if (!isAdmin) {
    // Il testo del popup specifica che l'area è riservata
    const psw = prompt("Area riservata a mamma e papà.\nInserisci la password per modificare la lista:");
    if (psw === "151025") {
      isAdmin = true;
      document.body.classList.add('admin-mode');
      adminBtn.innerHTML = "❌ Chiudi Modifica"; // Cambia il testo del bottone
    } else if (psw !== null) {
      alert("Password errata!");
    }
  } else {
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    adminBtn.innerHTML = "⚙️ Modifica"; // Riporta il bottone allo stato originale
  }
});

// Aggiungere un regalo
addGiftBtn.addEventListener('click', () => {
  const name = newGiftInput.value.trim();
  if (name) {
    db.ref('regali').push({
      nome: name,
      prenotato: false
    });
    newGiftInput.value = '';
  }
});

// Eliminare un regalo
function deleteGift(id, name) {
  if (confirm(`Sei sicuro di voler eliminare definitivamente "${name}"?`)) {
    db.ref('regali/' + id).remove();
  }
}

// Tasto Stampa
document.getElementById('print-btn').addEventListener('click', () => {
  window.print();
});
