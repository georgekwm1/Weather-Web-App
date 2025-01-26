import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useState } from "react";

const DOMAIN = "http://127.0.0.1:8000"

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.log("No Refresh Token Found");
        return null;
    }
    const request = new Request(`${DOMAIN}/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "refresh": refreshToken
        }),
    });

    try {
        const response = await fetch(request);
        if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
} catch (error) {
    console.log("Refresh Token Failed", error);
    return null;
}
}

async function verifyToken(navigate) {
    var accessToken = localStorage.getItem('accessToken')
    console.log("Access Token: ", accessToken);
    if (!accessToken) {
        console.log("No Session found");
        accessToken = await (refreshAccessToken())["access"];
        console.log("Access Token: ", accessToken);
        if (!accessToken) {
            return null;
        };
    };

    const response = await fetch('http://localhost:8000/token/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ access: accessToken })
    });

    if (response.ok) {
        console.log("Token is valid");
        navigate('/dashboard');
    } else {
        console.log("Token is invalid");
        localStorage.removeItem('accessToken');
    }

     
 }

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        verifyToken(navigate);
        
    })

    
    return (
    <main className="flex items-center justify-center h-screen">
        <div className="w-full max-w-md">
    <h1>Cover your page.</h1>
    <p className="lead">Cover is a one-page template for building simple and beautiful home pages. Download, edit the text, and add your own fullscreen background photo to make it your own.</p>
    <p className="lead">
      <a href="#" className="btn btn-lg btn-light fw-bold border-white bg-white">Learn more</a>
    </p>
    </div>
  </main>
    );
};

export default Home;
