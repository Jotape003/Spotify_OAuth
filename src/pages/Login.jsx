// src/pages/Login.tsx
import { generateRandomString, generateCodeChallenge } from '../utils/auth';
import { AUTH_CONFIG } from '../config';

export function Login() {
  const handleLogin = async () => {
    // 1. Gerar o Code Verifier (segredo aleatório para o PKCE)
    const codeVerifier = generateRandomString(128);
    
    // 2. Gerar o Code Challenge (Hash SHA-256 do Verifier)
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // 3. Gerar o State (proteção contra ataques CSRF)
    const state = generateRandomString(32);

    // 4. Salvar verifier e state no sessionStorage (Requisito de Segurança)
    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('auth_state', state);

    // 5. Montar a URL de Autorização do Spotify
    const params = new URLSearchParams({
      response_type: 'code',           // Obrigatório para OAuth
      client_id: AUTH_CONFIG.CLIENT_ID,
      scope: AUTH_CONFIG.SCOPE,
      redirect_uri: AUTH_CONFIG.REDIRECT_URI,
      state: state,                    // Envia o state para validação futura
      code_challenge: codeChallenge,   // Envia o hash PKCE
      code_challenge_method: 'S256',   // Método de criptografia
    });

    // 6. Redirecionar o usuário para a tela de login do Spotify
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
          backgroundColor: '#1DB954', // Verde Spotify
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