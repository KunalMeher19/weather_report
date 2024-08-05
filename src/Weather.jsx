import React, { useState, useEffect, useRef } from 'react';
import './Weather.css';
import weatherIMG from './assests/weather.png'

const api = {
  key: "8517a462857cb6e5841c6f792d2ccaa7",
  base: "https://api.openweathermap.org/data/2.5/",
  geocoding: "http://api.openweathermap.org/geo/1.0/direct"
};

const Weather = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (query.length > 2) {
      fetch(`${api.geocoding}?q=${query}&limit=5&appid=${api.key}`)
        .then(res => res.json())
        .then(result => {
          const validCities = result.filter(city => city.name);
          setSuggestions(validCities);
        })
        .catch(err => {
          console.error(err);
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const search = (city) => {
    setLoading(true);
    setError('');
    fetch(`${api.base}weather?q=${city}&units=metric&appid=${api.key}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('City not found');
        }
        return res.json();
      })
      .then((result) => {
        setWeather(result);
        setQuery('');
        setSuggestions([]);
        setLoading(false);
        console.log(result);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
        console.error(error);
      });
  };

  const handleKeyPress = (evt) => {
    if (evt.key === "Enter") {
      search(query);
    }
  };

  const handleClickOutside = (event) => {
    if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dateBuilder = (d) => {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    let day = days[d.getDay()];
    let date = d.getDate();
    let month = d.getMonth();
    let year = d.getFullYear();

    return `${day} ${date} ${months[month]} ${year}`;
  };

  let className = 'app';
  if (typeof weather.main !== "undefined") {
    if (weather.main.temp <= 16) {
      className = "app-cold";
    } else if (weather.main.temp > 16 && weather.main.temp <= 30) {
      className = "app-cloud";
    } else {
      className = "app-sunny";
    }
  }

  return (
    <div className={className}>
      <main>
        <div className="search-box" ref={searchBoxRef}>
          <input
            type='text'
            placeholder='Search...'
            className='search-bar'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {suggestions.length > 0 && (
            <div className="suggestions-box">
              {suggestions.map((item, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => search(item.name)}
                >
                  {item.name}, {item.country}
                </div>
              ))}
            </div>
          )}
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : typeof weather.main !== "undefined" ? (
          <div>
            <div className="location-box">
              <div className="location">
                {weather.name}, {weather.sys.country}
              </div>
              <div className="date">
                {dateBuilder(new Date())}
              </div>
              <div className="weather-box">
                <div className="temp">
                  {Math.round(weather.main.temp)}°C
                </div>
                <div className="weather">
                  {weather.weather[0].main}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="welcome-message">
            <h1>Welcome to the Weather App</h1>
            <br/>
            <br/>
            <div className="illustration">
              <img src={weatherIMG} alt="Weather illustration" />
            </div>
            <br/>
            <p>Get the latest weather updates for any city in the world.</p>
            <p>Start by typing the name of a city in the search bar above.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Weather;
