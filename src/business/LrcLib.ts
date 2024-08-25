import { StatusCodes } from 'http-status-codes';
import queryString from 'query-string';
import { LrcLyrics } from './types/LrcLib.js';
import Timestamp from './Timestamp.js';

class LrcLib {
  static #instance: LrcLib;
  static #currentlyPlaying: LrcLyrics = {} as LrcLyrics;

  private baseUri: string = process.env.LRCLIB_BASE_API_URI;

  private constructor() {}

  public static get instance(): LrcLib {
    if (!LrcLib.#instance) {
      LrcLib.#instance = new LrcLib();
    }

    return LrcLib.#instance;
  }

  public static get currentlyPlaying(): LrcLyrics {
    return LrcLib.#currentlyPlaying;
  }

  public async getLyrics(q: string): Promise<LrcLyrics> {
    const response = await this.request('search', 'GET', {
      q,
    });

    if (response.status === StatusCodes.OK) {
      const body = (await response.json()) as LrcLyrics[];
      if (!body.length) {
        return {} as LrcLyrics;
      }
      const item = body[0];
      if (!item.syncedLyrics) {
        return {} as LrcLyrics;
      }
      const lyrics = item.syncedLyrics.split('\n');
      const timestamps = [];
      lyrics.forEach((line) => {
        timestamps.push(Timestamp.convertTimestampToMs(line.split(' ')[0]));
      });

      const parsedLyrics = [];
      for (let i = 0; i < lyrics.length; i++) {
        parsedLyrics.push({
          line: lyrics[i].split(' ').slice(1).join(' '),
          timestamp: timestamps[i],
          id: i,
        });
      }

      LrcLib.#currentlyPlaying = { ...item, parsedLyrics: parsedLyrics };

      return LrcLib.#currentlyPlaying;
    }

    LrcLib.#currentlyPlaying = {} as LrcLyrics;

    return {} as LrcLyrics;
  }

  private async request(
    path: string,
    method: string,
    queryParams: object = {},
  ): Promise<Response> {
    return await fetch(
      `${this.baseUri}/${path}?${queryString.stringify(queryParams)}`,
      {
        method,
      },
    );
  }
}

export default LrcLib;
