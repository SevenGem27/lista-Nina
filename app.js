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

// Variabili Admin
const adminBtn = document.getElementById('admin-btn');
const addGiftBtn = document.getElementById('add-gift-btn');
const newGiftInput = document.getElementById('new-gift-input');
const newGiftLink = document.getElementById('new-gift-link');
const toggleImportBtn = document.getElementById('toggle-import-btn');
const importArea = document.getElementById('import-area');
const importText = document.getElementById('import-text');
const confirmImportBtn = document.getElementById('confirm-import-btn');
let isAdmin = false;

// Ascolto in tempo reale
giftsRef.on('value', (snapshot) => {
  listContainer.innerHTML = '';
  const data = snapshot.val();
  
  if (data) {
    Object.keys(data).forEach(key => {
      const gift = data[key];
      renderGift(key, gift.nome, gift.prenotato, gift.link);
    });
  }
});

// Creazione della lista
function renderGift(id, name, isBooked, link) {
  const li = document.createElement('li');
  li.className = `gift-item ${isBooked ? 'booked' : ''}`;
  const safeName = name.replace(/'/g, "\\'");
  
  let linkHTML = '';
  if (link && link.trim() !== '') {
    let safeLink = link.startsWith('http') ? link : 'https://' + link;
    linkHTML = `<a href="${safeLink}" target="_blank" class="gift-link-btn" title="Acquista online">🛒 Acquista qui</a>`;
  }

  li.innerHTML = `
    <div class="gift-info">
      <div class="gift-name">${name}</div>
      ${linkHTML}
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

// Conferma Prenotazione
function toggleGift(id, name, isBooked, checkboxElement) {
  if (isBooked) {
    if (window.confirm(`Confermi di voler prenotare "${name}"?`)) {
      db.ref('regali/' + id).update({ prenotato: true });
    } else {
      checkboxElement.checked = false; 
    }
  } else {
    if (window.confirm(`"${name}" risulta già spuntato: desideri reinserirlo in lista?`)) {
      db.ref('regali/' + id).update({ prenotato: false });
    } else {
      checkboxElement.checked = true; 
    }
  }
}

// Accesso Area Riservata
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

// Aggiungere 1 singolo regalo
addGiftBtn.addEventListener('click', () => {
  const name = newGiftInput.value.trim();
  const link = newGiftLink.value.trim();
  if (name) {
    db.ref('regali').push({ nome: name, prenotato: false, link: link });
    newGiftInput.value = '';
    newGiftLink.value = '';
  }
});

// Eliminare regalo
function deleteGift(id, name) {
  if (confirm(`Sei sicuro di voler eliminare definitivamente "${name}"?`)) {
    db.ref('regali/' + id).remove();
  }
}

// IMPORTAZIONE VELOCE DA TESTO
toggleImportBtn.addEventListener('click', () => {
  // Mostra/Nasconde l'area testo
  importArea.style.display = importArea.style.display === 'none' ? 'flex' : 'none';
});

confirmImportBtn.addEventListener('click', () => {
  const lines = importText.value.split('\n'); // Divide il testo in righe
  let count = 0;

  lines.forEach(line => {
    let text = line.trim();
    if (text !== '') {
      let nomeRegalo = text;
      let linkRegalo = '';

      // Cerca se nella riga c'è un "http"
      const linkStart = text.indexOf('http');
      
      if (linkStart !== -1) {
        // Separa il link dal nome
        linkRegalo = text.substring(linkStart).trim();
        nomeRegalo = text.substring(0, linkStart).trim();
        
        // Pulisce l'ultimo carattere del nome se è un trattino, virgola o punto
        nomeRegalo = nomeRegalo.replace(/[\,\-\.\:]+$/, '').trim();
      }

      if (nomeRegalo) {
        db.ref('regali').push({
          nome: nomeRegalo,
          prenotato: false,
          link: linkRegalo
        });
        count++;
      }
    }
  });

  if (count > 0) {
    alert(`🎉 Fatto! Sono stati aggiunti ${count} nuovi regali in lista.`);
    importText.value = '';
    importArea.style.display = 'none'; // Richiude l'area
  } else {
    alert("Nessun testo trovato. Incolla la tua lista nello spazio apposito.");
  }
});

// Tasto Stampa
document.getElementById('print-btn').addEventListener('click', () => {
  window.print();
});
