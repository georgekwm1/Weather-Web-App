import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { refreshAccessToken } from "../functions/refreshAccessToken";

export default function DashBoard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Get First Name
  
  // Fetch Access Token
  const fetchAccessToken = async (navigate) => {
    let accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      const { access } = await refreshAccessToken();
      accessToken = access;
      if (!accessToken) {
        console.log("No session found. Login first");
        navigate("/signin");
      }
    }
  };



  useEffect(() => {
    const getToken = async () => {
      await fetchAccessToken(navigate);
    };
    getToken();
  }, [navigate]);



  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // const location = useLocation();
  // const showChatRoute = ["/dashboard/chat"];
  // const isChatRoute = showChatRoute.includes(location.pathname);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:translate-x-0 lg:relative w-64 bg-gray-800 text-white z-50`}
      >
        <div className="p-4">
          <h2 className="text-2xl font-semibold justify-center">Chat Dashboard</h2>
        </div>
        <nav>
          <ul className="list-none p-0">
            <li className="hover:bg-gray-700 px-4 py-2">
              <Link to="/" className="text-white no-underline">Home</Link>
            </li>
            <li className="hover:bg-gray-700 px-4 py-2">
              <Link to="/dashboard/weather" className="text-white no-underline">Get Weather</Link>
            </li>
            <li className="hover:bg-gray-700 px-4 py-2">
              <Link to="/dashboard/weatherhistory" className="text-white no-underline">Weather History</Link>
            </li>
            <li className="hover:bg-gray-700 px-4 py-2">
              <Link to="/dashboard/logout" className="text-white no-underline">Logout</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-gray-600 shadow-md flex items-center justify-between px-4 py-3">
          <button
            onClick={toggleSidebar}
            className="text-white no-underline text-gray-600 hover:text-gray-800 focus:outline-none lg:hidden bg-transparent z-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
          <h1 className="text-xl font-semibold">
            {/*isChatRoute ? "Chat" :*/} Welcome to the Dashboard {firstName}
          </h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 bg-gray-600 overflow-y-auto">
          {/* <h2 className="text-2xl font-semibold mb-4"> Dashboard</h2>
          <p className="text-gray-600"> Select an option from the sidebar to get started</p> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}