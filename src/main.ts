import LrcLib from './business/LrcLib.js';
import Spotify from './business/Spotify.js';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

Spotify.instance.startAuth();

async function waitForCondition(): Promise<void> {
  let conditionMet = false;

  while (!conditionMet) {
    conditionMet = await Spotify.instance.isTokenSet();

    if (!conditionMet) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  console.log('Condition met, exiting loop.');
}

await waitForCondition();

app.get('/song', (req, res) => {
  res.status(200).json(Spotify.currentlyPlaying);
});

app.get('/lyrics', (req, res) => {
  res.status(200).json(LrcLib.currentlyPlaying);
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
    await LrcLib.instance.getLyrics(currentlyPlaying?.item?.name);
  }

  lastWantedSongId = currentlyPlaying?.item?.id;

  await new Promise((resolve) => setTimeout(resolve, 2000));
}
