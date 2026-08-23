const firebaseConfig = {
  apiKey: "AIzaSyC2zsBDV2dO8zqI1H6Brpy3ENpGRBApqc0",
  authDomain: "lista-nina.firebaseapp.com",
  databaseURL: "https://lista-nina-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "lista-nina",
  storageBucket: "lista-nina.firebasestorage.app",
  messagingSenderId: "988324882362",
  appId: "1:988324882362:web:07099ba20165d8ca7e1f83"
};

// Inizializza Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const giftsRef = db.ref('regali');

const listContainer = document.getElementById('gift-list');

// Sincronizzazione lista in tempo reale
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

// Creazione degli elementi nella lista
function renderGift(id, name, isBooked) {
  const li = document.createElement('li');
  li.className = `gift-item ${isBooked ? 'booked' : ''}`;
  
  // Protegge il codice nel caso in cui un regalo abbia un apostrofo nel nome (es. "L'orsacchiotto")
  const safeName = name.replace(/'/g, "\\'");

  li.innerHTML = `
    <div class="gift-info">
      <div class="gift-name">${name}</div>
    </div>
    <div class="checkbox-wrapper">
      <input type="checkbox" id="${id}" ${isBooked ? 'checked' : ''} onchange="toggleGift('${id}', '${safeName}', this.checked, this)">
      <span class="checkmark"></span>
    </div>
  `;
  listContainer.appendChild(li);
}

// Scrittura nel database con alert di conferma per chi disdice
function toggleGift(id, name, isBooked, checkboxElement) {
  if (!isBooked) {
    // L'utente sta cercando di togliere una spunta già messa
    const conferma = window.confirm(`${name} risulta già spuntato: desideri reinserirlo in lista?`);
    
    if (conferma) {
      // L'utente ha confermato -> aggiorniamo il database rimettendo il regalo "libero"
      db.ref('regali/' + id).update({ prenotato: false });
    } else {
      // L'utente ha annullato -> ripristiniamo la spunta visivamente per rimediare all'errore
      checkboxElement.checked = true;
    }
  } else {
    // L'utente sta prenotando il regalo per la prima volta -> nessun alert, salva subito
    db.ref('regali/' + id).update({ prenotato: true });
  }
}

// Funzione bottone stampa
document.getElementById('print-btn').addEventListener('click', () => {
  window.print();
});
