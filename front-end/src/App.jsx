import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation, useNavigate} from 'react-router-dom'
import Register from './pages/Register'
import SignIn from './pages/SiginIn'
import Home from './pages/Home'
import DashBoard from './pages/Dashboard'
import SignOut from './pages/SignOut'

// import WeatherHistory from './pages/WeatherHistory'
import ChatHistoryPage from './pages/ChatHistory'

import RequestToken from './pages/RequestToken'
import ResetToken from './pages/ResetToken'
import GeoWeather from './pages/GeoWeather'
import UpdateGeoWeather from './pages/UpdateGeoWeather'




function App() {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/dashboard", "/dashboard/logout", 
    "/dashboard/chat",
    "/dashboard/weather",
    "/dashboard/weatherhistory",
    "/dashboard/weatherhistory/update/:queryId",
  ];
  const shouldHideNavbar = hideNavbarRoutes.some(route => 
    new RegExp(`^${route.replace(/:\w+/g, '\\w+')}$`).test(location.pathname)
  );

  return (
    <>
      {!shouldHideNavbar && (
        <div>
          <Navbar />
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />}/>
        <Route path="/request_token" element={<RequestToken />} />
        <Route path="/reset_token/:resetToken" element={<ResetToken />} />
        <Route path="/dashboard" element={<DashBoard />}>
          <Route path="logout" element={<SignOut />} />
          <Route path="weather" element={<GeoWeather />} />
          <Route path="weatherhistory" element={<ChatHistoryPage />} />
          <Route path="weatherhistory/update/:queryId" element={<UpdateGeoWeather />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
