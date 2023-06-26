const cityInput = document.querySelector(".city-input");
const goButton = document.querySelector(".go-btn");
const locationButton = document.querySelector(".current-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherForecastDiv = document.querySelector(".days");

const API_KEY = "887a3952a861b7b67a4a5f7fd5b6f061"; //API key for OpenWeatherMap API

const createWeatherForecast = (cityName, weatherItem, index) => {
    if(index === 0) { //HTML for the main forecast
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</h4> 
                    <h4>Wind: ${(weatherItem.wind.speed * 2.23694).toFixed(2)} mph</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else { //HTML for the 5 days forecast
        return `<li class="daily-forecast">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather icon">
                <h4>Temp: ${((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(2)}°F</h4> 
                <h4>Wind: ${(weatherItem.wind.speed * 2.23694).toFixed(2)} mph</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

        //used to filter the weather forecasts to get only 1 forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //to clear the previous weather forecast search
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherForecastDiv.innerHTML = "";

        //to create weather forecast & add them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherForecast(cityName, weatherItem, index));
            } else {
                weatherForecastDiv.insertAdjacentHTML("beforeend", createWeatherForecast(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("An error occurred while fetching the forecast.");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); // to get the entered city or airport and ignore extra spaces
    if(!cityName) return; //return if the field is empty
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert("No coordinates found for ${cityName}");
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates.");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; //Get coordinates of user location
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            //Get current city name from coordinates using REVERSE GEOCODING API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city.");
            });
        },
        error => { //Show this alert if user denied the location permission
            if(error.code === error.PERMISSION_DENIED) {
                alert("Current location request denied. Please reset location permission to gain access.");
            }
        }
    );
}

goButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());