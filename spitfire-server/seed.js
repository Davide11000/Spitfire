
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3");

process.chdir(__dirname);
const DB_FILE = "./database.sqlite";
const PASSWORD = "password123";

const users = [
  { username: "giulia", email: "giulia@spitfire.it", ruolo: "moderatore", bio: "Moderatrice. Vivo di vinili e caffè." },
  { username: "luca", email: "luca@spitfire.it", bio: "Rap, jazz e tutto quello che sta in mezzo." },
  { username: "sara", email: "sara@spitfire.it", bio: "Indie e cantautorato. Sempre con le cuffie." },
  { username: "marco", email: "marco@spitfire.it", bio: "Batterista mancato, ascoltatore a tempo pieno." },
  { username: "elena", email: "elena@spitfire.it", bio: "Traduco testi per passione." },
  { username: "francesco", email: "francesco@spitfire.it", bio: "Classic rock o niente." },
  { username: "chiara", email: "chiara@spitfire.it", bio: "Soul, R&B e playlist per ogni momento." },
  { username: "alessandro", email: "alessandro@spitfire.it", bio: "Collezionista di prime stampe." },
  { username: "martina", email: "martina@spitfire.it", bio: "Pop senza vergogna." },
  { username: "paolo", email: "paolo@spitfire.it", bio: "Elettronica e musica da viaggio." },
  { username: "federica", email: "federica@spitfire.it", bio: "Concerti, festival, ripeti." },
  { username: "simone", email: "simone@spitfire.it", bio: "Ascolto album interi, dall'inizio alla fine." }
];

const artists = [
  { name: "Nick Drake", birth: "1948-06-19", country: "United Kingdom", bio: "English singer-songwriter known for his intimate acoustic albums of the late 1960s and early 1970s." },
  { name: "Pink Floyd", birth: null, country: "United Kingdom", bio: "English rock band formed in London in 1965, famous for their progressive and psychedelic concept albums." },
  { name: "The Beatles", birth: null, country: "United Kingdom", bio: "English rock band formed in Liverpool in 1960, one of the most influential groups in the history of music." },
  { name: "Radiohead", birth: null, country: "United Kingdom", bio: "English rock band formed in Abingdon in 1985, known for their experimental approach to rock and electronic music." },
  { name: "Kendrick Lamar", birth: "1987-06-17", country: "United States", bio: "American rapper and songwriter from Compton, California." },
  { name: "Kanye West", birth: "1977-06-08", country: "United States", bio: "American rapper and producer from Chicago." },
  { name: "Nirvana", birth: null, country: "United States", bio: "American rock band formed in Aberdeen, Washington, in 1987, central to the grunge movement." },
  { name: "Michael Jackson", birth: "1958-08-29", country: "United States", bio: "American singer, songwriter and dancer, known as the King of Pop." },
  { name: "Fleetwood Mac", birth: null, country: "United Kingdom", bio: "British-American rock band formed in London in 1967." },
  { name: "Led Zeppelin", birth: null, country: "United Kingdom", bio: "English rock band formed in London in 1968." },
  { name: "Daft Punk", birth: null, country: "France", bio: "French electronic music duo formed in Paris in 1993." },
  { name: "Frank Ocean", birth: "1987-10-28", country: "United States", bio: "American singer and songwriter." },
  { name: "David Bowie", birth: "1947-01-08", country: "United Kingdom", bio: "English singer-songwriter and actor, famous for his constant reinvention." },
  { name: "Marvin Gaye", birth: "1939-04-02", country: "United States", bio: "American singer and songwriter, one of the voices of Motown." },
  { name: "Amy Winehouse", birth: "1983-09-14", country: "United Kingdom", bio: "English singer and songwriter known for her soul and jazz influenced voice." }
];

const albums = [
  { title: "Pink Moon", artist: "Nick Drake", date: "1972-02-25", lang: "English", genres: ["Folk"], mean: 4.1, tracks: [
    ["Pink Moon", "2:04"], ["Place to Be", "2:43"], ["Road", "2:01"], ["Which Will", "2:58"], ["Horn", "1:23"],
    ["Things Behind the Sun", "3:57"], ["Know", "2:26"], ["Parasite", "3:36"], ["Free Ride", "3:06"],
    ["Harvest Breed", "1:37"], ["From the Morning", "2:30"]] },
  { title: "The Dark Side of the Moon", artist: "Pink Floyd", date: "1973-03-01", lang: "English", genres: ["Rock"], mean: 4.6, tracks: [
    ["Speak to Me", "1:07"], ["Breathe", "2:49"], ["On the Run", "3:45"], ["Time", "6:53"], ["The Great Gig in the Sky", "4:44"],
    ["Money", "6:23"], ["Us and Them", "7:49"], ["Any Colour You Like", "3:26"], ["Brain Damage", "3:50"], ["Eclipse", "2:03"]] },
  { title: "Wish You Were Here", artist: "Pink Floyd", date: "1975-09-12", lang: "English", genres: ["Rock"], mean: 4.5, tracks: [
    ["Shine On You Crazy Diamond (Parts I-V)", "13:38"], ["Welcome to the Machine", "7:31"], ["Have a Cigar", "5:08"],
    ["Wish You Were Here", "5:34"], ["Shine On You Crazy Diamond (Parts VI-IX)", "12:29"]] },
  { title: "Abbey Road", artist: "The Beatles", date: "1969-09-26", lang: "English", genres: ["Rock", "Pop"], mean: 4.5, tracks: [
    ["Come Together", "4:20"], ["Something", "3:03"], ["Maxwell's Silver Hammer", "3:27"], ["Oh! Darling", "3:26"],
    ["Octopus's Garden", "2:51"], ["I Want You (She's So Heavy)", "7:47"], ["Here Comes the Sun", "3:05"], ["Because", "2:45"],
    ["You Never Give Me Your Money", "4:02"], ["Sun King", "2:26"], ["Mean Mr. Mustard", "1:06"], ["Polythene Pam", "1:12"],
    ["She Came in Through the Bathroom Window", "1:57"], ["Golden Slumbers", "1:31"], ["Carry That Weight", "1:36"],
    ["The End", "2:05"], ["Her Majesty", "0:23"]] },
  { title: "Sgt. Pepper's Lonely Hearts Club Band", artist: "The Beatles", date: "1967-05-26", lang: "English", genres: ["Rock", "Pop"], mean: 4.1, tracks: [
    ["Sgt. Pepper's Lonely Hearts Club Band", "2:02"], ["With a Little Help from My Friends", "2:44"], ["Lucy in the Sky with Diamonds", "3:28"],
    ["Getting Better", "2:48"], ["Fixing a Hole", "2:36"], ["She's Leaving Home", "3:35"], ["Being for the Benefit of Mr. Kite!", "2:37"],
    ["Within You Without You", "5:05"], ["When I'm Sixty-Four", "2:37"], ["Lovely Rita", "2:42"], ["Good Morning Good Morning", "2:41"],
    ["Sgt. Pepper's Lonely Hearts Club Band (Reprise)", "1:19"], ["A Day in the Life", "5:39"]] },
  { title: "OK Computer", artist: "Radiohead", date: "1997-05-21", lang: "English", genres: ["Rock", "Indie"], mean: 4.6, tracks: [
    ["Airbag", "4:44"], ["Paranoid Android", "6:23"], ["Subterranean Homesick Alien", "4:27"], ["Exit Music (For a Film)", "4:24"],
    ["Let Down", "4:59"], ["Karma Police", "4:21"], ["Fitter Happier", "1:57"], ["Electioneering", "3:50"],
    ["Climbing Up the Walls", "4:45"], ["No Surprises", "3:48"], ["Lucky", "4:19"], ["The Tourist", "5:24"]] },
  { title: "In Rainbows", artist: "Radiohead", date: "2007-10-10", lang: "English", genres: ["Rock", "Indie", "Electronic"], mean: 4.5, tracks: [
    ["15 Step", "3:57"], ["Bodysnatchers", "4:02"], ["Nude", "4:15"], ["Weird Fishes/Arpeggi", "5:18"], ["All I Need", "3:48"],
    ["Faust Arp", "2:09"], ["Reckoner", "4:50"], ["House of Cards", "5:28"], ["Jigsaw Falling into Place", "4:08"], ["Videotape", "4:39"]] },
  { title: "To Pimp a Butterfly", artist: "Kendrick Lamar", date: "2015-03-15", lang: "English", genres: ["Hip-Hop", "Rap", "Jazz", "Funk"], mean: 4.5, tracks: [
    ["Wesley's Theory", "4:47"], ["For Free? (Interlude)", "2:10"], ["King Kunta", "3:54"], ["Institutionalized", "4:31"],
    ["These Walls", "5:00"], ["u", "4:28"], ["Alright", "3:39"], ["For Sale? (Interlude)", "4:51"], ["Momma", "4:43"],
    ["Hood Politics", "4:52"], ["How Much a Dollar Cost", "4:21"], ["Complexion (A Zulu Love)", "4:23"],
    ["The Blacker the Berry", "5:28"], ["You Ain't Gotta Lie (Momma Said)", "4:01"], ["i", "5:36"], ["Mortal Man", "12:07"]] },
  { title: "good kid, m.A.A.d city", artist: "Kendrick Lamar", date: "2012-10-22", lang: "English", genres: ["Hip-Hop", "Rap"], mean: 4.4, tracks: [
    ["Sherane a.k.a Master Splinter's Daughter", "4:33"], ["Bitch, Don't Kill My Vibe", "5:10"], ["Backseat Freestyle", "3:32"],
    ["The Art of Peer Pressure", "5:24"], ["Money Trees", "6:26"], ["Poetic Justice", "5:00"], ["good kid", "3:34"],
    ["m.A.A.d city", "5:50"], ["Swimming Pools (Drank)", "5:13"], ["Sing About Me, I'm Dying of Thirst", "12:03"],
    ["Real", "7:23"], ["Compton", "4:08"]] },
  { title: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", date: "2010-11-22", lang: "English", genres: ["Hip-Hop", "Rap"], mean: 4.3, tracks: [
    ["Dark Fantasy", "4:40"], ["Gorgeous", "5:57"], ["Power", "4:52"], ["All of the Lights (Interlude)", "1:02"],
    ["All of the Lights", "4:59"], ["Monster", "6:18"], ["So Appalled", "6:38"], ["Devil in a New Dress", "5:52"],
    ["Runaway", "9:08"], ["Hell of a Life", "5:27"], ["Blame Game", "7:49"], ["Lost in the World", "4:16"],
    ["Who Will Survive in America", "1:38"]] },
  { title: "Nevermind", artist: "Nirvana", date: "1991-09-24", lang: "English", genres: ["Rock", "Punk"], mean: 4.2, tracks: [
    ["Smells Like Teen Spirit", "5:01"], ["In Bloom", "4:14"], ["Come as You Are", "3:39"], ["Breed", "3:03"], ["Lithium", "4:17"],
    ["Polly", "2:57"], ["Territorial Pissings", "2:22"], ["Drain You", "3:43"], ["Lounge Act", "2:36"], ["Stay Away", "3:32"],
    ["On a Plain", "3:16"], ["Something in the Way", "3:52"]] },
  { title: "Thriller", artist: "Michael Jackson", date: "1982-11-30", lang: "English", genres: ["Pop", "Funk"], mean: 4.2, tracks: [
    ["Wanna Be Startin' Somethin'", "6:02"], ["Baby Be Mine", "4:20"], ["The Girl Is Mine", "3:42"], ["Thriller", "5:57"],
    ["Beat It", "4:18"], ["Billie Jean", "4:54"], ["Human Nature", "4:05"], ["P.Y.T. (Pretty Young Thing)", "3:58"],
    ["The Lady in My Life", "4:59"]] },
  { title: "Rumours", artist: "Fleetwood Mac", date: "1977-02-04", lang: "English", genres: ["Rock", "Pop"], mean: 4.3, tracks: [
    ["Second Hand News", "2:43"], ["Dreams", "4:14"], ["Never Going Back Again", "2:02"], ["Don't Stop", "3:11"],
    ["Go Your Own Way", "3:38"], ["Songbird", "3:20"], ["The Chain", "4:28"], ["You Make Loving Fun", "3:31"],
    ["I Don't Want to Know", "3:11"], ["Oh Daddy", "3:54"], ["Gold Dust Woman", "4:51"]] },
  { title: "Led Zeppelin IV", artist: "Led Zeppelin", date: "1971-11-08", lang: "English", genres: ["Rock", "Blues", "Folk"], mean: 4.3, tracks: [
    ["Black Dog", "4:55"], ["Rock and Roll", "3:40"], ["The Battle of Evermore", "5:51"], ["Stairway to Heaven", "8:02"],
    ["Misty Mountain Hop", "4:38"], ["Four Sticks", "4:44"], ["Going to California", "3:31"], ["When the Levee Breaks", "7:07"]] },
  { title: "Random Access Memories", artist: "Daft Punk", date: "2013-05-17", lang: "English", genres: ["Electronic", "Dance", "Funk"], mean: 3.9, tracks: [
    ["Give Life Back to Music", "4:34"], ["The Game of Love", "5:21"], ["Giorgio by Moroder", "9:04"], ["Within", "3:48"],
    ["Instant Crush", "5:37"], ["Lose Yourself to Dance", "5:53"], ["Touch", "8:18"], ["Get Lucky", "6:09"], ["Beyond", "4:50"],
    ["Motherboard", "5:41"], ["Fragments of Time", "4:39"], ["Doin' It Right", "4:11"], ["Contact", "6:21"]] },
  { title: "Blonde", artist: "Frank Ocean", date: "2016-08-20", lang: "English", genres: ["Soul", "Pop"], mean: 4.4, tracks: [
    ["Nikes", "5:14"], ["Ivy", "4:09"], ["Pink + White", "3:04"], ["Be Yourself", "1:26"], ["Solo", "4:17"], ["Skyline To", "3:04"],
    ["Self Control", "4:09"], ["Good Guy", "1:06"], ["Nights", "5:07"], ["Solo (Reprise)", "1:18"], ["Pretty Sweet", "2:38"],
    ["Facebook Story", "1:08"], ["Close to You", "1:25"], ["White Ferrari", "4:08"], ["Seigfried", "5:34"], ["Godspeed", "2:57"],
    ["Futura Free", "9:24"]] },
  { title: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars", artist: "David Bowie", date: "1972-06-16", lang: "English", genres: ["Rock"], mean: 4.2, tracks: [
    ["Five Years", "4:42"], ["Soul Love", "3:34"], ["Moonage Daydream", "4:40"], ["Starman", "4:10"], ["It Ain't Easy", "2:58"],
    ["Lady Stardust", "3:22"], ["Star", "2:47"], ["Hang On to Yourself", "2:40"], ["Ziggy Stardust", "3:13"],
    ["Suffragette City", "3:25"], ["Rock 'n' Roll Suicide", "2:58"]] },
  { title: "What's Going On", artist: "Marvin Gaye", date: "1971-05-21", lang: "English", genres: ["Soul", "Funk"], mean: 4.4, tracks: [
    ["What's Going On", "3:53"], ["What's Happening Brother", "2:43"], ["Flyin' High (In the Friendly Sky)", "3:49"],
    ["Save the Children", "4:03"], ["God Is Love", "1:41"], ["Mercy Mercy Me (The Ecology)", "3:13"], ["Right On", "7:31"],
    ["Wholy Holy", "3:08"], ["Inner City Blues (Make Me Wanna Holler)", "5:26"]] },
  { title: "Back to Black", artist: "Amy Winehouse", date: "2006-10-27", lang: "English", genres: ["Soul", "Pop", "Jazz"], mean: 4.0, tracks: [
    ["Rehab", "3:34"], ["You Know I'm No Good", "4:17"], ["Me & Mr Jones", "2:33"], ["Just Friends", "3:13"], ["Back to Black", "4:01"],
    ["Love Is a Losing Game", "2:35"], ["Tears Dry on Their Own", "3:06"], ["Wake Up Alone", "3:42"], ["Some Unholy War", "2:22"],
    ["He Can Only Hold Her", "2:46"]] }
];

const playlistNames = [
  ["Notti d'estate", "Per le serate in terrazza."], ["Studio mode", "Concentrazione massima."], ["Classici rock", "Quelli che non possono mancare."],
  ["Rap essentials", "Il meglio del rap."], ["Domenica mattina", "Caffè e musica tranquilla."], ["Roadtrip", "Da ascoltare in macchina, a volume alto."],
  ["Malinconia", "Per le giornate grigie."], ["Workout", "Ritmo per la palestra."], ["Soul sunday", "Voci che scaldano."],
  ["Late night", "Dopo mezzanotte."], ["Prima volta", "Canzoni da far scoprire agli amici."], ["Solo chitarra", "Acustico e intimo."],
  ["Party", "Per ballare."], ["Viaggio in treno", "Paesaggi che scorrono."]
];

const commentTexts = [
  "Capolavoro assoluto, non mi stanco mai di ascoltarlo.", "Uno degli album più importanti di sempre.",
  "La produzione è incredibile anche oggi.", "Sopravvalutato secondo me, ma ha dei pezzi bellissimi.",
  "La seconda metà è ancora meglio della prima.", "L'ho scoperto da poco e lo ascolto tutti i giorni.",
  "Questa traccia mi ricorda l'estate del liceo.", "Il testo di questa canzone è pazzesco.",
  "Il finale mi fa venire i brividi ogni volta.", "Ascoltato in vinile è un'altra cosa.",
  "Non capisco tutto questo entusiasmo, a me non dice molto.", "Perfetto da ascoltare di notte.",
  "La migliore canzone dell'album, senza discussioni.", "Il basso in questo pezzo è fantastico.",
  "Visto dal vivo, emozione indescrivibile.", "Ogni volta noto un dettaglio nuovo.",
  "Masterpiece. Nothing else to say.", "This one never gets old.", "Underrated track, people sleep on it.",
  "Mi ha cambiato il modo di ascoltare la musica."
];

const replyTexts = [
  "Concordo in pieno!", "Non sono d'accordo, per me è il pezzo più debole.", "Vero, l'ho pensato anche io.",
  "Ascoltalo in cuffia, cambia tutto.", "Esatto, il finale è incredibile.", "Dai, non è così male!",
  "Hai provato anche l'album successivo?", "Same here!", "Grazie del consiglio, lo riascolto."
];

const annotationTexts = [
  "Qui il narratore introduce il tema principale del brano: il tempo che passa senza che ce ne accorgiamo.",
  "Riferimento all'infanzia dell'autore, raccontata spesso nelle interviste di quegli anni.",
  "Questa riga è ripetuta anche nel finale e chiude il cerchio del brano.",
  "Gioco di parole sul titolo della canzone, che cambia significato nel ritornello.",
  "Secondo molti fan è la frase più importante dell'intero album.",
  "L'autore ha detto di aver scritto questa parte in una sola notte.",
  "Il cambio di tono qui anticipa la seconda parte del pezzo, più cupa.",
  "Omaggio a un artista che l'autore ha sempre citato come sua influenza principale.",
  "La ripetizione serve a dare il senso di un pensiero che non se ne va.",
  "Questa immagine torna anche in altre canzoni dello stesso disco."
];

const aboutTexts = {
  "The Dark Side of the Moon": "The eighth studio album by Pink Floyd, released in March 1973. It is a concept album about the pressures of modern life: time, money, conflict and mental illness. The songs flow into each other without breaks, and the record is famous for its use of tape loops, synthesizers and spoken voices recorded from the people who worked at Abbey Road Studios.",
  "OK Computer": "Radiohead's third album, released in 1997. The band moved away from the guitar rock of The Bends towards a colder, more experimental sound, with themes of alienation, technology and consumerism. It was recorded largely in a 15th-century mansion in Somerset.",
  "Abbey Road": "The last album the Beatles recorded together, released in September 1969. The second side is famous for its long medley of short songs that blend into each other, ending with \"The End\". The cover photo of the four crossing the street outside the studio became one of the most imitated images in music.",
  "To Pimp a Butterfly": "Kendrick Lamar's third studio album, released in March 2015. It mixes hip-hop with jazz, funk and spoken word, and deals with race, fame and depression. The album is built around a poem that Kendrick reveals line by line across the tracks and reads in full in the final song.",
  "Pink Moon": "Nick Drake's third and last album, released in February 1972. It was recorded in two night sessions with only his voice and guitar, plus a single piano overdub on the title track. Almost ignored at the time, it was rediscovered decades later.",
  "Rumours": "Fleetwood Mac's eleventh album, released in 1977. It was written and recorded while the members of the band were going through breakups and divorces, and many songs are directed at each other.",
  "Blonde": "Frank Ocean's second studio album, released in August 2016, four years after Channel Orange. It is a minimal, introspective record where guitars, organs and pitched vocals replace traditional beats.",
  "What's Going On": "Marvin Gaye's eleventh album, released in May 1971. Told from the point of view of a Vietnam veteran coming home, it talks about war, poverty and the environment. It was one of the first Motown albums produced by the artist himself."
};

let seed = 42;
function random() {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function pick(list) { return list[Math.floor(random() * list.length)]; }
function pickSome(list, n) {
  const copy = [...list];
  const result = [];
  while (result.length < n && copy.length > 0) result.push(copy.splice(Math.floor(random() * copy.length), 1)[0]);
  return result;
}
function daysAgo(days) {
  const date = new Date(Date.now() - days * 86400000 - Math.floor(random() * 86400000));
  return date.toISOString().replace("T", " ").substring(0, 19);
}
function makeRating(mean) {
  const value = mean + (random() - 0.5) * 1.6;
  return Math.min(5, Math.max(0.5, Math.round(value * 2) / 2));
}
function makeLyrics(title) {
  return `[Verse 1]
This is placeholder text for "${title}"
The real lyrics can be added with Correct entry
A line you can select to write an annotation
Another line about the night and the city

[Chorus]
${title}, ${title}
Sing it again and again
${title}, all night long

[Verse 2]
A second verse to test the translations
Every line here is only an example
And the song goes on until the end`;
}
function makeItalianLyrics(title) {
  return `[Strofa 1]
Questo è un testo segnaposto per "${title}"
Il testo vero si può aggiungere con Correct entry
Una riga che puoi selezionare per scrivere un'annotazione
Un'altra riga sulla notte e sulla città

[Ritornello]
${title}, ${title}
Cantala ancora e ancora
${title}, per tutta la notte

[Strofa 2]
Una seconda strofa per provare le traduzioni
Ogni riga qui è solo un esempio
E la canzone continua fino alla fine`;
}

function openDb(file) {
  return new sqlite3.Database(file);
}
function runOn(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}
function allOn(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  let keep = [];
  if (fs.existsSync(DB_FILE)) {
    const old = openDb(DB_FILE);
    keep = await allOn(old, `SELECT * FROM users WHERE username IN ('test', 'mario')`).catch(() => []);
    await new Promise(r => old.close(r));

    fs.mkdirSync("backups", { recursive: true });
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").substring(0, 13);
    fs.copyFileSync(DB_FILE, `backups/database-${stamp}.sqlite`);
    console.log(`Backup: backups/database-${stamp}.sqlite`);
    fs.unlinkSync(DB_FILE);
  }

  const db = require("./db/db");
  for (let i = 0; i < 100; i++) {
    const rows = await allOn(db, `SELECT name FROM sqlite_master WHERE name = 'annotation_edits'`);
    if (rows.length) break;
    await new Promise(r => setTimeout(r, 100));
  }

  const run = (q, p) => runOn(db, q, p);
  await run("BEGIN");

  const hash = await bcrypt.hash(PASSWORD, 10);
  for (const name of ["test", "mario"]) {
    const u = keep.find(k => k.username === name);
    if (u) {
      await run(`INSERT INTO users (username, email, password, ruolo, foto_profilo, bio, who_can_message) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [u.username, u.email, u.password, u.ruolo, u.foto_profilo, u.bio, u.who_can_message || "everyone"]);
    } else {
      await run(`INSERT INTO users (username, email, password, ruolo, bio) VALUES (?, ?, ?, ?, ?)`,
        [name, name + "@spitfire.it", hash, name === "test" ? "admin" : "utente", null]);
    }
  }
  for (const u of users) {
    await run(`INSERT INTO users (username, email, password, ruolo, bio) VALUES (?, ?, ?, ?, ?)`,
      [u.username, u.email, hash, u.ruolo || "utente", u.bio]);
  }
  const everyone = ["test", "mario", ...users.map(u => u.username)];

  for (const follower of everyone) {
    const others = everyone.filter(u => u !== follower);
    for (const following of pickSome(others, 3 + Math.floor(random() * 5))) {
      await run(`INSERT INTO follows (follower, following) VALUES (?, ?)`, [follower, following]);
      const days = Math.floor(random() * 40);
      await run(`INSERT INTO notifications (username, type, from_user, is_read, created_at) VALUES (?, 'follow', ?, ?, ?)`,
        [following, follower, days > 3 ? 1 : 0, daysAgo(days)]);
    }
  }

  const genreRows = await allOn(db, `SELECT id, name FROM genres`);
  const genreId = (name) => genreRows.find(g => g.name === name).id;

  const artistIds = {};
  for (const a of artists) {
    if (a.name === "Nick Drake") {
      await run(`UPDATE artists SET birth_date = ?, country = ?, bio = ? WHERE id = 0`, [a.birth, a.country, a.bio]);
      artistIds[a.name] = 0;
    } else {
      artistIds[a.name] = await run(`INSERT INTO artists (artname, image, birth_date, country, bio) VALUES (?, NULL, ?, ?, ?)`,
        [a.name, a.birth, a.country, a.bio]);
    }
  }

  const allSongs = [];
  const albumRows = [];
  for (const al of albums) {
    const artid = artistIds[al.artist];
    let recordId;
    if (al.title === "Pink Moon") {
      await run(`UPDATE records SET image = NULL, release_date = ?, language = ? WHERE id = 0`, [al.date, al.lang]);
      recordId = 0;
    } else {
      recordId = await run(`INSERT INTO records (recordname, artid, image, release_date, language) VALUES (?, ?, NULL, ?, ?)`,
        [al.title, artid, al.date, al.lang]);
    }
    for (const g of al.genres) await run(`INSERT INTO record_genres (record_id, genre_id) VALUES (?, ?)`, [recordId, genreId(g)]);

    const adder = pick(everyone);
    await run(`INSERT INTO contributions (entity_type, entity_id, username, created_at) VALUES ('record', ?, ?, ?)`, [recordId, adder, daysAgo(60)]);
    await run(`INSERT OR IGNORE INTO contributions (entity_type, entity_id, username, created_at) VALUES ('artist', ?, ?, ?)`, [artid, adder, daysAgo(60)]);

    for (let i = 0; i < al.tracks.length; i++) {
      const [songname, duration] = al.tracks[i];
      let songId;
      if (al.title === "Pink Moon" && i < 2) {
        songId = i;
        await run(`UPDATE songs SET songname = ?, duration = ?, recordid = 0, artid = 0, image = NULL, language = ?, lyrics = ? WHERE id = ?`,
          [songname, duration, al.lang, makeLyrics(songname), songId]);
      } else {
        songId = await run(`INSERT INTO songs (songname, duration, recordid, artid, image, language, lyrics) VALUES (?, ?, ?, ?, NULL, ?, ?)`,
          [songname, duration, recordId, artid, al.lang, makeLyrics(songname)]);
      }
      for (const g of al.genres) await run(`INSERT INTO song_genres (song_id, genre_id) VALUES (?, ?)`, [songId, genreId(g)]);
      await run(`INSERT INTO contributions (entity_type, entity_id, username, created_at) VALUES ('song', ?, ?, ?)`, [songId, adder, daysAgo(60)]);
      allSongs.push({ id: songId, name: songname, recordId, mean: al.mean, lyrics: makeLyrics(songname) });
    }
    albumRows.push({ id: recordId, title: al.title, mean: al.mean, artid });
  }

  for (const u of everyone) {
    for (const al of albumRows) {
      if (random() < 0.7) await run(`INSERT INTO record_ratings (record_id, username, rating) VALUES (?, ?, ?)`, [al.id, u, makeRating(al.mean)]);
    }
    for (const s of allSongs) {
      if (random() < 0.25) await run(`INSERT INTO song_ratings (song_id, username, rating) VALUES (?, ?, ?)`, [s.id, u, makeRating(s.mean)]);
    }
  }
  await run(`UPDATE records SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM record_ratings WHERE record_id = records.id), 0)`);
  await run(`UPDATE songs SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM song_ratings WHERE song_id = songs.id), 0)`);

  for (const u of everyone) {
    for (const a of pickSome(Object.values(artistIds), 2 + Math.floor(random() * 3))) await run(`INSERT INTO favourite_artists (username, artist_id) VALUES (?, ?)`, [u, a]);
    for (const r of pickSome(albumRows, 2 + Math.floor(random() * 3))) await run(`INSERT INTO favourite_records (username, record_id) VALUES (?, ?)`, [u, r.id]);
    for (const s of pickSome(allSongs, 3 + Math.floor(random() * 4))) await run(`INSERT INTO favourite_songs (username, song_id) VALUES (?, ?)`, [u, s.id]);
  }

  for (let i = 0; i < playlistNames.length; i++) {
    const owner = everyone[i % everyone.length];
    const [name, description] = playlistNames[i];
    const created = daysAgo(30 + Math.floor(random() * 20));
    const playlistId = await run(`INSERT INTO playlists (name, username, description, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, owner, description, i === 4 ? 0 : 1, created, created]);
    for (const s of pickSome(allSongs, 6 + Math.floor(random() * 8))) await run(`INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)`, [playlistId, s.id]);

    if (i === 4) continue;
    for (const liker of pickSome(everyone.filter(u => u !== owner), Math.floor(random() * 7))) {
      await run(`INSERT INTO playlist_likes (playlist_id, username) VALUES (?, ?)`, [playlistId, liker]);
      const days = Math.floor(random() * 25);
      await run(`INSERT INTO notifications (username, type, from_user, playlist_id, is_read, created_at) VALUES (?, 'playlist_like', ?, ?, ?, ?)`,
        [owner, liker, playlistId, days > 3 ? 1 : 0, daysAgo(days)]);
    }
  }

  for (let i = 0; i < 45; i++) {
    const onAlbum = random() < 0.5;
    const targetType = onAlbum ? "record" : "song";
    const targetId = onAlbum ? pick(albumRows).id : pick(allSongs).id;
    const author = pick(everyone);
    const days = 2 + Math.floor(random() * 40);
    const commentId = await run(`INSERT INTO comments (username, target_type, target_id, text, created_at) VALUES (?, ?, ?, ?, ?)`,
      [author, targetType, targetId, pick(commentTexts), daysAgo(days)]);

    for (const voter of pickSome(everyone.filter(u => u !== author), Math.floor(random() * 6))) {
      const value = random() < 0.8 ? 1 : -1;
      await run(`INSERT INTO comment_likes (comment_id, username, value) VALUES (?, ?, ?)`, [commentId, voter, value]);
      if (value === 1) {
        await run(`INSERT INTO notifications (username, type, from_user, comment_id, is_read, created_at) VALUES (?, 'like', ?, ?, ?, ?)`,
          [author, voter, commentId, days > 3 ? 1 : 0, daysAgo(Math.max(0, days - 1))]);
      }
    }

    if (random() < 0.35) {
      const replier = pick(everyone.filter(u => u !== author));
      const replyId = await run(`INSERT INTO comments (username, target_type, target_id, parent_id, text, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [replier, targetType, targetId, commentId, pick(replyTexts), daysAgo(Math.max(0, days - 1))]);
      await run(`INSERT INTO notifications (username, type, from_user, comment_id, is_read, created_at) VALUES (?, 'reply', ?, ?, ?, ?)`,
        [author, replier, replyId, days > 3 ? 1 : 0, daysAgo(Math.max(0, days - 1))]);
    }
  }

  const annotatedSongs = pickSome(allSongs, 12);
  const lines = ["A line you can select to write an annotation", "Another line about the night and the city", "Sing it again and again",
                 "Every line here is only an example"];
  const moderators = ["test", "giulia"];
  for (let i = 0; i < annotatedSongs.length; i++) {
    const s = annotatedSongs[i];
    const line = lines[i % lines.length];
    const start = s.lyrics.indexOf(line);
    const author = pick(everyone);
    const status = i < 10 ? "approved" : "pending";
    const days = 1 + Math.floor(random() * 30);
    const annotationId = await run(`INSERT INTO annotations (song_id, username, start_index, end_index, selected_text, text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, author, start, start + line.length, line, annotationTexts[i % annotationTexts.length], status, daysAgo(days)]);
    await run(`INSERT INTO contributions (entity_type, entity_id, username) VALUES ('annotation', ?, ?)`, [annotationId, author]);

    if (status === "approved") {
      for (const voter of pickSome(everyone.filter(u => u !== author), Math.floor(random() * 7))) {
        await run(`INSERT INTO annotation_votes (annotation_id, username, value) VALUES (?, ?, ?)`, [annotationId, voter, random() < 0.75 ? 1 : -1]);
      }
    } else {
      for (const m of moderators.filter(m => m !== author)) {
        await run(`INSERT INTO notifications (username, type, from_user, annotation_id, text, created_at) VALUES (?, 'new_annotation', ?, ?, ?, ?)`,
          [m, author, annotationId, line, daysAgo(0)]);
      }
    }
  }

  for (const [title, text] of Object.entries(aboutTexts)) {
    const album = albumRows.find(a => a.title === title);
    const author = pick(everyone);
    const aboutId = await run(`INSERT INTO abouts (target_type, target_id, username, text, status, created_at) VALUES ('record', ?, ?, ?, 'approved', ?)`,
      [album.id, author, text, daysAgo(10 + Math.floor(random() * 30))]);
    for (const voter of pickSome(everyone.filter(u => u !== author), Math.floor(random() * 8))) {
      await run(`INSERT INTO about_votes (about_id, username, value) VALUES (?, ?, ?)`, [aboutId, voter, random() < 0.8 ? 1 : -1]);
    }
  }
  const pendingAlbum = albumRows.find(a => a.title === "Nevermind");
  await run(`INSERT INTO abouts (target_type, target_id, username, text, status, created_at) VALUES ('record', ?, 'sara', ?, 'pending', ?)`,
    [pendingAlbum.id, "Nirvana's second album, released in September 1991. It brought grunge and alternative rock to the mainstream.", daysAgo(0)]);
  for (const m of moderators) {
    await run(`INSERT INTO notifications (username, type, from_user, content_type, content_id, text, created_at) VALUES (?, 'new_about', 'sara', 'record', ?, 'Nevermind', ?)`,
      [m, pendingAlbum.id, daysAgo(0)]);
  }

  for (const s of pickSome(allSongs, 6)) {
    await run(`INSERT INTO lyrics (language, lyrics, songid) VALUES ('Italian', ?, ?)`, [makeItalianLyrics(s.name), s.id]);
  }

  const inRainbows = albumRows.find(a => a.title === "In Rainbows");
  await run(`INSERT INTO requests (username, type, name, artist_name, release_date, language, status, created_at) VALUES ('luca', 'record', 'In Rainbows', 'Radiohead', '2007-10-10', 'English', 'accepted', ?)`, [daysAgo(20)]);
  await run(`INSERT INTO notifications (username, type, from_user, content_type, content_id, text, is_read, created_at) VALUES ('luca', 'request_accepted', 'test', 'record', ?, 'In Rainbows', 1, ?)`,
    [inRainbows.id, daysAgo(19)]);
  await run(`INSERT OR IGNORE INTO contributions (entity_type, entity_id, username) VALUES ('record', ?, 'luca')`, [inRainbows.id]);

  await run(`INSERT INTO requests (username, type, name, artist_name, album_name, language, duration, created_at) VALUES ('sara', 'song', 'Paper Planes', 'M.I.A.', 'Kala', 'English', '3:25', ?)`, [daysAgo(1)]);
  await run(`INSERT INTO notifications (username, type, from_user, text, created_at) VALUES ('test', 'new_request', 'sara', 'Paper Planes', ?)`, [daysAgo(1)]);

  const thriller = albumRows.find(a => a.title === "Thriller");
  await run(`INSERT INTO requests (username, type, target_id, name, genres, created_at) VALUES ('marco', 'record', ?, 'Thriller', 'Pop, Funk, Soul', ?)`, [thriller.id, daysAgo(0)]);
  await run(`INSERT INTO notifications (username, type, from_user, text, created_at) VALUES ('test', 'new_correction', 'marco', 'Thriller', ?)`, [daysAgo(0)]);

  const translated = allSongs.find(s => s.name === "Karma Police");
  await run(`INSERT INTO requests (username, type, target_id, name, language, lyrics, created_at) VALUES ('elena', 'translation', ?, 'Karma Police', 'Spanish', ?, ?)`,
    [translated.id, "[Verso 1]\nEste es un texto de ejemplo para \"Karma Police\"\nUna traducción para probar las solicitudes", daysAgo(0)]);
  await run(`INSERT INTO notifications (username, type, from_user, text, created_at) VALUES ('test', 'new_translation', 'elena', 'Karma Police (Spanish)', ?)`, [daysAgo(0)]);

  const chats = [
    ["mario", "giulia", ["Ciao! Hai sentito il nuovo album?", "Sì! Mi piace un sacco", "Stasera lo riascolto"]],
    ["luca", "mario", ["Ti ho aggiunto una playlist rap", "Grazie, ora la ascolto", "Fammi sapere!"]],
    ["sara", "test", ["Ho mandato una richiesta per una canzone", "Ok, la guardo appena posso"]],
    ["chiara", "mario", ["Mi consigli qualcosa di soul?", "Prova What's Going On di Marvin Gaye"]]
  ];
  for (const [a, b, texts] of chats) {
    for (let i = 0; i < texts.length; i++) {
      const sender = i % 2 === 0 ? a : b;
      const receiver = i % 2 === 0 ? b : a;
      const last = i === texts.length - 1;
      await run(`INSERT INTO messages (sender, receiver, text, is_read, created_at) VALUES (?, ?, ?, ?, ?)`,
        [sender, receiver, texts[i], last ? 0 : 1, daysAgo(texts.length - i)]);
      if (last) {
        await run(`INSERT INTO notifications (username, type, from_user, text, created_at) VALUES (?, 'message', ?, ?, ?)`,
          [receiver, sender, texts[i], daysAgo(0)]);
      }
    }
  }

  await run("COMMIT");

  const count = async (t) => (await allOn(db, `SELECT COUNT(*) AS n FROM ${t}`))[0].n;
  console.log(`Fatto: ${await count("users")} utenti, ${await count("artists")} artisti, ${await count("records")} album, ` +
              `${await count("songs")} canzoni, ${await count("record_ratings") + await count("song_ratings")} voti, ` +
              `${await count("playlists")} playlist, ${await count("comments")} commenti, ${await count("annotations")} annotazioni, ${await count("abouts")} about.`);
  console.log(`I nuovi utenti hanno la password "${PASSWORD}". test e mario hanno la loro password di sempre.`);
  db.close();
}

main().catch((err) => {
  console.error("Errore nel seed:", err.message);
  process.exit(1);
});
