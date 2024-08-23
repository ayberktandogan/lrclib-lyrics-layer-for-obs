import express from 'express';
import Window from "./Window.js";
import queryString from "query-string";
import { Server } from "http";

const app = express();

class Spotify {
    private clientId: string = process.env.SPOTIFY_CLIENT_ID;
    private clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET;
    private scopes: string[] = process.env.SPOTIFY_SCOPES.split(',');
    private baseUri: string = process.env.SPOTIFY_BASE_API_URI;
    private authUrl: string = process.env.SPOTIFY_AUTHORIZE_URL;
    private tokenUrl: string = process.env.SPOTIFY_TOKEN_URL;
    private redirectUri: string = process.env.SPOTIFY_REDIRECT_URI;
    private server: Server;

    public getCurrentlyPlaying() {

    }

    public startAuth(): boolean {
        Window.openWindow(this.getAuthUrl());

        app.get('/auth/callback', this.callback);
        this.server = app.listen(3000, "localhost", () => {
            console.warn("started listening for callback");
        })

        return true;
    }

    private getAuthUrl(): string {
        // TODO: ADD STATE
        return `${this.authUrl}?${queryString.stringify({
            scopes: this.scopes.join(' '),
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: "code"
        })}`
    }

    public callback(req: express.Request, res: express.Response): string {
        this.server.close();

        const code = req.query.code;
        const state = req.query.state;

        if (!code) {
            fetch(this.tokenUrl, {
                method: "POST",
                body: JSON.stringify({
                    code: code,
                    grant_type: "authorization_code",
                    redirect_uri: this.redirectUri
                }),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')}`
                }
            })
        }

        return "test";
    }
}

export default Spotify;