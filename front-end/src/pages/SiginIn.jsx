import { Link, Route, Routes, useNavigate } from "react-router-dom";

function submitLoginForm(form) {
    const formData = {
        email: form["email"].value,
        password: form["password"].value,
    };
    return formData;
}

const DOMAIN = "http://127.0.0.1:8000";

async function formLogin(form, navigate) {
    const formData = submitLoginForm(form);
    const request = new Request(`${DOMAIN}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
    });

    try {
        const response = await fetch(request);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Response Data:", data); // Log response to debug

        
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        console.log("Login Successful", data.access);
        alert("Login Successful");

        // Redirect to dashboard
        navigate("/dashboard");
    } catch (error) {
        alert("Login Failed");
        console.log("Login Failed", error);
    }
}

const SignIn = () => {
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        await formLogin(form, navigate);
    };
    return (
        <main className="flex items-center text-center justify-center h-screen">
            <div className="w-full max-w-xs">
                <form onSubmit={handleSubmit}>
                    <h1 className="h3 mb-3 fw-normal">Please sign in</h1>
                    <div className="form-floating">
                        <input
                            type="email"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                            name="email"
                        />
                        <label htmlFor="floatingInput">Email address</label>
                    </div>
                    <div className="form-floating">
                        <input
                            type="password"
                            className="form-control"
                            id="floatingPassword"
                            placeholder="Password"
                            name="password"
                        />
                        <label htmlFor="floatingPassword">Password</label>
                    </div>
                    <div>
                        <Link to="/request_token">Forgot Password?</Link>
                    </div>
                    <div className="form-check text-start my-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            value="remember-me"
                            id="flexCheckDefault"
                        />
                        <label className="form-check-label" htmlFor="flexCheckDefault">
                            Remember me
                        </label>
                    </div>
                    <button className="btn btn-primary w-100 py-2 ml-0" type="submit">
                        Sign in
                    </button>
                    <p className="mt-5 mb-3 text-body-secondary">&copy; 2017–2024</p>
                </form>
            </div>
        </main>
    );
};

export default SignIn;
