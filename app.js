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

// Variabili per l'Admin
const adminBtn = document.getElementById('admin-btn');
const addGiftBtn = document.getElementById('add-gift-btn');
const newGiftInput = document.getElementById('new-gift-input');
let isAdmin = false;

// Ascolto in tempo reale (ricarica la lista se aggiungi/rimuovi qualcosa)
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

// Creazione grafica dei regali (ora include il cestino)
function renderGift(id, name, isBooked) {
  const li = document.createElement('li');
  li.className = `gift-item ${isBooked ? 'booked' : ''}`;
  const safeName = name.replace(/'/g, "\\'");

  li.innerHTML = `
    <div class="gift-info">
      <div class="gift-name">${name}</div>
    </div>
    <div class="gift-actions">
      <!-- Cestino invisibile finché non inserisci la password -->
      <button class="delete-btn" onclick="deleteGift('${id}', '${safeName}')">🗑️</button>
      
      <div class="checkbox-wrapper">
        <input type="checkbox" id="${id}" ${isBooked ? 'checked' : ''} onchange="toggleGift('${id}', '${safeName}', this.checked, this)">
        <span class="checkmark"></span>
      </div>
    </div>
  `;
  listContainer.appendChild(li);
}

// Spunta del checkbox con alert
function toggleGift(id, name, isBooked, checkboxElement) {
  if (!isBooked) {
    const conferma = window.confirm(`${name} risulta già spuntato: desideri reinserirlo in lista?`);
    if (conferma) {
      db.ref('regali/' + id).update({ prenotato: false });
    } else {
      checkboxElement.checked = true;
    }
  } else {
    db.ref('regali/' + id).update({ prenotato: true });
  }
}

// --- LOGICA MAMMA E PAPÀ ---

// Clic sul tasto Modifica
adminBtn.addEventListener('click', () => {
  if (!isAdmin) {
    const psw = prompt("Inserisci la password per modificare la lista:");
    if (psw === "151025") {
      isAdmin = true;
      document.body.classList.add('admin-mode');
      adminBtn.innerHTML = "Chiudi Modifica";
    } else if (psw !== null) {
      alert("Password errata!");
    }
  } else {
    // Esce dalla modalità modifica
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    adminBtn.innerHTML = `Modifica<br><span class="admin-sub">(solo per mamma e papà)</span>`;
  }
});

// Aggiungere un nuovo regalo
addGiftBtn.addEventListener('click', () => {
  const name = newGiftInput.value.trim();
  if (name) {
    db.ref('regali').push({
      nome: name,
      prenotato: false
    });
    newGiftInput.value = ''; // Svuota la barra
  }
});

// Eliminare definitivamente un regalo
function deleteGift(id, name) {
  if (confirm(`Sei sicuro di voler eliminare definitivamente "${name}"?`)) {
    db.ref('regali/' + id).remove();
  }
}

// Tasto Stampa
document.getElementById('print-btn').addEventListener('click', () => {
  window.print();
});
