const isProduction = import.meta.env.PROD;

const GITHUB_USER = 'Jotape003'; 
const REPO_NAME = 'Spotify_OAuth';

export const AUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '', 
  
  REDIRECT_URI: isProduction 
    ? `https://${GITHUB_USER}.github.io/${REPO_NAME}/callback`
    : 'http://127.0.0.1:5173/callback',
  
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  
  SCOPE: 'user-read-playback-state' 
};