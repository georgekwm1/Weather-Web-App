import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function submitLocationForm(form) {
    const formFields = {
      longitude: form.longitude.value,
      latitude: form.latitude.value,
      zip_code: form.zip_code.value,
      city_name: form.city_name.value,
      country_code: form.country_code.value,
      state_code: form.state_code.value,
    };
    return formFields;
  
  }
  const DOMAIN = "http://127.0.0.1:8000"
  
  async function formLocation(form, id) {
    const checkAccessToken = async () => {
          let accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
              const { access } = await refreshAccessToken();
              accessToken = access;
              if (!accessToken) {
                  console.log("No session found. Login first");
                  navigate("/signin");
                  return null;
              }
          }
          return accessToken;
        };
    
    const formData = submitLocationForm(form)
    const url = `${DOMAIN}/update_location/${id}`;
    try {
        const accessToken = await checkAccessToken();
        const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({location:{
            coordinates: {longitude: formData.longitude, 
                latitude: formData.latitude},
            zip_code: formData.zip_code,
            city_name: formData.city_name,
            country_code: formData.country_code,
            state_code: formData.state_code,
            },
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Location Data", data);
      return data;
    } catch (error) {
      console.error('Failed to fetch location data:', error);
      alert("Failed to fetch location data");
      return null;
    }
  
  };
  
  const UpdateGeoWeather = () => {
    const { queryId } = useParams();
    const [icon, setIcon] = useState("");
    const [weather, setWeather] = useState("");
    const [temperature, setTemperature] = useState("");
    const [locationName, setLocationName] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (event) => {
      event.preventDefault();
      
      const data = await formLocation(event.target, queryId);
      setIcon(`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`); // Replace with the actual icon URL
        setWeather(data.weather[0].description); // Replace with the actual weather description
        setTemperature(data.main.temp); // Replace with the actual temperature
        setLocationName(data.name); // Replace with the actual location name
    };
    const returnBack = () => {
      navigate("/dashboard/weatherhistory");
    }
    
    
    return (
      <main className="flex items-center text-center justify-center h-screen">
        <button onClick={returnBack} className="btn btn-primary w-100 py-2 ml-0 mt-2" type="submit">Back</button>
        <div className="w-full max-w-xs">
          <form onSubmit={handleSubmit}>
            <h1 className="h3 mb-3 fw-normal">Register</h1>
  
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingInput" placeholder="Longitude" name="longitude" />
              <label htmlFor="floatingInput">Longitude</label>
            </div>
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingInput" placeholder="Latitude" name="latitude" />
              <label htmlFor="floatingPassword">Latitude</label>
            </div>
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingInput" placeholder="Zip Code" name="zip_code"/>
              <label htmlFor="floatingInput">Zip Code</label>
            </div>
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingInput" placeholder="City Name" name="city_name" />
              <label htmlFor="floatingPassword">City Name</label>
            </div>
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingInput" placeholder="State Code" name="state_code" />
              <label htmlFor="floatingPassword">State Code</label>
            </div>
  
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingInput" placeholder="Country Code" name="country_code" />
              <label htmlFor="floatingPassword">Country Code</label>
            </div>
  
            <button className="btn btn-primary w-100 py-2 ml-0 mt-2" type="submit">Check Information</button>
            
          </form>
          <div className="container-fluid text-center mt-3">
          </div>
          <div className="flex-col">
            <h3 className="h3 mb-3 fw-normal">Weather Information</h3>
            { locationName? (<p>Location: {locationName}</p>): null }
            <div className="flex items-center justify-center">
            { icon? (<img src={icon} alt="Weather Icon" />): null }
            </div>
            { weather? (<p>Weather: {weather}</p>): null }
            { temperature? (<p>Temperature: {temperature}</p>): null}
        </div>
        </div>
        
      </main>
    );
  };
  
  export default UpdateGeoWeather;