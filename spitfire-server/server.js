const app = require('./app');

const PORT = 3000;

console.log("server.js");

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});