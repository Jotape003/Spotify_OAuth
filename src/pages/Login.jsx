import { generateRandomString, generateCodeChallenge } from '../utils/auth';
import { AUTH_CONFIG } from '../config';

export function Login() {
  const handleLogin = async () => {
    const codeVerifier = generateRandomString(128);
    
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    const state = generateRandomString(32);

    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('auth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: AUTH_CONFIG.CLIENT_ID,
      scope: AUTH_CONFIG.SCOPE,
      redirect_uri: AUTH_CONFIG.REDIRECT_URI,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${AUTH_CONFIG.AUTH_URL}?${params.toString()}`;
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>🎵 Spotify Viewer Seguro</h1>
      <p>Login via OAuth 2.0 com PKCE (Sem Client Secret)</p>
      
      <button 
        onClick={handleLogin}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: '20px'
        }}
      >
        Entrar com Spotify
      </button>
    </div>
  );
}