export const AUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI,
  
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  
  SCOPE: 'user-read-playback-state'
};