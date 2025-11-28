const isProduction = import.meta.env.PROD;

export const AUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_CLIENT_ID || 'SEU_CLIENT_ID_DO_SPOTIFY', 
  
  // Decide automaticamente a URL de retorno
  REDIRECT_URI: isProduction 
    ? 'https://SEU_USUARIO.github.io/NOME_DO_REPO/callback' // <--- Vamos ajustar isso depois
    : 'http://127.0.0.1:5173/callback',
  
  AUTH_URL: 'https://accounts.spotify.com/authorize',
  TOKEN_URL: 'https://accounts.spotify.com/api/token',
  
  SCOPE: 'user-read-playback-state' 
};