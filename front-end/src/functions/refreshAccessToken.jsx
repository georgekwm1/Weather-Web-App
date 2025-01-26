export const DOMAIN = 'http://127.0.0.1:8000';


export async function refreshAccessToken() {
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