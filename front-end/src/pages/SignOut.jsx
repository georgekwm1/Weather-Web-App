import { useNavigate } from "react-router-dom";
import { DOMAIN, refreshAccessToken } from "../functions/refreshAccessToken";


async function Logout(navigate) {
    let accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log("accessToken", accessToken);
    if (!accessToken) {
        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
            console.log("No Access Token Found");
            navigate('/');
        }
        accessToken = newAccessToken.access;
        localStorage.setItem('accessToken', accessToken);
    }
    const request = new Request(`${DOMAIN}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }), // Include refresh token in body
    });

    try {
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        localStorage.removeItem('accessToken');
        navigate('/');
        alert("Logout Successful");
        console.log("Logout Successful");
    } catch (error) {
        alert("Session Expired. Please login again.");
        console.log("Session Expired. Please login again.", error);
        navigate('/');
    }
}

const SignOut = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await Logout(navigate);
        
    };

    return (
        <div className="flex item-center justify-center">
        <button onClick={handleLogout} className="btn btn-primary">Sign Out</button>
        </div>
        // handleLogout
    );
};

export default SignOut;
