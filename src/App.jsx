// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Callback } from './pages/Callback';
import { Dashboard } from './pages/Dashboard';


function App() {
  return (
    // Mude para esta estrutura
    <BrowserRouter basename="/Spotify_OAuth/"> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;