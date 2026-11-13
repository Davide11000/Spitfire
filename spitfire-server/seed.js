const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3");

process.chdir(__dirname);
const DB_FILE = "./database.sqlite";
const PASSWORD = "password123";
const COVERS_FROM = path.join(__dirname, "..", "AlbumCover");
const COVERS_TO = path.join(__dirname, "uploads", "covers");
const PHOTOS_TO = path.join(__dirname, "uploads", "artists");
const LYRICS_FROM = path.join(__dirname, "..", "Lyrics");
const TOTAL_USERS = 100;

const users = [
  { username: "giulia", ruolo: "moderatore", bio: "Moderator. I live on vinyl and coffee." },
  { username: "luca", bio: "Rap, jazz and everything in between." },
  { username: "sara", bio: "Indie and songwriters. Always wearing headphones." },
  { username: "marco", bio: "Failed drummer, full-time listener." },
  { username: "elena", bio: "I translate lyrics for fun." },
  { username: "francesco", bio: "Classic rock or nothing." },
  { username: "chiara", bio: "Soul, R&B and a playlist for every moment." },
  { username: "alessandro", bio: "First pressing collector." },
  { username: "martina", bio: "Pop and proud of it." },
  { username: "paolo", bio: "Electronic music and long trips." },
  { username: "federica", bio: "Concerts, festivals, repeat." },
  { username: "simone", bio: "I listen to whole albums, from start to finish." }
];

const firstNames = [
  "alex", "sam", "emma", "oliver", "sophie", "james", "lucy", "daniel", "chloe", "jack", "mia", "noah", "ella", "liam",
  "grace", "ben", "hannah", "ryan", "zoe", "nathan", "tom", "olivia", "harry", "amelia", "george", "isla",
  "giorgio", "valentina", "matteo", "alessia", "lorenzo", "beatrice", "riccardo", "giada", "tommaso", "aurora",
  "camille", "hugo", "manon", "louis", "lea", "jules", "ines", "theo",
  "yuki", "haruto", "sakura", "ren", "aoi", "hina", "sota", "mei",
  "diego", "lucia", "mateo", "sofia", "pablo", "carmen"
];
const lastNames = ["smith", "rossi", "martin", "tanaka", "garcia", "brown", "bianchi", "dubois", "sato", "lopez", "wilson", "ricci", "moreau", "ito", "harris"];
const bios = [
  "Music is the only thing I never get tired of.", "Mostly rock, sometimes jazz, never silence.", "Vinyl hunter on weekends.",
  "I make playlists for people who didn't ask.", "Bass player in a band nobody knows.", "Hip-hop head since forever.",
  "Prog rock and long songs. The longer the better.", "Studying music, listening to everything.", "City pop and late night drives.",
  "If it has a saxophone, I'm in.", "Always looking for the next favourite album.", "Live music is better than recorded music.",
  "Headphones on, world off.", "I rate everything. Sorry.", "Old records, new ears."
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
  { name: "Amy Winehouse", birth: "1983-09-14", country: "United Kingdom", bio: "English singer and songwriter known for her soul and jazz influenced voice." },
  { name: "The Velvet Underground", birth: null, country: "United States", bio: "American rock band formed in New York City in 1964, produced by Andy Warhol." },
  { name: "The Beach Boys", birth: null, country: "United States", bio: "American rock band formed in Hawthorne, California, in 1961." },
  { name: "Joni Mitchell", birth: "1943-11-07", country: "Canada", bio: "Canadian singer-songwriter and painter." },
  { name: "Bob Dylan", birth: "1941-05-24", country: "United States", bio: "American singer-songwriter, Nobel Prize in Literature in 2016." },
  { name: "Prince", birth: "1958-06-07", country: "United States", bio: "American singer, songwriter, multi-instrumentalist and producer from Minneapolis." },
  { name: "Stevie Wonder", birth: "1950-05-13", country: "United States", bio: "American singer, songwriter and multi-instrumentalist, signed to Motown at eleven." },
  { name: "Miles Davis", birth: "1926-05-26", country: "United States", bio: "American jazz trumpeter, bandleader and composer." },
  { name: "The Smiths", birth: null, country: "United Kingdom", bio: "English rock band formed in Manchester in 1982." },
  { name: "Joy Division", birth: null, country: "United Kingdom", bio: "English rock band formed in Salford in 1976, pioneers of post-punk." },
  { name: "Talking Heads", birth: null, country: "United States", bio: "American rock band formed in New York City in 1975." },
  { name: "The Clash", birth: null, country: "United Kingdom", bio: "English punk rock band formed in London in 1976." },
  { name: "Lauryn Hill", birth: "1975-05-26", country: "United States", bio: "American singer and rapper, member of the Fugees." },
  { name: "Nas", birth: "1973-09-14", country: "United States", bio: "American rapper from Queensbridge, New York City." },
  { name: "Arctic Monkeys", birth: null, country: "United Kingdom", bio: "English rock band formed in Sheffield in 2002." },
  { name: "Tame Impala", birth: null, country: "Australia", bio: "Psychedelic music project of the Australian multi-instrumentalist Kevin Parker." },
  { name: "Taylor Swift", birth: "1989-12-13", country: "United States", bio: "American singer-songwriter." },
  { name: "Adele", birth: "1988-05-05", country: "United Kingdom", bio: "English singer-songwriter from London." },
  { name: "Billie Eilish", birth: "2001-12-18", country: "United States", bio: "American singer-songwriter who writes her music with her brother Finneas." },
  { name: "The Weeknd", birth: "1990-02-16", country: "Canada", bio: "Canadian singer, songwriter and producer from Toronto." },
  { name: "The Rolling Stones", birth: null, country: "United Kingdom", bio: "English rock band formed in London in 1962." },
  { name: "Queen", birth: null, country: "United Kingdom", bio: "British rock band formed in London in 1970." },
  { name: "AC/DC", birth: null, country: "Australia", bio: "Australian hard rock band formed in Sydney in 1973." },
  { name: "Metallica", birth: null, country: "United States", bio: "American heavy metal band formed in Los Angeles in 1981." },
  { name: "Black Sabbath", birth: null, country: "United Kingdom", bio: "English rock band formed in Birmingham in 1968, among the pioneers of heavy metal." },
  { name: "Genesis", birth: null, country: "United Kingdom", bio: "English rock band formed in Godalming in 1967." },
  { name: "King Crimson", birth: null, country: "United Kingdom", bio: "English progressive rock band formed in London in 1968." },
  { name: "Yes", birth: null, country: "United Kingdom", bio: "English progressive rock band formed in London in 1968." },
  { name: "Premiata Forneria Marconi", birth: null, country: "Italy", bio: "Italian progressive rock band formed in Milan in 1970." },
  { name: "Lucio Battisti", birth: "1943-03-05", country: "Italy", bio: "Italian singer-songwriter, author of many classics with the lyricist Mogol." },
  { name: "Fabrizio De André", birth: "1940-02-18", country: "Italy", bio: "Italian singer-songwriter from Genoa." },
  { name: "Franco Battiato", birth: "1945-03-23", country: "Italy", bio: "Italian singer-songwriter, composer and filmmaker from Sicily." },
  { name: "Måneskin", birth: null, country: "Italy", bio: "Italian rock band formed in Rome in 2016." },
  { name: "Serge Gainsbourg", birth: "1928-04-02", country: "France", bio: "French singer-songwriter, actor and director." },
  { name: "Stromae", birth: "1985-03-12", country: "Belgium", bio: "Belgian singer, rapper and producer." },
  { name: "Jacques Brel", birth: "1929-04-08", country: "Belgium", bio: "Belgian singer-songwriter, one of the masters of French chanson." },
  { name: "Tatsuro Yamashita", birth: "1953-02-04", country: "Japan", bio: "Japanese singer-songwriter and producer, one of the fathers of city pop." },
  { name: "Himiko Kikuchi", birth: null, country: "Japan", bio: "Japanese jazz fusion pianist and keyboardist." },
  { name: "Buena Vista Social Club", birth: null, country: "Cuba", bio: "Ensemble of Cuban musicians gathered in Havana in 1996 to revive the music of pre-revolutionary Cuba." }
];

const albums = [
  { title: "Pink Moon", artist: "Nick Drake", date: "1972-02-25", lang: "English", genres: ["Folk", "Singer-Songwriter"], mean: 4.1, tracks: [
    ["Pink Moon", "2:04"], ["Place to Be", "2:43"], ["Road", "2:01"], ["Which Will", "2:58"], ["Horn", "1:23"],
    ["Things Behind the Sun", "3:57"], ["Know", "2:26"], ["Parasite", "3:36"], ["Free Ride", "3:06"],
    ["Harvest Breed", "1:37"], ["From the Morning", "2:30"]] },
  { title: "The Dark Side of the Moon", artist: "Pink Floyd", date: "1973-03-01", lang: "English", genres: ["Rock", "Progressive Rock"], mean: 4.6, tracks: [
    ["Speak to Me", "1:07"], ["Breathe", "2:49"], ["On the Run", "3:45"], ["Time", "6:53"], ["The Great Gig in the Sky", "4:44"],
    ["Money", "6:23"], ["Us and Them", "7:49"], ["Any Colour You Like", "3:26"], ["Brain Damage", "3:50"], ["Eclipse", "2:03"]] },
  { title: "Wish You Were Here", artist: "Pink Floyd", date: "1975-09-12", lang: "English", genres: ["Rock", "Progressive Rock"], mean: 4.5, tracks: [
    ["Shine On You Crazy Diamond (Parts I-V)", "13:38"], ["Welcome to the Machine", "7:31"], ["Have a Cigar", "5:08"],
    ["Wish You Were Here", "5:34"], ["Shine On You Crazy Diamond (Parts VI-IX)", "12:29"]] },
  { title: "The Wall", artist: "Pink Floyd", date: "1979-11-30", lang: "English", genres: ["Rock", "Progressive Rock"], mean: 4.3, tracks: [
    ["In the Flesh?", "3:16"], ["The Thin Ice", "2:27"], ["Another Brick in the Wall, Part 1", "3:11"], ["The Happiest Days of Our Lives", "1:46"],
    ["Another Brick in the Wall, Part 2", "3:59"], ["Mother", "5:32"], ["Goodbye Blue Sky", "2:45"], ["Empty Spaces", "2:10"],
    ["Young Lust", "3:25"], ["One of My Turns", "3:41"], ["Don't Leave Me Now", "4:08"], ["Another Brick in the Wall, Part 3", "1:48"],
    ["Goodbye Cruel World", "0:48"], ["Hey You", "4:40"], ["Is There Anybody Out There?", "2:44"], ["Nobody Home", "3:26"],
    ["Vera", "1:35"], ["Bring the Boys Back Home", "1:21"], ["Comfortably Numb", "6:23"], ["The Show Must Go On", "1:36"],
    ["In the Flesh", "4:15"], ["Run Like Hell", "4:20"], ["Waiting for the Worms", "4:04"], ["Stop", "0:30"],
    ["The Trial", "5:13"], ["Outside the Wall", "1:41"]] },
  { title: "Abbey Road", artist: "The Beatles", date: "1969-09-26", lang: "English", genres: ["Rock", "Pop"], mean: 4.5, tracks: [
    ["Come Together", "4:20"], ["Something", "3:03"], ["Maxwell's Silver Hammer", "3:27"], ["Oh! Darling", "3:26"],
    ["Octopus's Garden", "2:51"], ["I Want You (She's So Heavy)", "7:47"], ["Here Comes the Sun", "3:05"], ["Because", "2:45"],
    ["You Never Give Me Your Money", "4:02"], ["Sun King", "2:26"], ["Mean Mr. Mustard", "1:06"], ["Polythene Pam", "1:12"],
    ["She Came in Through the Bathroom Window", "1:57"], ["Golden Slumbers", "1:31"], ["Carry That Weight", "1:36"],
    ["The End", "2:05"], ["Her Majesty", "0:23"]] },
  { title: "Sgt. Pepper's Lonely Hearts Club Band", artist: "The Beatles", date: "1967-05-26", lang: "English", genres: ["Rock", "Pop", "Psychedelic Rock"], mean: 4.1, tracks: [
    ["Sgt. Pepper's Lonely Hearts Club Band", "2:02"], ["With a Little Help from My Friends", "2:44"], ["Lucy in the Sky with Diamonds", "3:28"],
    ["Getting Better", "2:48"], ["Fixing a Hole", "2:36"], ["She's Leaving Home", "3:35"], ["Being for the Benefit of Mr. Kite!", "2:37"],
    ["Within You Without You", "5:05"], ["When I'm Sixty-Four", "2:37"], ["Lovely Rita", "2:42"], ["Good Morning Good Morning", "2:41"],
    ["Sgt. Pepper's Lonely Hearts Club Band (Reprise)", "1:19"], ["A Day in the Life", "5:39"]] },
  { title: "Revolver", artist: "The Beatles", date: "1966-08-05", lang: "English", genres: ["Rock", "Pop", "Psychedelic Rock"], mean: 4.5, tracks: [
    ["Taxman", "2:39"], ["Eleanor Rigby", "2:07"], ["I'm Only Sleeping", "3:01"], ["Love You To", "3:00"],
    ["Here, There and Everywhere", "2:25"], ["Yellow Submarine", "2:40"], ["She Said She Said", "2:37"], ["Good Day Sunshine", "2:09"],
    ["And Your Bird Can Sing", "2:01"], ["For No One", "2:01"], ["Doctor Robert", "2:15"], ["I Want to Tell You", "2:29"],
    ["Got to Get You into My Life", "2:30"], ["Tomorrow Never Knows", "2:57"]] },
  { title: "OK Computer", artist: "Radiohead", date: "1997-05-21", lang: "English", genres: ["Rock", "Alternative"], mean: 4.6, tracks: [
    ["Airbag", "4:44"], ["Paranoid Android", "6:23"], ["Subterranean Homesick Alien", "4:27"], ["Exit Music (For a Film)", "4:24"],
    ["Let Down", "4:59"], ["Karma Police", "4:21"], ["Fitter Happier", "1:57"], ["Electioneering", "3:50"],
    ["Climbing Up the Walls", "4:45"], ["No Surprises", "3:48"], ["Lucky", "4:19"], ["The Tourist", "5:24"]] },
  { title: "Kid A", artist: "Radiohead", date: "2000-10-02", lang: "English", genres: ["Electronic", "Alternative"], mean: 4.5, tracks: [
    ["Everything in Its Right Place", "4:11"], ["Kid A", "4:44"], ["The National Anthem", "5:51"], ["How to Disappear Completely", "5:56"],
    ["Treefingers", "3:42"], ["Optimistic", "5:15"], ["In Limbo", "3:31"], ["Idioteque", "5:09"], ["Morning Bell", "4:35"],
    ["Motion Picture Soundtrack", "7:01"]] },
  { title: "In Rainbows", artist: "Radiohead", date: "2007-10-10", lang: "English", genres: ["Rock", "Alternative", "Electronic"], mean: 4.5, tracks: [
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
  { title: "DAMN.", artist: "Kendrick Lamar", date: "2017-04-14", lang: "English", genres: ["Hip-Hop", "Rap"], mean: 4.4, tracks: [
    ["BLOOD.", "1:58"], ["DNA.", "3:05"], ["YAH.", "2:40"], ["ELEMENT.", "3:28"], ["FEEL.", "3:34"], ["LOYALTY.", "3:47"],
    ["PRIDE.", "4:35"], ["HUMBLE.", "2:57"], ["LUST.", "5:07"], ["LOVE.", "3:33"], ["XXX.", "4:14"], ["FEAR.", "7:40"],
    ["GOD.", "4:08"], ["DUCKWORTH.", "4:08"]] },
  { title: "My Beautiful Dark Twisted Fantasy", artist: "Kanye West", date: "2010-11-22", lang: "English", genres: ["Hip-Hop", "Rap"], mean: 4.3, tracks: [
    ["Dark Fantasy", "4:40"], ["Gorgeous", "5:57"], ["Power", "4:52"], ["All of the Lights (Interlude)", "1:02"],
    ["All of the Lights", "4:59"], ["Monster", "6:18"], ["So Appalled", "6:38"], ["Devil in a New Dress", "5:52"],
    ["Runaway", "9:08"], ["Hell of a Life", "5:27"], ["Blame Game", "7:49"], ["Lost in the World", "4:16"],
    ["Who Will Survive in America", "1:38"]] },
  { title: "Nevermind", artist: "Nirvana", date: "1991-09-24", lang: "English", genres: ["Rock", "Grunge", "Punk"], mean: 4.2, tracks: [
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
  { title: "Led Zeppelin IV", artist: "Led Zeppelin", date: "1971-11-08", lang: "English", genres: ["Rock", "Hard Rock", "Blues"], mean: 4.3, tracks: [
    ["Black Dog", "4:55"], ["Rock and Roll", "3:40"], ["The Battle of Evermore", "5:51"], ["Stairway to Heaven", "8:02"],
    ["Misty Mountain Hop", "4:38"], ["Four Sticks", "4:44"], ["Going to California", "3:31"], ["When the Levee Breaks", "7:07"]] },
  { title: "Random Access Memories", artist: "Daft Punk", date: "2013-05-17", lang: "English", genres: ["Electronic", "Dance", "Funk"], mean: 3.9, tracks: [
    ["Give Life Back to Music", "4:34"], ["The Game of Love", "5:21"], ["Giorgio by Moroder", "9:04"], ["Within", "3:48"],
    ["Instant Crush", "5:37"], ["Lose Yourself to Dance", "5:53"], ["Touch", "8:18"], ["Get Lucky", "6:09"], ["Beyond", "4:50"],
    ["Motherboard", "5:41"], ["Fragments of Time", "4:39"], ["Doin' It Right", "4:11"], ["Contact", "6:21"]] },
  { title: "Discovery", artist: "Daft Punk", date: "2001-03-12", lang: "English", genres: ["Electronic", "House", "Dance"], mean: 4.3, tracks: [
    ["One More Time", "5:20"], ["Aerodynamic", "3:27"], ["Digital Love", "4:58"], ["Harder, Better, Faster, Stronger", "3:44"],
    ["Crescendolls", "3:31"], ["Nightvision", "1:44"], ["Superheroes", "3:57"], ["High Life", "3:21"], ["Something About Us", "3:51"],
    ["Voyager", "3:47"], ["Veridis Quo", "5:44"], ["Short Circuit", "3:26"], ["Face to Face", "3:58"], ["Too Long", "10:00"]] },
  { title: "Blonde", artist: "Frank Ocean", date: "2016-08-20", lang: "English", genres: ["R&B", "Soul"], mean: 4.4, tracks: [
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
    ["He Can Only Hold Her", "2:46"]] },
  { title: "The Velvet Underground & Nico", artist: "The Velvet Underground", date: "1967-03-12", lang: "English", genres: ["Rock", "Psychedelic Rock"], mean: 4.3, tracks: [
    ["Sunday Morning", "2:56"], ["I'm Waiting for the Man", "4:39"], ["Femme Fatale", "2:38"], ["Venus in Furs", "5:12"],
    ["Run Run Run", "4:22"], ["All Tomorrow's Parties", "6:00"], ["Heroin", "7:12"], ["There She Goes Again", "2:41"],
    ["I'll Be Your Mirror", "2:14"], ["The Black Angel's Death Song", "3:11"], ["European Son", "7:46"]] },
  { title: "Pet Sounds", artist: "The Beach Boys", date: "1966-05-16", lang: "English", genres: ["Pop", "Rock"], mean: 4.4, tracks: [
    ["Wouldn't It Be Nice", "2:25"], ["You Still Believe in Me", "2:36"], ["That's Not Me", "2:31"],
    ["Don't Talk (Put Your Head on My Shoulder)", "2:53"], ["I'm Waiting for the Day", "3:05"], ["Let's Go Away for Awhile", "2:24"],
    ["Sloop John B", "2:58"], ["God Only Knows", "2:51"], ["I Know There's an Answer", "3:16"], ["Here Today", "2:54"],
    ["I Just Wasn't Made for These Times", "3:12"], ["Pet Sounds", "2:37"], ["Caroline, No", "2:52"]] },
  { title: "Blue", artist: "Joni Mitchell", date: "1971-06-22", lang: "English", genres: ["Folk", "Singer-Songwriter"], mean: 4.4, tracks: [
    ["All I Want", "3:32"], ["My Old Man", "3:33"], ["Little Green", "3:27"], ["Carey", "3:02"], ["Blue", "3:05"],
    ["California", "3:51"], ["This Flight Tonight", "2:51"], ["River", "4:00"], ["A Case of You", "4:22"],
    ["The Last Time I Saw Richard", "4:15"]] },
  { title: "Highway 61 Revisited", artist: "Bob Dylan", date: "1965-08-30", lang: "English", genres: ["Rock", "Folk", "Blues"], mean: 4.4, tracks: [
    ["Like a Rolling Stone", "6:13"], ["Tombstone Blues", "5:58"], ["It Takes a Lot to Laugh, It Takes a Train to Cry", "4:09"],
    ["From a Buick 6", "3:19"], ["Ballad of a Thin Man", "5:58"], ["Queen Jane Approximately", "5:31"], ["Highway 61 Revisited", "3:30"],
    ["Just Like Tom Thumb's Blues", "5:31"], ["Desolation Row", "11:21"]] },
  { title: "Purple Rain", artist: "Prince", date: "1984-06-25", lang: "English", genres: ["Pop", "Funk", "Rock"], mean: 4.3, tracks: [
    ["Let's Go Crazy", "4:39"], ["Take Me with U", "3:54"], ["The Beautiful Ones", "5:13"], ["Computer Blue", "3:59"],
    ["Darling Nikki", "4:14"], ["When Doves Cry", "5:52"], ["I Would Die 4 U", "2:49"], ["Baby I'm a Star", "4:24"],
    ["Purple Rain", "8:41"]] },
  { title: "Innervisions", artist: "Stevie Wonder", date: "1973-08-03", lang: "English", genres: ["Soul", "Funk"], mean: 4.5, tracks: [
    ["Too High", "4:36"], ["Visions", "5:23"], ["Living for the City", "7:22"], ["Golden Lady", "4:40"], ["Higher Ground", "3:42"],
    ["Jesus Children of America", "4:10"], ["All in Love Is Fair", "3:41"], ["Don't You Worry 'bout a Thing", "4:44"],
    ["He's Misstra Know-It-All", "5:35"]] },
  { title: "Kind of Blue", artist: "Miles Davis", date: "1959-08-17", lang: "English", genres: ["Jazz"], mean: 4.6, tracks: [
    ["So What", "9:22"], ["Freddie Freeloader", "9:46"], ["Blue in Green", "5:37"], ["All Blues", "11:33"], ["Flamenco Sketches", "9:26"]] },
  { title: "The Queen Is Dead", artist: "The Smiths", date: "1986-06-16", lang: "English", genres: ["Indie", "Alternative"], mean: 4.3, tracks: [
    ["The Queen Is Dead", "6:24"], ["Frankly, Mr. Shankly", "2:17"], ["I Know It's Over", "5:48"], ["Never Had No One Ever", "3:36"],
    ["Cemetry Gates", "2:39"], ["Bigmouth Strikes Again", "3:12"], ["The Boy with the Thorn in His Side", "3:15"],
    ["Vicar in a Tutu", "2:21"], ["There Is a Light That Never Goes Out", "4:02"], ["Some Girls Are Bigger Than Others", "3:16"]] },
  { title: "Unknown Pleasures", artist: "Joy Division", date: "1979-06-15", lang: "English", genres: ["Post-Punk"], mean: 4.3, tracks: [
    ["Disorder", "3:29"], ["Day of the Lords", "4:48"], ["Candidate", "3:05"], ["Insight", "4:29"], ["New Dawn Fades", "4:47"],
    ["She's Lost Control", "3:57"], ["Shadowplay", "3:55"], ["Wilderness", "2:38"], ["Interzone", "2:16"], ["I Remember Nothing", "5:53"]] },
  { title: "Remain in Light", artist: "Talking Heads", date: "1980-10-08", lang: "English", genres: ["Post-Punk", "Funk"], mean: 4.3, tracks: [
    ["Born Under Punches (The Heat Goes On)", "5:46"], ["Crosseyed and Painless", "4:45"], ["The Great Curve", "6:26"],
    ["Once in a Lifetime", "4:19"], ["Houses in Motion", "4:30"], ["Seen and Not Seen", "3:20"], ["Listening Wind", "4:42"],
    ["The Overload", "6:00"]] },
  { title: "London Calling", artist: "The Clash", date: "1979-12-14", lang: "English", genres: ["Punk", "Rock", "Reggae"], mean: 4.4, tracks: [
    ["London Calling", "3:19"], ["Brand New Cadillac", "2:09"], ["Jimmy Jazz", "3:52"], ["Hateful", "2:45"], ["Rudie Can't Fail", "3:26"],
    ["Spanish Bombs", "3:19"], ["The Right Profile", "3:56"], ["Lost in the Supermarket", "3:47"], ["Clampdown", "3:49"],
    ["The Guns of Brixton", "3:07"], ["Wrong 'Em Boyo", "3:10"], ["Death or Glory", "3:55"], ["Koka Kola", "1:46"],
    ["The Card Cheat", "3:51"], ["Lover's Rock", "4:01"], ["Four Horsemen", "2:56"], ["I'm Not Down", "3:00"],
    ["Revolution Rock", "5:37"], ["Train in Vain", "3:09"]] },
  { title: "The Miseducation of Lauryn Hill", artist: "Lauryn Hill", date: "1998-08-25", lang: "English", genres: ["R&B", "Hip-Hop", "Soul"], mean: 4.4, tracks: [
    ["Intro", "0:47"], ["Lost Ones", "5:33"], ["Ex-Factor", "5:26"], ["To Zion", "6:09"], ["Doo Wop (That Thing)", "5:20"],
    ["Superstar", "4:57"], ["Final Hour", "4:16"], ["When It Hurts So Bad", "5:42"], ["I Used to Love Him", "5:39"],
    ["Forgive Them Father", "5:15"], ["Every Ghetto, Every City", "5:14"], ["Nothing Even Matters", "5:50"],
    ["Everything Is Everything", "4:53"], ["The Miseducation of Lauryn Hill", "4:17"]] },
  { title: "Illmatic", artist: "Nas", date: "1994-04-19", lang: "English", genres: ["Hip-Hop", "Rap"], mean: 4.5, tracks: [
    ["The Genesis", "1:45"], ["N.Y. State of Mind", "4:54"], ["Life's a Bitch", "3:30"], ["The World Is Yours", "4:50"],
    ["Halftime", "4:20"], ["Memory Lane (Sittin' in da Park)", "4:08"], ["One Love", "5:25"], ["One Time 4 Your Mind", "3:18"],
    ["Represent", "4:12"], ["It Ain't Hard to Tell", "3:22"]] },
  { title: "AM", artist: "Arctic Monkeys", date: "2013-09-09", lang: "English", genres: ["Indie", "Alternative", "Rock"], mean: 4.0, tracks: [
    ["Do I Wanna Know?", "4:32"], ["R U Mine?", "3:20"], ["One for the Road", "3:26"], ["Arabella", "3:27"], ["I Want It All", "3:05"],
    ["No. 1 Party Anthem", "4:03"], ["Mad Sounds", "3:35"], ["Fireside", "3:01"], ["Why'd You Only Call Me When You're High?", "2:41"],
    ["Snap Out of It", "3:13"], ["Knee Socks", "4:17"], ["I Wanna Be Yours", "3:03"]] },
  { title: "Currents", artist: "Tame Impala", date: "2015-07-17", lang: "English", genres: ["Psychedelic Rock", "Synth-pop", "Indie"], mean: 4.2, tracks: [
    ["Let It Happen", "7:47"], ["Nangs", "1:47"], ["The Moment", "4:15"], ["Yes I'm Changing", "4:30"], ["Eventually", "5:19"],
    ["Gossip", "0:55"], ["The Less I Know the Better", "3:36"], ["Past Life", "3:48"], ["Disciples", "1:48"],
    ["'Cause I'm a Man", "4:01"], ["Reality in Motion", "4:12"], ["Love/Paranoia", "3:05"], ["New Person, Same Old Mistakes", "6:03"]] },
  { title: "1989", artist: "Taylor Swift", date: "2014-10-27", lang: "English", genres: ["Pop", "Synth-pop"], mean: 3.8, tracks: [
    ["Welcome to New York", "3:32"], ["Blank Space", "3:51"], ["Style", "3:51"], ["Out of the Woods", "3:55"],
    ["All You Had to Do Was Stay", "3:13"], ["Shake It Off", "3:39"], ["I Wish You Would", "3:27"], ["Bad Blood", "3:31"],
    ["Wildest Dreams", "3:40"], ["How You Get the Girl", "4:07"], ["This Love", "4:10"], ["I Know Places", "3:15"], ["Clean", "4:30"]] },
  { title: "21", artist: "Adele", date: "2011-01-24", lang: "English", genres: ["Pop", "Soul"], mean: 4.0, tracks: [
    ["Rolling in the Deep", "3:48"], ["Rumour Has It", "3:43"], ["Turning Tables", "4:10"], ["Don't You Remember", "4:03"],
    ["Set Fire to the Rain", "4:01"], ["He Won't Go", "4:37"], ["Take It All", "3:48"], ["I'll Be Waiting", "4:01"],
    ["One and Only", "5:48"], ["Lovesong", "5:16"], ["Someone like You", "4:45"]] },
  { title: "When We All Fall Asleep, Where Do We Go?", artist: "Billie Eilish", date: "2019-03-29", lang: "English", genres: ["Pop", "Alternative"], mean: 3.9, tracks: [
    ["!!!!!!!", "0:13"], ["Bad Guy", "3:14"], ["Xanny", "4:04"], ["You Should See Me in a Crown", "3:01"],
    ["All the Good Girls Go to Hell", "2:49"], ["Wish You Were Gay", "3:42"], ["When the Party's Over", "3:16"], ["8", "2:53"],
    ["My Strange Addiction", "3:00"], ["Bury a Friend", "3:13"], ["Ilomilo", "2:36"], ["Listen Before I Go", "4:02"],
    ["I Love You", "4:52"], ["Goodbye", "2:20"]] },
  { title: "After Hours", artist: "The Weeknd", date: "2020-03-20", lang: "English", genres: ["R&B", "Synth-pop", "Pop"], mean: 4.1, tracks: [
    ["Alone Again", "4:10"], ["Too Late", "3:59"], ["Hardest to Love", "3:31"], ["Scared to Live", "3:11"], ["Snowchild", "4:07"],
    ["Escape from LA", "5:56"], ["Heartless", "3:18"], ["Faith", "4:43"], ["Blinding Lights", "3:20"], ["In Your Eyes", "3:57"],
    ["Save Your Tears", "3:35"], ["Repeat After Me (Interlude)", "3:15"], ["After Hours", "6:01"], ["Until I Bleed Out", "3:10"]] },
  { title: "Sticky Fingers", artist: "The Rolling Stones", date: "1971-04-23", lang: "English", genres: ["Rock", "Blues"], mean: 4.3, tracks: [
    ["Brown Sugar", "3:50"], ["Sway", "3:52"], ["Wild Horses", "5:42"], ["Can't You Hear Me Knocking", "7:15"], ["You Gotta Move", "2:34"],
    ["Bitch", "3:38"], ["I Got the Blues", "3:54"], ["Sister Morphine", "5:31"], ["Dead Flowers", "4:05"], ["Moonlight Mile", "5:56"]] },
  { title: "A Night at the Opera", artist: "Queen", date: "1975-11-21", lang: "English", genres: ["Rock", "Hard Rock"], mean: 4.4, tracks: [
    ["Death on Two Legs (Dedicated to...)", "3:43"], ["Lazing on a Sunday Afternoon", "1:08"], ["I'm in Love with My Car", "3:05"],
    ["You're My Best Friend", "2:52"], ["'39", "3:31"], ["Sweet Lady", "4:01"], ["Seaside Rendezvous", "2:13"],
    ["The Prophet's Song", "8:17"], ["Love of My Life", "3:38"], ["Good Company", "3:26"], ["Bohemian Rhapsody", "5:55"],
    ["God Save the Queen", "1:11"]] },
  { title: "Back in Black", artist: "AC/DC", date: "1980-07-25", lang: "English", genres: ["Hard Rock"], mean: 4.2, tracks: [
    ["Hells Bells", "5:12"], ["Shoot to Thrill", "5:17"], ["What Do You Do for Money Honey", "3:35"], ["Givin the Dog a Bone", "3:31"],
    ["Let Me Put My Love into You", "4:15"], ["Back in Black", "4:15"], ["You Shook Me All Night Long", "3:30"],
    ["Have a Drink on Me", "3:58"], ["Shake a Leg", "4:05"], ["Rock and Roll Ain't Noise Pollution", "4:15"]] },
  { title: "Master of Puppets", artist: "Metallica", date: "1986-03-03", lang: "English", genres: ["Metal", "Heavy Metal"], mean: 4.4, tracks: [
    ["Battery", "5:12"], ["Master of Puppets", "8:35"], ["The Thing That Should Not Be", "6:36"], ["Welcome Home (Sanitarium)", "6:27"],
    ["Disposable Heroes", "8:16"], ["Leper Messiah", "5:40"], ["Orion", "8:27"], ["Damage, Inc.", "5:32"]] },
  { title: "Paranoid", artist: "Black Sabbath", date: "1970-09-18", lang: "English", genres: ["Metal", "Heavy Metal"], mean: 4.3, tracks: [
    ["War Pigs", "7:57"], ["Paranoid", "2:48"], ["Planet Caravan", "4:32"], ["Iron Man", "5:56"], ["Electric Funeral", "4:53"],
    ["Hand of Doom", "7:10"], ["Rat Salad", "2:30"], ["Fairies Wear Boots", "6:15"]] },
  { title: "Selling England by the Pound", artist: "Genesis", date: "1973-10-12", lang: "English", genres: ["Progressive Rock", "Symphonic Prog"], mean: 4.4, tracks: [
    ["Dancing with the Moonlit Knight", "8:02"], ["I Know What I Like (In Your Wardrobe)", "4:03"], ["Firth of Fifth", "9:36"],
    ["More Fool Me", "3:10"], ["The Battle of Epping Forest", "11:43"], ["After the Ordeal", "4:13"], ["The Cinema Show", "11:06"],
    ["Aisle of Plenty", "1:30"]] },
  { title: "In the Court of the Crimson King", artist: "King Crimson", date: "1969-10-10", lang: "English", genres: ["Progressive Rock", "Symphonic Prog"], mean: 4.5, tracks: [
    ["21st Century Schizoid Man", "7:24"], ["I Talk to the Wind", "6:05"], ["Epitaph", "8:49"], ["Moonchild", "12:13"],
    ["The Court of the Crimson King", "9:26"]] },
  { title: "Close to the Edge", artist: "Yes", date: "1972-09-13", lang: "English", genres: ["Progressive Rock", "Symphonic Prog"], mean: 4.5, tracks: [
    ["Close to the Edge", "18:43"], ["And You and I", "10:09"], ["Siberian Khatru", "8:57"]] },

  { title: "Per un amico", artist: "Premiata Forneria Marconi", date: "1972-11-01", lang: "Italian", genres: ["Progressive Rock", "Symphonic Prog"], mean: 4.4, tracks: [
    ["Appena un po'", "7:44"], ["Generale", "4:18"], ["Per un amico", "5:24"], ["Il banchetto", "8:39"], ["Geranio", "8:04"]] },
  { title: "Il mio canto libero", artist: "Lucio Battisti", date: "1972-11-01", lang: "Italian", genres: ["Pop", "Singer-Songwriter"], mean: 4.3, tracks: [
    ["La luce dell'est", "6:18"], ["Luci-ah", "4:47"], ["L'aquila", "4:24"], ["Vento nel vento", "3:24"], ["Confusione", "4:30"],
    ["Io vorrei... non vorrei... ma se vuoi", "4:35"], ["Gente per bene e gente per male", "4:46"], ["Il mio canto libero", "5:06"]] },
  { title: "La buona novella", artist: "Fabrizio De André", date: "1970-11-01", lang: "Italian", genres: ["Folk", "Singer-Songwriter"], mean: 4.5, tracks: [
    ["Laudate dominum", "0:22"], ["L'infanzia di Maria", "5:01"], ["Il ritorno di Giuseppe", "4:07"], ["Il sogno di Maria", "4:06"],
    ["Ave Maria", "1:54"], ["Maria nella bottega del falegname", "3:15"], ["Via della Croce", "4:33"], ["Tre madri", "2:56"],
    ["Il testamento di Tito", "5:51"], ["Laudate hominem", "3:26"]] },
  { title: "La voce del padrone", artist: "Franco Battiato", date: "1981-09-21", lang: "Italian", genres: ["Pop", "Synth-pop"], mean: 4.3, tracks: [
    ["Summer on a Solitary Beach", "4:34"], ["Bandiera bianca", "5:19"], ["Gli uccelli", "4:43"], ["Cuccurucucù", "4:09"],
    ["Segnali di vita", "3:37"], ["Centro di gravità permanente", "3:55"], ["Sentimiento nuevo", "4:18"]] },
  { title: "Teatro d'ira: Vol. I", artist: "Måneskin", date: "2021-03-19", lang: "Italian", genres: ["Rock", "Hard Rock"], mean: 3.7, tracks: [
    ["Zitti e buoni", "3:14"], ["Coraline", "5:00"], ["Lividi sui gomiti", "2:45"], ["I Wanna Be Your Slave", "2:53"],
    ["In nome del padre", "3:39"], ["For Your Love", "3:50"], ["La paura del buio", "3:29"], ["Vent'anni", "4:13"]] },

  { title: "Histoire de Melody Nelson", artist: "Serge Gainsbourg", date: "1971-03-24", lang: "French", genres: ["Pop", "Psychedelic Rock"], mean: 4.4, tracks: [
    ["Melody", "7:32"], ["Ballade de Melody Nelson", "2:00"], ["Valse de Melody", "1:31"], ["Ah ! Melody", "1:47"],
    ["L'Hôtel particulier", "4:05"], ["En Melody", "3:25"], ["Cargo culte", "7:37"]] },
  { title: "Racine carrée", artist: "Stromae", date: "2013-08-16", lang: "French", genres: ["Electronic", "Pop", "Dance"], mean: 4.2, tracks: [
    ["Ta fête", "2:55"], ["Papaoutai", "3:52"], ["Bâtard", "3:28"], ["Ave Cesaria", "4:09"], ["Tous les mêmes", "3:30"],
    ["Formidable", "3:33"], ["Moules frites", "2:38"], ["Carmen", "3:09"], ["Humain à l'eau", "3:59"], ["Quand c'est ?", "3:00"],
    ["Sommeil", "3:38"], ["Merci", "3:48"], ["AVF", "3:44"]] },
  { title: "Les Marquises", artist: "Jacques Brel", date: "1977-11-17", lang: "French", genres: ["Singer-Songwriter"], mean: 4.4, tracks: [
    ["Jaurès", null], ["La ville s'endormait", null], ["Vieillir", null], ["Le Bon Dieu", null], ["Les F...", null], ["Orly", null],
    ["Les Remparts de Varsovie", null], ["Voir un ami pleurer", null], ["Knokke-le-Zoute Tango", null], ["Jojo", null],
    ["Le Lion", null], ["Les Marquises", null]] },

  { title: "For You", artist: "Tatsuro Yamashita", date: "1982-01-21", lang: "Japanese", genres: ["Pop", "Funk"], mean: 4.4, tracks: [
    ["Sparkle", "4:13"], ["Music Book", "5:08"], ["Interlude A Part I", "0:23"], ["Morning Glory", "3:28"], ["Interlude A Part II", "0:25"],
    ["Futari", "5:46"], ["Loveland, Island", "4:29"], ["Interlude B Part I", "0:16"], ["Love Talkin' (Honey It's You)", "5:50"],
    ["Hey Reporter!", "5:33"], ["Interlude B Part II", "0:17"], ["Your Eyes", "3:14"]] },
  { title: "Flying Beagle", artist: "Himiko Kikuchi", date: "1987-10-21", lang: "Japanese", genres: ["Jazz"], mean: 4.2, tracks: [
    ["Look Your Back!", null], ["A Seagull & Clouds", null], ["Flying Beagle", null], ["Fluffy", null], ["Sand Storm", null],
    ["Baby Talk", null], ["The Second Summer", null], ["Ducky Ducky", null]] },

  { title: "Buena Vista Social Club", artist: "Buena Vista Social Club", date: "1997-06-23", lang: "Spanish", genres: ["Folk", "Jazz"], mean: 4.5, tracks: [
    ["Chan Chan", "4:16"], ["De camino a la vereda", "5:03"], ["El cuarto de Tula", "7:27"], ["Pueblo Nuevo", "6:05"],
    ["Dos gardenias", "3:02"], ["¿Y tú qué has hecho?", "3:13"], ["Veinte años", "3:29"], ["El carretero", "3:28"],
    ["Candela", "5:27"], ["Amor de loca juventud", "3:21"], ["Orgullecida", "3:18"], ["Murmullo", "3:50"],
    ["Buena Vista Social Club", "4:50"], ["La bayamesa", "2:54"]] }
];

const playlistNames = [
  ["Summer nights", "For evenings on the terrace."], ["Study mode", "Maximum focus."], ["Rock classics", "The ones that can't be missing."],
  ["Rap essentials", "The best of rap."], ["Sunday morning", "Coffee and quiet music."], ["Roadtrip", "Car, open windows, volume up."],
  ["Melancholy", "For grey days."], ["Workout", "Rhythm for the gym."], ["Soul sunday", "Voices that warm you up."],
  ["Late night", "After midnight."], ["First listen", "Songs to show your friends."], ["Acoustic", "Guitar and voice."],
  ["Party", "Made for dancing."], ["Train journey", "Landscapes passing by."], ["Prog odyssey", "Long songs, no regrets."],
  ["Rainy days", "Headphones and a window."], ["Cooking", "Something good in the background."], ["Deep focus", "Nothing with too many words."],
  ["Feel good", "Instant mood boost."], ["Throwback", "Back in time."], ["Heartbreak", "We've all been there."],
  ["Chill", "Slow and easy."], ["Guitar heroes", "Solos, solos, solos."], ["Around the world", "Music in every language."],
  ["Discoveries", "Found this month."], ["Night drive", "Empty roads and city lights."], ["Old school", "The roots."],
  ["Loud", "Turn it up."], ["Golden hour", "For the sunset."], ["Favourites", "Just the best."]
];

const commentTexts = [
  "An absolute masterpiece, I never get tired of it.", "One of the most important albums ever made.",
  "The production still sounds incredible today.", "Overrated in my opinion, but it has some beautiful moments.",
  "The second half is even better than the first.", "Discovered it recently and I listen to it every day.",
  "This track reminds me of a summer in high school.", "The lyrics on this one are insane.",
  "The ending gives me chills every single time.", "On vinyl it's a completely different experience.",
  "I don't get all the hype, it doesn't do much for me.", "Perfect for listening at night.",
  "Best song on the album, no discussion.", "The bass line here is fantastic.",
  "Saw this live, I can't even describe it.", "Every time I notice a new detail.",
  "Masterpiece. Nothing else to say.", "This one never gets old.", "Underrated track, people sleep on it.",
  "It changed the way I listen to music.", "My dad played this in the car all the time.", "Those drums though.",
  "Took me a few listens, now I love it.", "The vocals on this are unreal.", "Still ahead of its time.",
  "Could listen to this on repeat for hours.", "The mixing is so clean.", "This deserves way more attention.",
  "A bit too long, but worth it.", "The intro alone is worth the whole album.", "Pure nostalgia.",
  "Every song is a different world.", "It sounds better every year.", "Not my favourite, but I respect it.",
  "The arrangement is beautiful.", "I cried the first time I heard this.", "Instant classic.",
  "The way it builds up is perfect.", "Headphones are mandatory for this one.", "This is where it all started for me."
];

const replyTexts = [
  "Totally agree!", "I don't agree, for me it's the weakest one.", "True, I thought the same.",
  "Listen to it with headphones, it changes everything.", "Exactly, the ending is incredible.", "Come on, it's not that bad!",
  "Have you tried the next album too?", "Same here!", "Thanks for the tip, I'll listen to it again.",
  "This is the way.", "100%.", "Glad I'm not the only one.", "You should hear the live version.", "Couldn't have said it better."
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
function howManyRatings() {
  if (random() < 0.8) return 30 + Math.floor(random() * 41);
  return 5 + Math.floor(random() * 25);
}
function makeRating(mean) {
  const value = mean + (random() - 0.5) * 1.6;
  return Math.min(5, Math.max(0.5, Math.round(value * 2) / 2));
}

function simplify(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function findCover(album, files) {
  const title = simplify(album.title);
  return files.find(f => simplify(path.parse(f).name) === title) || null;
}
function safeName(file) {
  const { name, ext } = path.parse(file);
  return simplify(name) + ext.toLowerCase();
}
function copyCover(file) {
  fs.mkdirSync(COVERS_TO, { recursive: true });
  fs.copyFileSync(path.join(COVERS_FROM, file), path.join(COVERS_TO, safeName(file)));
  return "/uploads/covers/" + safeName(file);
}
function findArtistPhoto(name, files) {
  const simple = simplify(name);
  return files.find(f => simplify(path.parse(f).name) === simple + "artist")
      || files.find(f => simplify(path.parse(f).name) === simple)
      || null;
}
function findLyrics(songname, files) {
  const file = files.find(f => simplify(path.parse(f).name) === simplify(songname));
  if (!file) return null;
  return fs.readFileSync(path.join(LYRICS_FROM, file), "utf8").replace(/\r\n/g, "\n").trim();
}
function copyArtistPhoto(file) {
  fs.mkdirSync(PHOTOS_TO, { recursive: true });
  fs.copyFileSync(path.join(COVERS_FROM, file), path.join(PHOTOS_TO, safeName(file)));
  return "/uploads/artists/" + safeName(file);
}

function makeUsernames() {
  const taken = new Set(["test", "mario", ...users.map(u => u.username)]);
  const result = [];
  while (result.length < TOTAL_USERS - 2 - users.length) {
    const first = pick(firstNames);
    const style = Math.floor(random() * 4);
    let name;
    if (style === 0) name = first + Math.floor(10 + random() * 90);
    else if (style === 1) name = first + "_" + pick(lastNames);
    else if (style === 2) name = first + "." + pick(lastNames)[0];
    else name = first + pick(["music", "vinyl", "beats", "sound", "records"]);
    if (taken.has(name)) continue;
    taken.add(name);
    result.push(name);
  }
  return result;
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
    const rows = await allOn(db, `SELECT name FROM sqlite_master WHERE name = 'role_requests'`);
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
      [u.username, u.username + "@spitfire.it", hash, u.ruolo || "utente", u.bio]);
  }
  for (const name of makeUsernames()) {
    await run(`INSERT INTO users (username, email, password, ruolo, bio) VALUES (?, ?, ?, 'utente', ?)`,
      [name, name + "@spitfire.it", hash, random() < 0.6 ? pick(bios) : null]);
  }
  const everyone = (await allOn(db, `SELECT username FROM users`)).map(u => u.username);

  for (const follower of everyone) {
    const others = everyone.filter(u => u !== follower);
    for (const following of pickSome(others, 3 + Math.floor(random() * 8))) {
      await run(`INSERT INTO follows (follower, following) VALUES (?, ?)`, [follower, following]);
      const days = Math.floor(random() * 40);
      await run(`INSERT INTO notifications (username, type, from_user, is_read, created_at) VALUES (?, 'follow', ?, ?, ?)`,
        [following, follower, days > 3 ? 1 : 0, daysAgo(days)]);
    }
  }

  const genreRows = await allOn(db, `SELECT id, name FROM genres`);
  const genreId = (name) => genreRows.find(g => g.name === name).id;

  fs.rmSync(COVERS_TO, { recursive: true, force: true });
  fs.rmSync(PHOTOS_TO, { recursive: true, force: true });
  const coverFiles = fs.existsSync(COVERS_FROM) ? fs.readdirSync(COVERS_FROM) : [];
  const lyricsFiles = fs.existsSync(LYRICS_FROM) ? fs.readdirSync(LYRICS_FROM).filter(f => f.endsWith(".txt")) : [];
  const artistIds = {};
  let photos = 0;
  for (const a of artists) {
    const photoFile = findArtistPhoto(a.name, coverFiles);
    const photo = photoFile ? copyArtistPhoto(photoFile) : null;
    if (photo) photos++;

    if (a.name === "Nick Drake") {
      await run(`UPDATE artists SET image = ?, birth_date = ?, country = ?, bio = ? WHERE id = 0`, [photo, a.birth, a.country, a.bio]);
      artistIds[a.name] = 0;
    } else {
      artistIds[a.name] = await run(`INSERT INTO artists (artname, image, birth_date, country, bio) VALUES (?, ?, ?, ?, ?)`,
        [a.name, photo, a.birth, a.country, a.bio]);
    }
  }

  const allSongs = [];
  const albumRows = [];
  let covers = 0;
  let lyricsCount = 0;
  for (const al of albums) {
    const artid = artistIds[al.artist];
    const coverFile = findCover(al, coverFiles);
    const image = coverFile ? copyCover(coverFile) : null;
    if (image) covers++;

    let recordId;
    if (al.title === "Pink Moon") {
      await run(`UPDATE records SET image = ?, release_date = ?, language = ? WHERE id = 0`, [image, al.date, al.lang]);
      recordId = 0;
    } else {
      recordId = await run(`INSERT INTO records (recordname, artid, image, release_date, language) VALUES (?, ?, ?, ?, ?)`,
        [al.title, artid, image, al.date, al.lang]);
    }
    for (const g of al.genres) await run(`INSERT INTO record_genres (record_id, genre_id) VALUES (?, ?)`, [recordId, genreId(g)]);

    const adder = pick(everyone);
    await run(`INSERT INTO contributions (entity_type, entity_id, username, created_at) VALUES ('record', ?, ?, ?)`, [recordId, adder, daysAgo(60)]);
    await run(`INSERT OR IGNORE INTO contributions (entity_type, entity_id, username, created_at) VALUES ('artist', ?, ?, ?)`, [artid, adder, daysAgo(60)]);

    for (let i = 0; i < al.tracks.length; i++) {
      const [songname, duration] = al.tracks[i];
      const lyrics = findLyrics(songname, lyricsFiles);
      if (lyrics) lyricsCount++;
      let songId;
      if (al.title === "Pink Moon" && i < 2) {
        songId = i;
        await run(`UPDATE songs SET songname = ?, duration = ?, recordid = 0, artid = 0, image = NULL, language = ?, lyrics = ? WHERE id = ?`,
          [songname, duration, al.lang, lyrics, songId]);
      } else {
        songId = await run(`INSERT INTO songs (songname, duration, recordid, artid, image, language, lyrics) VALUES (?, ?, ?, ?, NULL, ?, ?)`,
          [songname, duration, recordId, artid, al.lang, lyrics]);
      }
      for (const g of al.genres) await run(`INSERT INTO song_genres (song_id, genre_id) VALUES (?, ?)`, [songId, genreId(g)]);
      await run(`INSERT INTO contributions (entity_type, entity_id, username, created_at) VALUES ('song', ?, ?, ?)`, [songId, adder, daysAgo(60)]);
      allSongs.push({ id: songId, name: songname, recordId, mean: al.mean });
    }
    albumRows.push({ id: recordId, title: al.title, mean: al.mean, artid });
  }

  for (const al of albumRows) {
    const howMany = al.title === "My Beautiful Dark Twisted Fantasy" ? 35 : howManyRatings();
    for (const u of pickSome(everyone, howMany)) {
      await run(`INSERT INTO record_ratings (record_id, username, rating) VALUES (?, ?, ?)`, [al.id, u, makeRating(al.mean)]);
    }
  }
  for (const s of allSongs) {
    for (const u of pickSome(everyone, howManyRatings())) {
      await run(`INSERT INTO song_ratings (song_id, username, rating) VALUES (?, ?, ?)`, [s.id, u, makeRating(s.mean)]);
    }
  }
  await run(`UPDATE records SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM record_ratings WHERE record_id = records.id), 0)`);
  await run(`UPDATE songs SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM song_ratings WHERE song_id = songs.id), 0)`);

  for (const u of everyone) {
    for (const a of pickSome(Object.values(artistIds), 2 + Math.floor(random() * 4))) await run(`INSERT INTO favourite_artists (username, artist_id) VALUES (?, ?)`, [u, a]);
    for (const r of pickSome(albumRows, 2 + Math.floor(random() * 4))) await run(`INSERT INTO favourite_records (username, record_id) VALUES (?, ?)`, [u, r.id]);
    for (const s of pickSome(allSongs, 3 + Math.floor(random() * 6))) await run(`INSERT INTO favourite_songs (username, song_id) VALUES (?, ?)`, [u, s.id]);
  }

  const playlistIds = [];
  for (const owner of everyone) {
    if (owner !== "test" && owner !== "mario" && random() < 0.5) continue;
    for (const [name, description] of pickSome(playlistNames, 1 + Math.floor(random() * 2))) {
      const created = daysAgo(10 + Math.floor(random() * 50));
      const isPublic = random() < 0.85 ? 1 : 0;
      const playlistId = await run(`INSERT INTO playlists (name, username, description, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, owner, description, isPublic, created, created]);
      for (const s of pickSome(allSongs, 6 + Math.floor(random() * 10))) await run(`INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)`, [playlistId, s.id]);
      if (!isPublic) continue;
      playlistIds.push(playlistId);

      for (const liker of pickSome(everyone.filter(u => u !== owner), Math.floor(random() * 8))) {
        await run(`INSERT INTO playlist_likes (playlist_id, username) VALUES (?, ?)`, [playlistId, liker]);
        const days = Math.floor(random() * 25);
        await run(`INSERT INTO notifications (username, type, from_user, playlist_id, is_read, created_at) VALUES (?, 'playlist_like', ?, ?, ?, ?)`,
          [owner, liker, playlistId, days > 3 ? 1 : 0, daysAgo(days)]);
      }
    }
  }

  for (let i = 0; i < 300; i++) {
    const roll = random();
    let targetType, targetId;
    if (roll < 0.5) { targetType = "record"; targetId = pick(albumRows).id; }
    else if (roll < 0.9) { targetType = "song"; targetId = pick(allSongs).id; }
    else { targetType = "playlist"; targetId = pick(playlistIds); }
    const author = pick(everyone);
    const days = 2 + Math.floor(random() * 60);
    const commentId = await run(`INSERT INTO comments (username, target_type, target_id, text, created_at) VALUES (?, ?, ?, ?, ?)`,
      [author, targetType, targetId, pick(commentTexts), daysAgo(days)]);

    for (const voter of pickSome(everyone.filter(u => u !== author), Math.floor(random() * 10))) {
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

  const admins = ["test"];
  for (const [title, text] of Object.entries(aboutTexts)) {
    const album = albumRows.find(a => a.title === title);
    const author = pick(everyone);
    const aboutId = await run(`INSERT INTO abouts (target_type, target_id, username, text, status, created_at) VALUES ('record', ?, ?, ?, 'approved', ?)`,
      [album.id, author, text, daysAgo(10 + Math.floor(random() * 30))]);
    for (const voter of pickSome(everyone.filter(u => u !== author), Math.floor(random() * 10))) {
      await run(`INSERT INTO about_votes (about_id, username, value) VALUES (?, ?, ?)`, [aboutId, voter, random() < 0.8 ? 1 : -1]);
    }
  }
  for (const a of artists) {
    const author = pick(everyone);
    const aboutId = await run(`INSERT INTO abouts (target_type, target_id, username, text, status, created_at) VALUES ('artist', ?, ?, ?, 'approved', ?)`,
      [artistIds[a.name], author, a.bio, daysAgo(10 + Math.floor(random() * 50))]);
    for (const voter of pickSome(everyone.filter(u => u !== author), Math.floor(random() * 8))) {
      await run(`INSERT INTO about_votes (about_id, username, value) VALUES (?, ?, ?)`, [aboutId, voter, random() < 0.8 ? 1 : -1]);
    }
  }

  const pendingAlbum = albumRows.find(a => a.title === "Nevermind");
  await run(`INSERT INTO abouts (target_type, target_id, username, text, status, created_at) VALUES ('record', ?, 'sara', ?, 'pending', ?)`,
    [pendingAlbum.id, "Nirvana's second album, released in September 1991. It brought grunge and alternative rock to the mainstream.", daysAgo(0)]);
  for (const m of admins) {
    await run(`INSERT INTO notifications (username, type, from_user, content_type, content_id, text, created_at) VALUES (?, 'new_about', 'sara', 'record', ?, 'Nevermind', ?)`,
      [m, pendingAlbum.id, daysAgo(0)]);
  }

  const lucaRecords = ["In Rainbows", "Kid A", "Illmatic", "DAMN.", "Kind of Blue", "Remain in Light", "Unknown Pleasures",
                       "The Miseducation of Lauryn Hill", "Innervisions", "Currents"];
  for (let i = 0; i < lucaRecords.length; i++) {
    const album = albums.find(a => a.title === lucaRecords[i]);
    const row = albumRows.find(a => a.title === lucaRecords[i]);
    const days = 20 + i * 3;
    await run(`INSERT INTO requests (username, type, name, artist_name, release_date, language, status, created_at) VALUES ('luca', 'record', ?, ?, ?, ?, 'accepted', ?)`,
      [album.title, album.artist, album.date, album.lang, daysAgo(days)]);
    await run(`INSERT INTO notifications (username, type, from_user, content_type, content_id, text, is_read, created_at) VALUES ('luca', 'request_accepted', 'test', 'record', ?, ?, 1, ?)`,
      [row.id, album.title, daysAgo(days - 1)]);
    await run(`INSERT OR IGNORE INTO contributions (entity_type, entity_id, username) VALUES ('record', ?, 'luca')`, [row.id]);
  }

  const thriller = albumRows.find(a => a.title === "Thriller");
  await run(`INSERT INTO requests (username, type, target_id, name, genres, created_at) VALUES ('marco', 'record', ?, 'Thriller', 'Pop, Funk, Soul', ?)`, [thriller.id, daysAgo(0)]);
  await run(`INSERT INTO notifications (username, type, from_user, text, created_at) VALUES ('test', 'new_correction', 'marco', 'Thriller', ?)`, [daysAgo(0)]);

  const chats = [
    ["mario", "giulia", ["Hi! Have you heard the new album?", "Yes! I love it", "I'm listening to it again tonight"]],
    ["luca", "mario", ["I added you to a rap playlist", "Thanks, listening now", "Let me know!"]],
    ["sara", "test", ["I sent a request for a song", "Ok, I'll check it as soon as I can"]],
    ["chiara", "mario", ["Can you recommend something soul?", "Try What's Going On by Marvin Gaye"]]
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
  console.log(`Done: ${await count("users")} users, ${await count("artists")} artists (${photos} with a photo), ${await count("records")} records ` +
              `(${covers} with a cover), ${await count("songs")} songs (${lyricsCount} with lyrics), ${await count("record_ratings") + await count("song_ratings")} ratings, ` +
              `${await count("playlists")} playlists, ${await count("comments")} comments, ${await count("abouts")} abouts.`);
  if (keep.length > 0) {
    console.log(`New users have the password "${PASSWORD}". test and mario keep their usual password.`);
  } else {
    console.log(`All users, test and mario included, have the password "${PASSWORD}".`);
  }
  db.close();
}

main().catch((err) => {
  console.error("Seed error:", err.message);
  process.exit(1);
});
