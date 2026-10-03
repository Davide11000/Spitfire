const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server attivo');
});

const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

const usersRoutes = require('./routes/userRoutes');
app.use('/users', usersRoutes);

const followRoutes = require('./routes/followRoutes');
app.use('/follows', followRoutes);

const songRoutes = require('./routes/songRoutes');
app.use('/songs', songRoutes);

const playlistRoutes = require('./routes/playlistRoutes');
app.use('/playlists', playlistRoutes);

module.exports = app;