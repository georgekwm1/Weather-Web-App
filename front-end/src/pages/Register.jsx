function submitRegisterForm(form) {
  const formFields = {
    first_name: form.firstname.value,
    last_name: form.lastname.value,
    email: form.email.value,
    password: form.password.value,
    confirm_password: form.confirm_password.value,
  };
  return formFields;

}
const DOMAIN = "http://127.0.0.1:8000"

async function formRegister(form) {

  const formData = submitRegisterForm(form)
  const url = `${DOMAIN}/register`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Registration successful", data);
    alert("Registration successful.");
  } catch (error) {
    console.error('Registration failed:', error);
    alert("Registration failed. Please try again.");
  }

};

const Register = () => {
  const handleSubmit = async (event) => {
    event.preventDefault();
    await formRegister(event.target);
  };
  return (
    <main className="flex items-center text-center justify-center h-screen">
      <div className="w-full max-w-xs">
        <form onSubmit={handleSubmit}>
          <h1 className="h3 mb-3 fw-normal">Register</h1>

          <div className="form-floating">
            <input type="text" className="form-control" id="floatingInput" placeholder="First Name" name="firstname" required />
            <label htmlFor="floatingInput">First Name</label>
          </div>
          <div className="form-floating">
            <input type="text" className="form-control" id="floatingInput" placeholder="Last Name" name="lastname" required />
            <label htmlFor="floatingPassword">Last Name</label>
          </div>
          <div className="form-floating">
            <input type="email" className="form-control" id="floatingInput" placeholder="Email address" name="email" required />
            <label htmlFor="floatingInput">Email address</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="floatingInput" placeholder="Password" name="password" required />
            <label htmlFor="floatingPassword">Password</label>
          </div>
          <div className="form-floating">
            <input type="password" className="form-control" id="floatingInput" placeholder="Confirm Password" name="confirm_password" required />
            <label htmlFor="floatingPassword">Confirm password</label>
          </div>

          <button className="btn btn-primary w-100 py-2 ml-0 mt-2" type="submit">Register</button>
          
        </form>
        <div className="container-fluid text-center mt-3">
        <p className="mt-5 mb-3 text-body-secondary">&copy; 2017–2024</p>
        </div>
      </div>
      
    </main>
  );
};

export default Register;