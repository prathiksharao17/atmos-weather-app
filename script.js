
// ==============================
// ATMOS - WEATHER APP
// ==============================


// ==============================
// HTML ELEMENTS
// ==============================

const cityName = document.getElementById("city");
const statusText = document.getElementById("status");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const locationButton = document.getElementById("location-button");
const message = document.getElementById("message");
const forecastContainer = document.getElementById("forecast");
const weatherCard = document.querySelector(".weather-card");

// Temperature toggle elements
const celsiusButton = document.getElementById("celsius-button");
const fahrenheitButton = document.getElementById("fahrenheit-button");
const temperatureUnit = document.getElementById("temperature-unit");

// Store selected temperature unit and latest weather data
let selectedUnit = "C";
let currentWeatherData = null;


// ==============================
// WEATHER DESCRIPTIONS & ICONS
// ==============================

function getWeatherInfo(code) {
    const weatherConditions = {
        0: { description: "Clear sky", icon: "☀️" },
        1: { description: "Mainly clear", icon: "🌤️" },
        2: { description: "Partly cloudy", icon: "⛅" },
        3: { description: "Overcast", icon: "☁️" },

        45: { description: "Foggy", icon: "🌫️" },
        48: { description: "Rime fog", icon: "🌫️" },

        51: { description: "Light drizzle", icon: "🌦️" },
        53: { description: "Moderate drizzle", icon: "🌦️" },
        55: { description: "Dense drizzle", icon: "🌧️" },
        56: { description: "Freezing drizzle", icon: "🌧️" },
        57: { description: "Dense freezing drizzle", icon: "🌧️" },

        61: { description: "Slight rain", icon: "🌧️" },
        63: { description: "Moderate rain", icon: "🌧️" },
        65: { description: "Heavy rain", icon: "🌧️" },
        66: { description: "Light freezing rain", icon: "🌧️" },
        67: { description: "Heavy freezing rain", icon: "🌧️" },

        71: { description: "Slight snow", icon: "🌨️" },
        73: { description: "Moderate snow", icon: "🌨️" },
        75: { description: "Heavy snow", icon: "❄️" },
        77: { description: "Snow grains", icon: "❄️" },

        80: { description: "Slight rain showers", icon: "🌦️" },
        81: { description: "Moderate rain showers", icon: "🌧️" },
        82: { description: "Violent rain showers", icon: "🌧️" },

        85: { description: "Slight snow showers", icon: "🌨️" },
        86: { description: "Heavy snow showers", icon: "❄️" },

        95: { description: "Thunderstorm", icon: "⛈️" },
        96: { description: "Thunderstorm with slight hail", icon: "⛈️" },
        99: { description: "Thunderstorm with heavy hail", icon: "⛈️" }
    };

    return weatherConditions[code] || {
        description: "Unknown conditions",
        icon: "🌡️"
    };
}


// ==============================
// TEMPERATURE CONVERSION
// ==============================

function convertTemperature(celsius) {
    if (selectedUnit === "F") {
        return (celsius * 9 / 5) + 32;
    }

    return celsius;
}

function formatTemperature(celsius) {
    return `${Math.round(convertTemperature(celsius))}°`;
}

function updateTemperatureDisplay() {
    if (!currentWeatherData) return;

    const { current, daily } = currentWeatherData;

    temperature.textContent = formatTemperature(
        current.temperature_2m
    );

    temperatureUnit.textContent =
        selectedUnit === "C" ? "CELSIUS" : "FAHRENHEIT";

    celsiusButton.classList.toggle("active", selectedUnit === "C");
    fahrenheitButton.classList.toggle("active", selectedUnit === "F");

    celsiusButton.setAttribute(
        "aria-pressed",
        String(selectedUnit === "C")
    );

    fahrenheitButton.setAttribute(
        "aria-pressed",
        String(selectedUnit === "F")
    );

    displayForecast(daily);
}


// ==============================
// DYNAMIC WEATHER ILLUSTRATION
// ==============================

function updateWeatherIllustration(code) {
    if (!weatherCard) return;

    const weatherClasses = [
        "weather-clear",
        "weather-cloudy",
        "weather-rain",
        "weather-snow",
        "weather-thunder",
        "weather-fog"
    ];

    // Remove previous weather theme
    weatherCard.classList.remove(...weatherClasses);

    // Apply theme based on weather code
    if (code === 0 || code === 1) {
        weatherCard.classList.add("weather-clear");
    } else if (code === 2 || code === 3) {
        weatherCard.classList.add("weather-cloudy");
    } else if (code === 45 || code === 48) {
        weatherCard.classList.add("weather-fog");
    } else if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82)
    ) {
        weatherCard.classList.add("weather-rain");
    } else if (
        (code >= 71 && code <= 77) ||
        code === 85 ||
        code === 86
    ) {
        weatherCard.classList.add("weather-snow");
    } else if (code >= 95 && code <= 99) {
        weatherCard.classList.add("weather-thunder");
    } else {
        weatherCard.classList.add("weather-cloudy");
    }
}


// ==============================
// FETCH WEATHER DATA
// ==============================

async function getWeather(latitude, longitude, locationName) {
    message.textContent = "Loading weather...";
    statusText.textContent = "Fetching weather...";

    forecastContainer.innerHTML =
        '<p class="forecast-loading">Loading forecast...</p>';

    const apiURL = new URL(
        "https://api.open-meteo.com/v1/forecast"
    );

    apiURL.search = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current:
            "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        daily:
            "weather_code,temperature_2m_max,temperature_2m_min",
        forecast_days: "5",
        timezone: "auto"
    });

    try {
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Unable to fetch weather data");
        }

        const data = await response.json();

        if (!data.current || !data.daily) {
            throw new Error("Weather data is unavailable");
        }

        const current = data.current;

        // Update location name
        cityName.textContent = locationName;

        // Update current weather condition
        statusText.textContent =
            getWeatherInfo(current.weather_code).description;

        // Save weather data for temperature conversion
        currentWeatherData = {
            current: current,
            daily: data.daily
        };

        // Update temperature and forecast
        updateTemperatureDisplay();

        // Update humidity
        humidity.textContent =
            `${current.relative_humidity_2m}%`;

        // Update wind speed
        wind.textContent =
            `${current.wind_speed_10m} km/h`;

        // Update weather illustration
        updateWeatherIllustration(current.weather_code);

        // Clear loading message
        message.textContent = "";

    } catch (error) {
        console.error("Weather error:", error);

        statusText.textContent = "Unable to load weather.";

        message.textContent =
            "Please check your connection and try again.";

        forecastContainer.innerHTML =
            '<p class="forecast-loading">Forecast unavailable.</p>';
    }
}


// ==============================
// SEARCH FOR A CITY
// ==============================

async function searchCity(city) {
    const searchTerm = city.trim();

    if (searchTerm === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Searching for city...";
    statusText.textContent = "Searching...";

    const searchURL = new URL(
        "https://geocoding-api.open-meteo.com/v1/search"
    );

    searchURL.search = new URLSearchParams({
        name: searchTerm,
        count: "1",
        language: "en",
        format: "json"
    });

    try {
        const response = await fetch(searchURL);

        if (!response.ok) {
            throw new Error("City search failed");
        }

        const data = await response.json();

        // Check whether the city exists
        if (!data.results || data.results.length === 0) {
            statusText.textContent = "City not found.";
            message.textContent =
                "Check the spelling or try another city.";
            return;
        }

        // Get first matching location
        const location = data.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Build readable location name
        const locationName = [
            location.name,
            location.admin1,
            location.country
        ]
            .filter((value, index, array) =>
                value && array.indexOf(value) === index
            )
            .join(", ");

        // Fetch weather for the selected city
        await getWeather(
            latitude,
            longitude,
            locationName
        );

    } catch (error) {
        console.error("Search error:", error);

        statusText.textContent = "Search failed.";
        message.textContent =
            "Something went wrong. Please try again.";
    }
}


// ==============================
// DISPLAY 5-DAY FORECAST
// ==============================

function displayForecast(daily) {
    forecastContainer.innerHTML = "";

    daily.time.forEach((date, index) => {
        const weatherInfo =
            getWeatherInfo(daily.weather_code[index]);

        // Format day name
        const dayName = index === 0
            ? "Today"
            : new Date(`${date}T12:00:00`).toLocaleDateString(
                "en-US",
                { weekday: "short" }
            );

        // Create forecast card
        const forecastCard = document.createElement("article");
        forecastCard.className = "forecast-day";

        // Day
        const day = document.createElement("p");
        day.className = "forecast-day-name";
        day.textContent = dayName;

        // Weather icon
        const icon = document.createElement("span");
        icon.className = "forecast-icon";
        icon.textContent = weatherInfo.icon;
        icon.title = weatherInfo.description;

        // Maximum temperature
        const high = document.createElement("strong");
        high.className = "forecast-high";
        high.textContent =
            formatTemperature(daily.temperature_2m_max[index]);

        // Minimum temperature
        const low = document.createElement("span");
        low.className = "forecast-low";
        low.textContent =
            formatTemperature(daily.temperature_2m_min[index]);

        // Add elements to forecast card
        forecastCard.append(day, icon, high, low);

        // Add card to forecast section
        forecastContainer.appendChild(forecastCard);
    });
}


// ==============================
// REVERSE GEOCODING
// GET PLACE NAME FROM COORDINATES
// ==============================

async function getLocationName(latitude, longitude) {
    const url = new URL(
        "https://api.bigdatacloud.net/data/reverse-geocode-client"
    );

    url.search = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        localityLanguage: "en"
    });

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to find location name");
        }

        const data = await response.json();

        // Different areas may return different locality fields
        const locality =
            data.city ||
            data.locality ||
            data.localityInfo?.administrative?.[2]?.name;

        const locationName = [
            locality,
            data.principalSubdivision,
            data.countryName
        ]
            .filter((value, index, array) =>
                value && array.indexOf(value) === index
            )
            .join(", ");

        return locationName || "Your current location";

    } catch (error) {
        console.error("Reverse geocoding error:", error);

        // Weather can still be shown even if place lookup fails
        return "Your current location";
    }
}


// ==============================
// CURRENT LOCATION
// ==============================

function getCurrentLocation() {
    if (!navigator.geolocation) {
        message.textContent =
            "Geolocation is not supported by this browser.";
        return;
    }

    message.textContent = "Finding your location...";

    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            message.textContent = "Getting your local weather...";

            // Convert coordinates into a readable place name
            const locationName = await getLocationName(
                latitude,
                longitude
            );

            // Fetch weather using the exact coordinates
            await getWeather(
                latitude,
                longitude,
                locationName
            );
        },

        function (error) {
            console.error("Location error:", error);

            if (error.code === error.PERMISSION_DENIED) {
                message.textContent =
                    "Location permission denied. Please allow location access or search for a city.";
            } else if (error.code === error.TIMEOUT) {
                message.textContent =
                    "Location request timed out. Please try again.";
            } else {
                message.textContent =
                    "Unable to get your location. Search for a city instead.";
            }
        },

        {
            enableHighAccuracy: false,
            timeout: 10000
        }
    );
}


// ==============================
// SEARCH FORM EVENT
// ==============================

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    searchCity(city);
});


// ==============================
// TEMPERATURE TOGGLE EVENTS
// ==============================

celsiusButton.addEventListener("click", function () {
    selectedUnit = "C";
    updateTemperatureDisplay();
});

fahrenheitButton.addEventListener("click", function () {
    selectedUnit = "F";
    updateTemperatureDisplay();
});


// ==============================
// CURRENT LOCATION BUTTON
// ==============================

locationButton.addEventListener(
    "click",
    getCurrentLocation
);


// ==============================
// DEFAULT WEATHER
// ==============================

// Bengaluru coordinates
getWeather(
    12.9716,
    77.5946,
    "Bengaluru, India"
);
