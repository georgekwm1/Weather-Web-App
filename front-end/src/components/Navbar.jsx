import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isActiveHome, setIsActiveHome] = useState(false);
    const [isActiveRegister, setIsActiveRegister] = useState(false);
    const [isActiveSignIn, setIsActiveeSignIn] = useState(false);

    const handleActiveHome = () => {
        setIsActiveHome(true);
        setIsActiveRegister(false);
        setIsActiveeSignIn(false);
    };
    const handleActiveRegister = () => {
        setIsActiveHome(false);
        setIsActiveRegister(true);
        setIsActiveeSignIn(false);
    };
    const handleActiveSignIn = () => {
        setIsActiveHome(false);
        setIsActiveRegister(false);
        setIsActiveeSignIn(true);
    };
  return (
    <nav className="navbar navbar-main navbar-expand-lg px-0 mx-4 navbar-light bg-gray-300 shadow-none position-sticky top-0 z-index-sticky">
      <div className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
        <header className="mb-auto">
          <div>
            <nav className="nav nav-masthead justify-content-center positon-fixed top-0">
              <li
                className={`nav-link fw-bold py-1 px-0 ${isActiveHome ? "active" : ""}`}
                aria-current="page"
              >
                <Link to="/" onClick={handleActiveHome} className="no-underline hover:underline">Home</Link>
                {/* <a href="/">Home</a> */}
              </li>
              <li className={`nav-link fw-bold py-1 px-0 ${isActiveRegister ? "active" : ""}`}>
                <Link to="/register" onClick={handleActiveRegister} className="no-underline hover:underline">Register</Link>
              </li>
              <li className={`nav-link fw-bold py-1 px-0 ${isActiveSignIn ? "active" : ""}`}>
                <Link to="/signin" onClick={handleActiveSignIn} className="no-underline hover:underline">Sign In</Link>
              </li>
            </nav>
          </div>
        </header>
      </div>
    </nav>
  );
};

export default Navbar;
