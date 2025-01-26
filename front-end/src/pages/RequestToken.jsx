import { useState } from "react";

const DOMAIN = 'http://localhost:8000';

export default function RequestToken() {
    const [email, setEmail] = useState("");

    const sendEmail = async (email) => {
    const request = new Request(`${DOMAIN}/request_token`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }), 
        });
    
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        console.error(error);
    }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmail(e.target.email.value);
        const response = await sendEmail(email);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            alert('Email sent successfully!');
        } else {
            alert('Failed to send email.');
        }
    };
    
  return (
    <main className="flex items-center text-center justify-center h-screen">
    <div className="w-full max-w-xs p-6 bg-white rounded-lg shadow-md mb-32 ">
      <h1 className="text-3xl font-bold mb-4">Request Token</h1>
      <p className="text-lg mb-8">
        To request a token, please fill out the form below.
      </p>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="form-floating">
      <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" name="email"/>
      <label htmlFor="floatingInput">Email address</label>
    </div>
    <div className="mt-4">
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold w-full rounded">
            Request Token 
        </button>
    </div>
        
    </form>
    </div>
    </main>
  );
}