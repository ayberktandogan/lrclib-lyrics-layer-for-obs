import LrcLib from './business/LrcLib.js';
import Spotify from './business/Spotify.js';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

Spotify.instance.startAuth();

async function waitForCondition(): Promise<void> {
  let conditionMet = false;

  while (!conditionMet) {
    conditionMet = await Spotify.instance.isTokenSet();

    if (!conditionMet) {
      console.log('Condition not met, checking again in 1 second...');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    }
  }

  console.log('Condition met, exiting loop.');
}

await waitForCondition();

// Set the views directory (use relative path from compiled JS)
app.set('views', path.join(__dirname, '..', 'src', 'views'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Example route
app.get('/', (req, res) => {
  res.render('index', {
    lyrics: LrcLib.currentlyPlaying,
    song: Spotify.currentlyPlaying,
  }); // 'template' refers to 'template.ejs'
});

// Start the server
app.listen(1337, () => {
  console.log('Server is running on http://localhost:1337');
});

let lastWantedSongId = '';
// eslint-disable-next-line no-constant-condition
while (true) {
  const currentlyPlaying = await Spotify.instance.currentlyPlayingJob();

  if (lastWantedSongId === currentlyPlaying?.item?.id) {
    // do nothing
  } else if (currentlyPlaying.device) {
    const lyrics = await LrcLib.instance.getLyrics(
      currentlyPlaying?.item?.name,
    );

    console.log(lyrics.syncedLyrics);
  }

  lastWantedSongId = currentlyPlaying.item.id;

  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 1 second
}
