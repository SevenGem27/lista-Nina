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
const newGiftLink = document.getElementById('new-gift-link'); // Nuovo elemento link
let isAdmin = false;

// Ascolto in tempo reale
giftsRef.on('value', (snapshot) => {
  listContainer.innerHTML = '';
  const data = snapshot.val();
  
  if (data) {
    Object.keys(data).forEach(key => {
      const gift = data[key];
      // Passo anche il link alla funzione (se esiste)
      renderGift(key, gift.nome, gift.prenotato, gift.link);
    });
  }
});

// Creazione della lista
function renderGift(id, name, isBooked, link) {
  const li = document.createElement('li');
  li.className = `gift-item ${isBooked ? 'booked' : ''}`;
  const safeName = name.replace(/'/g, "\\'");
  
  // Costruisce il bottone del link SOLO se c'è un link salvato nel database
  let linkHTML = '';
  if (link && link.trim() !== '') {
    // Si assicura che il link si apra in una nuova scheda
    let safeLink = link.startsWith('http') ? link : 'https://' + link;
    linkHTML = `<a href="${safeLink}" target="_blank" class="gift-link-btn" title="Acquista online">🛒 Acquista qui</a>`;
  }

  li.innerHTML = `
    <div class="gift-info">
      <div class="gift-name">${name}</div>
      ${linkHTML} <!-- Inserisce il bottoncino (o nulla se non c'è) -->
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

function toggleGift(id, name, isBooked, checkboxElement) {
  if (isBooked) {
    const conferma = window.confirm(`Confermi di voler prenotare "${name}"?`);
    if (conferma) {
      db.ref('regali/' + id).update({ prenotato: true });
    } else {
      checkboxElement.checked = false; 
    }
  } else {
    const conferma = window.confirm(`"${name}" risulta già spuntato: desideri reinserirlo in lista?`);
    if (conferma) {
      db.ref('regali/' + id).update({ prenotato: false });
    } else {
      checkboxElement.checked = true; 
    }
  }
}

adminBtn.addEventListener('click', () => {
  if (!isAdmin) {
    const psw = prompt("Area riservata a mamma e papà.\nInserisci la password per modificare la lista:");
    if (psw === "151025") {
      isAdmin = true;
      document.body.classList.add('admin-mode');
      adminBtn.innerHTML = "❌ Chiudi Modifica";
    } else if (psw !== null) {
      alert("Password errata!");
    }
  } else {
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    adminBtn.innerHTML = "⚙️ Modifica";
  }
});

// Aggiungere un regalo con link opzionale
addGiftBtn.addEventListener('click', () => {
  const name = newGiftInput.value.trim();
  const link = newGiftLink.value.trim(); // Cattura anche il link
  
  if (name) {
    db.ref('regali').push({
      nome: name,
      prenotato: false,
      link: link // Salva il link nel database
    });
    
    // Svuota entrambi i campi dopo l'inserimento
    newGiftInput.value = '';
    newGiftLink.value = '';
  }
});

function deleteGift(id, name) {
  if (confirm(`Sei sicuro di voler eliminare definitivamente "${name}"?`)) {
    db.ref('regali/' + id).remove();
  }
}

document.getElementById('print-btn').addEventListener('click', () => {
  window.print();
});
