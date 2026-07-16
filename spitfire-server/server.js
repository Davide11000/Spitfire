const express = require('express');
const cors = require('cors');
const app = express();

// Porta del server
const PORT = 3000;

// Permette al server di leggere richieste cross-origin (Ionic su porta diversa)
app.use(cors());

// Permette al server di leggere dati in formato JSON
app.use(express.json());

// Rotta base
app.get('/', (req, res) => {
  res.send('Server attivo');
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});