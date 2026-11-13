# SpitFire

SpitFire è un'applicazione web dedicata alla musica, costruita attorno a una community: un catalogo di artisti, dischi e canzoni in cui gli utenti possono valutare i contenuti, annotare i testi, scrivere About e biografie, commentare, creare playlist e proporre nuovi contenuti, con un sistema di moderazione basato sui ruoli.

- **Frontend**: Ionic + Angular (TypeScript), nella cartella principale
- **Backend**: Node.js + Express, API REST, nella cartella `spitfire-server/`
- **Database**: SQLite

La descrizione completa del progetto si trova nella relazione allegata.

---

## Requisiti

- **Node.js** 20 o superiore (sviluppato con Node.js 24) e **npm**
- **Ionic CLI**, per avviare il frontend sulla porta 8100:
  ```
  npm install -g @ionic/cli
  ```
- Una **connessione internet**, necessaria solo per l'invio delle email di recupero password (servizio di prova Ethereal)

## Installazione

Dalla cartella principale del progetto:

```
npm install
cd spitfire-server
npm install
```

## Configurazione

Nella cartella `spitfire-server/`, copiare il file di esempio `.env.example` in un nuovo file `.env`:

```
cp .env.example .env
```

Il file contiene già la chiave `JWT_SECRET`, usata per firmare i token di accesso, pronta all'uso.

## Database e dati di esempio

Sempre in `spitfire-server/`:

```
npm run seed
```

Il comando crea il database `database.sqlite` e lo popola con dati di esempio: 100 utenti, 53 artisti, 62 dischi con le relative canzoni, valutazioni, commenti, playlist, About, biografie, richieste e messaggi.

Il seed copia inoltre le **copertine** e le **foto degli artisti** dalla cartella `AlbumCover/` e i **testi delle canzoni** dalla cartella `Lyrics/`, collegandoli ai rispettivi contenuti. Al termine viene stampato un riepilogo, ad esempio:

```
Done: 100 users, 53 artists (20 with a photo), 62 records (62 with a cover), 679 songs (42 with lyrics), ...
```

Il seed può essere rilanciato in qualsiasi momento per ripristinare i dati iniziali. 

## Avvio

Servono due terminali.

**1. Backend** (porta 3000), dalla cartella `spitfire-server/`:

```
npm run dev
```

**2. Frontend** (porta 8100), dalla cartella principale:

```
ionic s
```


## Account di prova

Tutti gli account creati dal seed hanno la password **`password123`**.

| Username | Ruolo | Note |
|---|---|---|
| `test` | Amministratore | Accesso a Requests e Reports; approva richieste e candidature |
| `giulia` | Moderatrice | Accesso a Reports; approva annotazioni, About e biografie |
| `luca` | Utente | Ha 10 richieste accettate: può provare la candidatura a moderatore (*Become a moderator*, nel footer) |
| `mario` | Utente | Utente generico, con playlist, preferiti e messaggi |

Sono presenti anche altri utenti generati dal seed (ad esempio `marco`, `sara`, `elena`, `chiara`), tutti con la stessa password.

## Cosa provare

Di seguito le principali azioni disponibili per ciascun ruolo. Ogni ruolo può fare anche tutto ciò che è permesso ai ruoli precedenti. Per passare da un account all'altro basta usare *Logout* dalla pagina del profilo.

> **Suggerimento:** i flussi di moderazione si provano meglio in due finestre del browser (ad esempio una normale e una in incognito): in una si crea un contenuto come utente, nell'altra lo si approva come moderatore o amministratore.

### Visitatore (senza login)

- Navigare il catalogo: pagine di artisti, dischi e canzoni (`/artists/:id`, `/records/:id`, `/songs/:id`)
- Cercare canzoni, dischi, artisti e utenti dalla barra di ricerca
- Consultare le classifiche in **Charts**, filtrandole per anno e genere
- Ricevere suggerimenti da **Discover** (generi, epoche, lingue)
- Leggere testi, traduzioni, annotazioni approvate, About, biografie e commenti
- Esplorare le playlist pubbliche e i profili degli utenti
- Registrarsi o recuperare la password

### Utente (es. `mario`, `luca`)

- **Valutare** dischi e canzoni con le stelle (da 0,5 a 5) e vedere la distribuzione dei voti cliccando sul numero di valutazioni
- Aggiungere artisti, dischi e canzoni ai **preferiti**
- **Commentare** dischi, canzoni, artisti e playlist, rispondere, mettere like/dislike e **segnalare** un commento
- Scrivere un'**annotazione**: aprire una canzone con il testo (ad esempio una qualsiasi traccia di *OK Computer*), selezionare una porzione del testo e scrivere la spiegazione; l'annotazione resta *in attesa* finché un moderatore non la approva
- Proporre una **traduzione** del testo dal menu *Translations*
- Scrivere o proporre modifiche agli **About** dei dischi e alle **biografie** degli artisti
- Creare **playlist** (pubbliche o private), aggiungere e rimuovere canzoni, mettere like alle playlist degli altri
- **Seguire** altri utenti e inviare **messaggi privati**; nella chat è possibile **bloccare** un utente
- Inviare una **richiesta di contenuto** da **Add content** (nuova canzone, disco o artista) oppure una correzione tramite il pulsante *Correct entry* nelle pagine dei contenuti, e seguirne lo stato
- Personalizzare il profilo da **Settings** (foto, bio, colore, chi può scrivere, email, password) ed eliminare l'account
- Consultare le **notifiche** e i messaggi dalla propria pagina profilo
- Candidarsi a moderatore da **Become a moderator** (nel footer): possibile solo con almeno 10 richieste accettate, come per l'utente `luca`

### Moderatore (`giulia`)

- Approvare o rifiutare le **annotazioni** in attesa, direttamente nella pagina della canzone
- Approvare o rifiutare gli **About** e le **biografie** in attesa e le relative modifiche proposte. Nel seed è presente un About in attesa sul disco *Nevermind*, scritto dall'utente `sara`
- Gestire le **segnalazioni** di commenti e annotazioni dalla pagina **Reports** (link nella barra di navigazione), scegliendo se eliminare il contenuto o mantenerlo
- Eliminare annotazioni, About e commenti
- Le annotazioni, gli About e le biografie scritti da un moderatore vengono pubblicati senza bisogno di approvazione
- Ricevere una notifica per ogni contenuto in attesa di revisione

### Amministratore (`test`)

- Gestire le **richieste di contenuto** dalla pagina **Requests** (link nella barra di navigazione), filtrandole per tipo e accettandole o rifiutandole. Nel seed è presente una richiesta di correzione dei generi del disco *Thriller*, inviata dall'utente `marco`; accettandola, i generi del disco vengono aggiornati
- Gestire le **candidature a moderatore** nella scheda *Moderators* di Requests: ad esempio, candidarsi con `luca` e accettare la candidatura con `test`, dopodiché `luca` ha subito accesso a Reports
- Le richieste di contenuto inviate da un amministratore da Add content vengono pubblicate subito, senza passare da Requests
- Tutte le funzioni dei moderatori, compresa la pagina Reports

## Recupero password

Senza configurazione SMTP, le email vengono inviate tramite **Ethereal**, un servizio di prova: **non arrivano** in una casella reale. Dopo aver richiesto il recupero dalla pagina *Forgot password?*, nel terminale del backend compare una riga come:

```
Email preview: https://ethereal.email/message/...
```

Aprendo il link si visualizza l'email, con il pulsante per scegliere una nuova password. Il link è valido 30 minuti e utilizzabile una sola volta.


## Note

- **On This Day**: la sezione della home page che mostra gli anniversari usa attualmente una **data simulata (2 ottobre)**, per poter mostrare un esempio con i dati del seed (il disco *Kid A*). La data si imposta con la costante `SIMULATED_DAY` in `src/app/pages/home/home.page.ts`; con `null` viene usata la data del giorno.

