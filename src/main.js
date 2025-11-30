import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';

import { generateCodeChallenge, generateRandomString } from './utils';
import axios from 'axios';

const app = document.querySelector("#app")

const { pathname } = window.location

async function loadLoginPage() {
    app.innerHTML = `
    <div class="d-flex justify-content-center align-items-center flex-column gap-3 vh-100">
        <img class="m-4" src="./public/github-icon.svg" alt="">
        <div class="display-6">
        OAuth2 + GitHub Integration
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

        const params = new URLSearchParams({
            client_id: VITE_CLIENT_ID,
            redirect_uri: `${window.location.origin}/callback`,
            scope: "repo",
            //  An unguessable random string. It is used to protect against
            //  cross-site request forgery attacks.
            state: state,
            // Must be a 43 character SHA-256 hash of a random string generated
            // by the client. 
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
    })
}

function loadDashboardPage() {
    console.log("Dashboard")
}

async function loadCallbackPage() {
    const params = new URLSearchParams(window.location.search);
    // The temporary code will expire after 10 minutes.
    const code = params.get('code');
    //  If the states don't match, then a third party created the request, and
    //  you should abort the process.
    const state = params.get('state');

    const storedState = sessionStorage.getItem('auth_state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (!code || !codeVerifier || state !== storedState) {
        // Ir para página de error
        setMensagem('Erro de segurança ou código inválido.');
        return;
    }

    try {
        const { VITE_CLIENT_ID, VITE_CLIENT_SECRET } = import.meta.env

        const params = {
            client_id: VITE_CLIENT_ID,
            client_secret: VITE_CLIENT_SECRET,
            code: code,
            redirect_uri: `${window.location.origin}/callback`,
            code_verifier: codeVerifier
        }

        // console.log(params)

        // const response = await axios.post(
        //     "https://github.com/login/oauth/access_token",
        //     params,
        // )

        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params
        });

        const data = await response.json();

        console.log(data)

        // sessionStorage.setItem('access_token', data.access_token);
        // navigate('/dashboard');

    } catch (error) {
        console.error(error);
        // goToErrorPage(error.message);
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
    if (pathname == "/") {
        await loadLoginPage()
    } else if (pathname == "/dashboard") {
        loadDashboardPage()
    } else if (pathname == "/callback") {
        await loadCallbackPage()
    } else if (pathname == "/error") {
        await loadErrorPage()
    } else {
        load404Page()
    }
})