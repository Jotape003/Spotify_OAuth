import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import { generateCodeChallenge, generateRandomString } from './utils';
import axios from 'axios';

const app = document.querySelector("#app")

async function loadLoginPage() {
    app.innerHTML = `
    <div class="d-flex justify-content-center align-items-center flex-column gap-3 vh-100">
        <img class="m-4" src="./public/spotify-icon.png" alt="" width="150px">
        <div class="display-6">
        OAuth2 + Spotify Integration
        </div>
        <div class="d-flex justify-content-center align-items-center">
            <div class="m-2">Cargo:</div>
            <select id="role-select" class="form-select" aria-label="Default select example">
                <option selected value="viewer">Viewer</option>
                <option value="manager">Manager</option>
            </select>
        </div>
        <button id="login-button" class="mt-3 btn btn-light btn-lg d-flex align-items-center shadow-sm border rounded-pill px-4 py-2">
            <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google Logo" class="me-2" width="24"
                height="24">
            <span class="">Sign in with Google</span>
        </button>
    </div>
    `

    const loginButton = document.querySelector("#login-button")

    loginButton.addEventListener("click", async () => {
        const { VITE_CLIENT_ID } = import.meta.env

        const codeVerifier = generateRandomString(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateRandomString(32);

        sessionStorage.setItem('code_verifier', codeVerifier);
        sessionStorage.setItem('auth_state', state);
        sessionStorage.setItem('role', document.querySelector("#role-select").value);

        let scope = ""
        if (sessionStorage.getItem("role") == "viewer") {
            scope = "user-read-currently-playing"
        } else if (sessionStorage.getItem("role") == "manager") {
            scope = "streaming user-read-currently-playing user-read-email user-read-private"
        }

        const params = new URLSearchParams({
            response_type: "code",
            client_id: VITE_CLIENT_ID,
            redirect_uri: `${window.location.origin}/callback`,
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            scope
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    })
}

async function loadDashboardPage() {
    const token = sessionStorage.getItem('access_token');
    const role = sessionStorage.getItem("role")

    if (!token) {
        goToErrorPage("Token não encontrado!")
    }

    if (!role) {
        goToErrorPage("Role não foi identificada!")
    }


    app.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center min-vh-100 px-2">
            <div id="current-playing-data" class="d-flex flex-column align-items-center justify-content-center px-2">
            </div>
            <div class="m-2" id="player"></div>
            <button id="button-logoff" type="button" class="m-2 btn btn-danger">Logoff</button>
        </div>
    `

    const logoffButton = document.querySelector("#button-logoff")

    logoffButton.addEventListener("click", logoff)

    const updateAlbumData = async () => {
        const pathname = String(window.location.pathname).toLocaleLowerCase()

        if (!pathname.endsWith("/dashboard")) {
            clearInterval(pollingInfoInterval)
            return
        }


        const albumData = document.querySelector("#current-playing-data")

        const currentPlaying = await axios.get(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )

        const currentPlayingData = currentPlaying.data

        const albumImages = currentPlayingData?.item?.album?.images
        let albumImageURL = null
        if (Array.isArray(albumImages) && albumImages.length > 0) {
            albumImageURL = albumImages[0]?.url
        }

        const artists = currentPlayingData?.item?.artists
        let artistsNames = ""
        if (Array.isArray(artists)) {
            artistsNames = artists.map(artist => artist?.name).join(", ")
        }

        const durationMS = currentPlayingData?.item?.duration_ms
        let durationMinutes
        let durationSeconds
        if (durationMS) {
            durationMinutes = Math.floor((parseInt(durationMS) / 1000) / 60)
            durationSeconds = durationMinutes % 60
        }

        albumData.innerHTML = `
            <img class="m-4" src="${albumImageURL}" alt="Album Image" width="200px">
            <ul class="list-group w-100">
                <li class="list-group-item"><strong>Música:</strong> ${currentPlayingData?.item?.name}</li>
                <li class="list-group-item"><strong>Duração:</strong> ${durationMinutes}m ${durationSeconds}s</li>
                <li class="list-group-item"><strong>Album:</strong> ${currentPlayingData?.item?.album?.name}</li>
                <li class="list-group-item"><strong>Artista(s):</strong> ${artistsNames}</li>
            </ul>
        `
    }

    updateAlbumData()
    const pollingInfoInterval = setInterval(updateAlbumData, 10000);

    // Load pause button
    if (role === "manager") {
        const player_div = document.querySelector("#player")

        player_div.innerHTML = `
            <div class="d-flex">
                <button id="previous-button" type="button" class="btn btn-primary m-1">&lt;&lt;</button>
                <button id="play-stop-button" type="button" class="btn btn-primary m-1">Play/Stop</button>
                <button id="next-button" type="button" class="btn btn-primary m-1">&gt;&gt;</button>
            </div>
        `

        // const player = document.querySelector("#player")
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.connect();

            const playStopButton = document.querySelector("#play-stop-button")
            playStopButton.addEventListener("click", () => {
                player.togglePlay()
            })

            const previousButton = document.querySelector("#previous-button")
            previousButton.addEventListener("click", () => {
                player.previousTrack()
            })

            const nextButton = document.querySelector("#next-button")
            nextButton.addEventListener("click", () => {
                player.nextTrack()
            })
        };
    }
}

function logoff() {
    sessionStorage.clear()
    window.location.href = `/`
}

async function loadCallbackPage() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const storedState = sessionStorage.getItem('auth_state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (!code || !codeVerifier || state !== storedState) {
        // Ir para página de error
        goToErrorPage('Erro de segurança ou código inválido.');
        return;
    }

    try {
        const { VITE_CLIENT_ID } = import.meta.env

        const body = {
            client_id: VITE_CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: `${window.location.origin}/callback`,
            code_verifier: codeVerifier
        }

        const response = await axios.post(
            "https://accounts.spotify.com/api/token",
            body,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )

        sessionStorage.setItem('access_token', response.data.access_token);
        window.location.href = "/dashboard"
    } catch (error) {
        goToErrorPage(error.message);
    }
};


function load404Page() {
    app.innerHTML = `
        <div class="custom-bg text-dark">
            <div class="d-flex align-items-center justify-content-center min-vh-100 px-2">
                <div class="text-center">
                    <h1 class="display-1 fw-bold">404</h1>
                    <p class="fs-2 fw-medium mt-4">Oops! Page not found</p>
                    <p class="mt-4 mb-5">The page you're looking for doesn't exist or has been moved.</p>
                    <a href="/" class="btn btn-light fw-semibold rounded-pill px-4 py-2 custom-btn">
                        Go Home
                    </a>
                </div>
            </div>
        </div>`
}

async function loadErrorPage() {
    const params = new URLSearchParams(window.location.search);
    // The temporary code will expire after 10 minutes.
    const errorMessage = params.get('error_message');

    app.innerHTML = `
        <div class="custom-bg text-dark">
            <div class="d-flex align-items-center justify-content-center min-vh-100 px-2">
                <div class="text-center">
                    <p class="fs-2 fw-medium mt-4"><span class="text-danger">ERROR!</span></p>
                    <p class="mt-4 mb-5">${errorMessage}</p>
                    <a href="/" class="btn btn-light fw-semibold rounded-pill px-4 py-2 custom-btn">
                        Go Home
                    </a>
                </div>
            </div>
        </div>`
}

function goToErrorPage(errorMessage) {
    errorMessage = errorMessage || "Erro inesperado!"
    window.location.href = `/error?error_message=${errorMessage}`
}

document.addEventListener("DOMContentLoaded", async () => {
    const pathname = String(window.location.pathname).toLocaleLowerCase()

    if (pathname.endsWith("/")) {
        await loadLoginPage()
    } else if (pathname.endsWith("/dashboard")) {
        await loadDashboardPage()
    } else if (pathname.endsWith("/callback")) {
        await loadCallbackPage()
    } else if (pathname.endsWith("/error")) {
        await loadErrorPage()
    } else {
        load404Page()
    }
})