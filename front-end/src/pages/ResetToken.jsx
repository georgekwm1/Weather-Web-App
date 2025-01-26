import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ResetToken() {
  const { resetToken } = useParams();
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    makeChanges(navigate);
    setPassword(e.target.password.value);
    setConfirmPassword(e.target.confirm_password.value);
  }
  const makeChanges = async (navigate) => {
    const request = new Request(`http://localhost:8000/reset_token/${resetToken}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        confirm_password: confirm_password,
      }),
    });
    try {
      const response = await fetch(request);
      if (!response.ok) {
        throw new Error("Error fetching response");
      }
      const data = await response.json();
      console.log(data);
      alert("Password Reset Successful");
      navigate("/signin");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <main className="flex items-center text-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit}>
          <h1 className="h3 mb-3 fw-normal">Create new Password</h1>

          <div className="form-floating">
            <input type="password" className="form-control" id="floatingInput" placeholder="Password" name="password" required />
            <label htmlFor="floatingPassword">Password</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="floatingInput" placeholder="Confirm Password" name="confirm_password" required />
            <label htmlFor="floatingPassword">Confirm password</label>
          </div>

          <button className="btn btn-primary w-100 py-2" type="submit">Submit</button>
          
        </form>
        <div className="container-fluid text-center mt-3">
        <p className="mt-5 mb-3 text-body-secondary">&copy; 2017–2024</p>
        </div>
      </div>
      
    </main>
  );
}