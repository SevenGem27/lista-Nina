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
  
  li.innerHTML = `
    <div class="gift-info">
      <div class="gift-name">${name}</div>
    </div>
    <div class="checkbox-wrapper">
      <input type="checkbox" id="${id}" ${isBooked ? 'checked' : ''} onchange="toggleGift('${id}', this.checked)">
      <span class="checkmark"></span>
    </div>
  `;
  listContainer.appendChild(li);
}

// Scrittura nel database
function toggleGift(id, isBooked) {
  db.ref('regali/' + id).update({
    prenotato: isBooked
  });
}
