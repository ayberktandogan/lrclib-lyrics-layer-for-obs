import Spotify from "./business/Spotify.js";
import Window from "./business/Window.js";
import dotenv from 'dotenv';

dotenv.config();

new Spotify().startAuth();