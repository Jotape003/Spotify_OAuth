import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_CONFIG } from '../config';

export function Callback() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState('Processando login com Spotify...');

  useEffect(() => {
    const processarLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      
      const storedState = sessionStorage.getItem('auth_state');
      const codeVerifier = sessionStorage.getItem('code_verifier');

      console.log("Code", code)
      console.log("codeVerifier", codeVerifier)
      console.log("state", state)
      if (!code || !codeVerifier || state !== storedState) {
        setMensagem('Erro de segurança ou código inválido.');
        return;
      }

      try {
        const bodyParams = new URLSearchParams();
        bodyParams.append('grant_type', 'authorization_code');
        bodyParams.append('code', code);
        bodyParams.append('redirect_uri', AUTH_CONFIG.REDIRECT_URI);
        bodyParams.append('client_id', AUTH_CONFIG.CLIENT_ID);
        bodyParams.append('code_verifier', codeVerifier);

        const response = await fetch(AUTH_CONFIG.TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams
        });

        const data = await response.json();

        if (!response.ok) {
           throw new Error(data.error_description || 'Falha na troca de token');
        }

        sessionStorage.setItem('access_token', data.access_token);
        navigate('/dashboard');

      } catch (error) {
        console.error(error);
        setMensagem(`Erro: ${error.message}`);
      }
    };

    processarLogin();
  }, [navigate]);

  return <div><h1>{mensagem}</h1></div>;
}