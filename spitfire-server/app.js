const express = require('express');
const cors = require('cors');

require('dotenv').config();

const app = express();

console.log("app.js");

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

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

const artistRoutes = require('./routes/artistRoutes');
app.use('/artists', artistRoutes);

const recordRoutes = require('./routes/recordRoutes');
app.use('/records', recordRoutes);

const requestRoutes = require('./routes/requestRoutes');
app.use('/requests', requestRoutes);

const genreRoutes = require('./routes/genreRoutes');
app.use('/genres', genreRoutes);

const lyricsRoutes = require('./routes/lyricsRoutes');
app.use('/lyrics', lyricsRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/comments', commentRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/reports', reportRoutes);

const messageRoutes = require('./routes/messageRoutes');
app.use('/messages', messageRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notifications', notificationRoutes);

const annotationRoutes = require('./routes/annotationRoutes');
app.use('/annotations', annotationRoutes);

const contributionRoutes = require('./routes/contributionRoutes');
app.use('/contributors', contributionRoutes);

const ratingRoutes = require('./routes/ratingRoutes');
app.use('/ratings', ratingRoutes);

const chartRoutes = require('./routes/chartRoutes');
app.use('/charts', chartRoutes);

const aboutRoutes = require('./routes/aboutRoutes');
app.use('/abouts', aboutRoutes);

const roleRequestRoutes = require('./routes/roleRequestRoutes');
app.use('/role-requests', roleRequestRoutes);

module.exports = app;