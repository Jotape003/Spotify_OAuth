import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchPlayback = async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 204) {
          setTrack({ name: 'Nenhuma música tocando no momento.' });
        } else if (response.status === 401) {
          handleLogout();
        } else {
          const data = await response.json();
          setTrack(data.item);
        }
      } catch (error) {
        console.error("Erro ao buscar música", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayback();
  }, [navigate]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <h1>🎧 Spotify Player (Viewer)</h1>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '400px', margin: '0 auto' }}>
        {track?.album && (
          <img 
            src={track.album.images[0].url} 
            alt="Album Art" 
            style={{ width: '100%', borderRadius: '8px' }} 
          />
        )}
        <h2>{track?.name || track}</h2>
        {track?.artists && (
          <p>Artista: {track.artists.map((a) => a.name).join(', ')}</p>
        )}
      </div>

      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Sair
      </button>
    </div>
  );
}