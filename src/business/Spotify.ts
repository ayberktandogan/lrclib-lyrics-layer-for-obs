import express from 'express';
import Window from './Window.js';
import queryString from 'query-string';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import { SpotifyCurrentlyPlaying, SpotifyToken } from './types/Spotify.js';
import { v4 as uuid } from 'uuid';

const app = express();

class Spotify {
  static #instance: Spotify;
  static #currentlyPlaying: SpotifyCurrentlyPlaying;

  private clientId: string = process.env.SPOTIFY_CLIENT_ID;
  private clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET;
  private scopes: string[] = process.env.SPOTIFY_SCOPES.split(',');
  private baseUri: string = process.env.SPOTIFY_BASE_API_URI;
  private authUrl: string = process.env.SPOTIFY_AUTHORIZE_URL;
  private tokenUrl: string = process.env.SPOTIFY_TOKEN_URL;
  private redirectUri: string = process.env.SPOTIFY_REDIRECT_URI;
  private server: Server;
  private token: SpotifyToken;

  private constructor() {}

  public static get instance(): Spotify {
    if (!Spotify.#instance) {
      Spotify.#instance = new Spotify();
    }

    return Spotify.#instance;
  }

  public static get currentlyPlaying(): SpotifyCurrentlyPlaying {
    return Spotify.#currentlyPlaying;
  }

  public async currentlyPlayingJob(): Promise<SpotifyCurrentlyPlaying> {
    const response = await this.request('me/player');

    if (response.status === StatusCodes.OK) {
      const body = (await response.json()) as SpotifyCurrentlyPlaying;

      Spotify.#currentlyPlaying = body;

      return body;
    }
    return {} as SpotifyCurrentlyPlaying;
  }

  public startAuth(): boolean {
    const state = uuid();
    Window.openWindow(this.getAuthUrl(state));

    app.get('/auth/callback', (req, res) =>
      this.callback(req, res, state, this.server),
    );
    this.server = app.listen(3000, 'localhost', () => {
      console.warn('started listening for callback');
    });

    return true;
  }

  public async callback(
    req: express.Request,
    res: express.Response,
    state: string,
    server: Server,
  ): Promise<express.Response<any, Record<string, any>>> {
    // close express server, we don't need it anymore
    server.close();

    const code = req.query.code;

    if (state !== req.query.state) {
      return res.status(403).json({ message: 'state mismatch' });
    }

    if (code) {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        body: queryString.stringify({
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')}`,
        },
      });

      const token = (await response.json()) as SpotifyToken;
      this.token = token;
      return res.status(200).send('<h1>You can close this window now.</h1>');
    }

    return res.status(500).json({ message: 'NOT OK' });
  }

  public isTokenSet(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(!!this.token);
    });
  }

  private getAuthUrl(state: string): string {
    return `${this.authUrl}?${queryString.stringify({
      scope: this.scopes.join(' '),
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
    })}`;
  }

  private async request(
    path: string,
    method: string = 'GET',
  ): Promise<Response> {
    return await fetch(`${this.baseUri}/${path}`, {
      method: method,
      headers: {
        Authorization: `${this.token.token_type} ${this.token.access_token}`,
      },
    });
  }
}

export default Spotify;
