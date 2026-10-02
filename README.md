# 🌤️ Atmos — A Weather App Built During My Learning Sprint

**Learning Sprint | Learning by Building | HTML · CSS · JavaScript · REST APIs**

Atmos is a weather application I’m building as part of a personal learning sprint to explore something new through hands-on development. Instead of only reading about APIs and how applications communicate, I wanted to build a small product that uses real external services and understand the complete request-and-response flow.

The project currently lets a user search for a city or use their current location, view current weather conditions, and see a five-day forecast. Along the way, I’m using Atmos to strengthen my understanding of **REST APIs, asynchronous JavaScript, JSON, geocoding, browser geolocation, error handling, and backend system design concepts**.

Website: https://prathiksharao17.github.io/atmos-weather-app/



## 🎯 Why I’m Building This

This sprint is about learning by implementing, debugging, and explaining how a system works—not just getting an application to run.

With Atmos, I’m exploring questions such as:

- How does an application turn a city name into geographic coordinates?
- How does one API response provide the input needed for another API request?
- What is the difference between geocoding and reverse geocoding?
- How can one API request return both current conditions and a multi-day forecast?
- How should an application handle slow responses, invalid locations, and API failures?
- If the project grows, where would a dedicated backend, caching, and a consistent API contract fit?

The goal is to build a working application while gradually moving from frontend implementation toward understanding the **backend flow and high-level design (HLD)** behind it.



## ✨ Current Features

- 🔎 **City search** — search for a location by name.
- 📍 **Current location** — use the browser’s Geolocation API to get coordinates, with the user’s permission.
- 🌡️ **Current weather** — display temperature, humidity, wind speed, and weather condition.
- 📅 **Five-day forecast** — show daily weather conditions and minimum/maximum temperatures.
- 🌡️ **Celsius / Fahrenheit toggle** — switch displayed temperature units using the weather data already retrieved.
- 🌦️ **Weather-aware UI** — update the weather illustration/theme based on the weather code.
- ⚠️ **Loading and error messages** — provide feedback while requests are running or if something goes wrong.



## 🧰 Tech Stack

| Technology / Service | How it is used |
|---|---|
| HTML | Defines the structure of the weather interface |
| CSS | Styles the app, weather card, forecast cards, and responsive layout |
| JavaScript | Handles user input, API requests, response processing, and DOM updates |
| Fetch API | Makes asynchronous HTTP requests to external services |
| `async` / `await` | Makes asynchronous request flows easier to read |
| JSON | Data format used by the APIs |
| Open-Meteo Geocoding API | Converts a searched place name into coordinates and location details |
| Open-Meteo Forecast API | Returns current weather and daily forecast data |
| BigDataCloud Reverse Geocoding API | Converts current-location coordinates into a readable place name |
| Browser Geolocation API | Requests the user’s current coordinates, subject to permission |



## 🗺️ API Request Flow

### At a glance

**When a user searches for a city:**

1. The user enters a city name, such as `Mumbai`.
2. The app sends the name to the **Geocoding API**.
3. The app extracts the returned latitude and longitude.
4. Those coordinates are passed as arguments to `getWeather(latitude, longitude, locationName)`.
5. `getWeather()` sends a request to the **Forecast API**.
6. The response contains current conditions and daily forecast data.
7. The app updates the current-weather fields and creates the forecast cards.

**When a user selects “Use Current Location”:**

1. The browser requests location permission and obtains latitude and longitude.
2. The app sends those coordinates to the **Reverse Geocoding API** to find a readable location name.
3. The app passes the coordinates and location name to `getWeather()`.
4. The **Forecast API** returns current conditions and daily forecast data.
5. The app updates the interface.

> **Important:** Reverse geocoding is not required for a city search because the Geocoding API already returns the place name and location details. It is useful in the current-location flow because the browser provides coordinates rather than a city name.



## 🌐 The Three API Endpoints

### 1. Open-Meteo Geocoding API

**Endpoint**

```text
https://geocoding-api.open-meteo.com/v1/search
```

**Purpose:** Convert a human-readable place name into geographic information, especially latitude and longitude.

**Example request**

```text
https://geocoding-api.open-meteo.com/v1/search?name=Mumbai&count=1&language=en&format=json
```

| Parameter | Purpose |
|---|---|
| `name` | The city or place entered by the user |
| `count` | Maximum number of matching results requested |
| `language` | Preferred language for returned location names |
| `format` | Response format; this project requests JSON |

**Simplified example response**

```json
{
  "results": [
    {
      "name": "Mumbai",
      "latitude": 19.07,
      "longitude": 72.87,
      "country": "India",
      "admin1": "Maharashtra"
    }
  ]
}
```

*The values above are illustrative, not a live API response.*

**How Atmos uses it**

The `searchCity(city)` function:

- trims the user’s input;
- creates the Geocoding API URL and query parameters;
- calls the endpoint using `fetch()`;
- checks whether the response is successful;
- parses the response as JSON;
- checks whether a matching result exists;
- extracts the first result’s `latitude`, `longitude`, and location details;
- passes those values to `getWeather()`.

**Key concept:** Geocoding answers **“Where is this place?”** It does not provide weather data.



### 2. Open-Meteo Forecast API

**Endpoint**

```text
https://api.open-meteo.com/v1/forecast
```

**Purpose:** Retrieve weather data for a geographic location. In Atmos, a single request asks for both current conditions and a five-day daily forecast.

**Example request structure**

```text
https://api.open-meteo.com/v1/forecast
  ?latitude=19.07
  &longitude=72.87
  &current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &forecast_days=5
  &timezone=auto
```

The actual request is assembled in JavaScript using `URL` and `URLSearchParams`.

| Parameter | Purpose |
|---|---|
| `latitude` | Latitude of the selected location |
| `longitude` | Longitude of the selected location |
| `current` | The current-weather fields requested |
| `daily` | The daily forecast fields requested |
| `forecast_days=5` | Requests five days of daily forecast data |
| `timezone=auto` | Lets the API use the location’s time zone |

**Current-weather fields used**

| Field | Meaning | Displayed in Atmos as |
|---|---|---|
| `temperature_2m` | Temperature at 2 metres | Current temperature |
| `relative_humidity_2m` | Relative humidity at 2 metres | Humidity percentage |
| `wind_speed_10m` | Wind speed at 10 metres | Wind speed |
| `weather_code` | WMO weather interpretation code | Weather description and illustration |

**Daily forecast fields used**

| Field | Meaning |
|---|---|
| `time` | Date for each daily forecast entry |
| `weather_code` | Weather condition code for that day |
| `temperature_2m_max` | Forecast maximum temperature |
| `temperature_2m_min` | Forecast minimum temperature |

**Simplified example response**

```json
{
  "current": {
    "temperature_2m": 29,
    "relative_humidity_2m": 70,
    "wind_speed_10m": 12,
    "weather_code": 2
  },
  "daily": {
    "time": [
      "2026-10-02",
      "2026-10-03",
      "2026-10-04",
      "2026-10-05",
      "2026-10-06"
    ],
    "temperature_2m_max": [30, 31, 29, 28, 30],
    "temperature_2m_min": [24, 25, 23, 22, 24],
    "weather_code": [2, 61, 3, 2, 0]
  }
}
```

*This is a shortened illustrative response. Actual values depend on the requested coordinates and time.*

**How Atmos uses it**

The `getWeather(latitude, longitude, locationName)` function:

1. displays loading feedback;
2. constructs the Forecast API URL with the coordinates and requested fields;
3. calls the API using `fetch()`;
4. checks the HTTP response status;
5. parses the JSON response;
6. verifies that `current` and `daily` data are present;
7. updates the city and current weather condition;
8. stores the current and daily data in `currentWeatherData`;
9. calls `updateTemperatureDisplay()` to show the current temperature and forecast;
10. updates humidity, wind speed, and the weather illustration;
11. clears the loading message.

The `displayForecast(daily)` function loops through the daily data and creates a forecast card for each date. It uses the weather code to select a description and icon, and formats the maximum and minimum temperatures.

**Why one endpoint is enough here:** the Forecast API supports both `current` and `daily` parameters in the same request. Atmos therefore does not need a separate endpoint just to retrieve the current temperature.

---

### 3. BigDataCloud Reverse Geocoding API

**Endpoint**

```text
https://api.bigdatacloud.net/data/reverse-geocode-client
```

**Purpose:** Convert latitude and longitude into a human-readable place name.

**Example request**

```text
https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=12.9716&longitude=77.5946&localityLanguage=en
```

| Parameter | Purpose |
|---|---|
| `latitude` | Latitude received from the browser’s Geolocation API |
| `longitude` | Longitude received from the browser’s Geolocation API |
| `localityLanguage` | Preferred language for the locality name |

**Simplified example response**

```json
{
  "city": "Bengaluru",
  "locality": "Bengaluru",
  "principalSubdivision": "Karnataka",
  "countryName": "India"
}
```

*The response fields and values can vary by location; this is an illustrative example.*

**How Atmos uses it**

The `getCurrentLocation()` function uses the browser’s `navigator.geolocation.getCurrentPosition()` method to obtain coordinates after the user grants permission.

Then:

- `getLocationName(latitude, longitude)` sends the coordinates to BigDataCloud;
- the response is parsed as JSON;
- the app checks available locality fields to build a readable name;
- that name and the original coordinates are passed to `getWeather()`.

If reverse geocoding fails, the app can still request weather using the coordinates and display a fallback such as `Your current location`.

**Key concept:** Reverse geocoding answers **“What place is at these coordinates?”** It does not provide weather data.


## 🔁 How Data Moves Between the Functions

For a city search, the main flow in the current JavaScript implementation is:

```text
User enters a city
       |
       v
searchCity(city)
       |
       v
Geocoding API request
       |
       v
Geocoding API JSON response
       |
       v
Extract data.results[0]
       |
       +--> latitude
       |
       +--> longitude
       |
       +--> location name
       |
       v
getWeather(latitude, longitude, locationName)
       |
       v
Forecast API request
       |
       v
Forecast API JSON response
       |
       +--> data.current
       |       |
       |       +--> temperature
       |       +--> humidity
       |       +--> wind speed
       |       +--> weather code
       |
       +--> data.daily
               |
               +--> dates
               +--> daily weather codes
               +--> maximum temperatures
               +--> minimum temperatures
       |
       v
Update the page and render forecast cards
```

The coordinate values are passed **inside the application as function arguments**. The Forecast API does not automatically receive the Geocoding API’s response; JavaScript extracts the required fields and explicitly uses them to construct the next request.

For current location, the flow starts with browser-provided coordinates:

```text
User clicks "Use Current Location"
       |
       v
Browser Geolocation API
       |
       v
Latitude + Longitude
       |
       +---------------------------+
       |                           |
       v                           v
Reverse Geocoding API         Forecast API
       |                           |
       v                           v
Readable place name           Current + daily data
       |                           |
       +-------------+-------------+
                     |
                     v
               Update Atmos UI
```

In the current code, the reverse-geocoding request is awaited before `getWeather()` is called. Since both requests depend only on the same coordinates, a future version could run them in parallel to reduce waiting time.



## 🧠 Backend Concepts I’m Learning Through Atmos

Although the current version calls the external APIs directly from browser-side JavaScript, the same workflow helps me understand how a dedicated backend could be designed.

### 1. API orchestration

A backend can coordinate multiple external services: call Geocoding when a user searches by city, pass the resulting coordinates to the Forecast API, and combine the useful data into one response for the frontend.

### 2. Asynchronous processing

Network requests take time. `fetch()` returns a Promise, and `async` / `await` lets the app wait for a response without blocking the browser’s main thread.

### 3. Error handling

The app checks HTTP response status, handles missing city results, and catches request errors. This helps prevent a failed external request from silently breaking the user experience.

### 4. Data transformation

External APIs return structured JSON. Atmos extracts only the fields it needs and turns weather codes into readable descriptions and icons before displaying them.


---

## 🛠️ Current Project Structure

A simplified view of the current app:

```text
atmos/
├── index.html       # App structure
├── style.css        # Layout and visual styling
├── script.js        # API requests, logic, and DOM updates
└── README.md        # Project and learning documentation
```

The JavaScript file contains the main functions:

| Function | Responsibility |
|---|---|
| `getWeatherInfo(code)` | Maps weather codes to descriptions and icons |
| `convertTemperature(celsius)` | Converts Celsius to Fahrenheit when selected |
| `formatTemperature(celsius)` | Formats a temperature for display |
| `updateTemperatureDisplay()` | Updates current temperature and forecast units |
| `updateWeatherIllustration(code)` | Changes the weather card’s theme |
| `getWeather(latitude, longitude, locationName)` | Requests and displays current weather and daily forecast |
| `searchCity(city)` | Geocodes a searched city and passes its coordinates to `getWeather()` |
| `displayForecast(daily)` | Builds the daily forecast cards |
| `getLocationName(latitude, longitude)` | Reverse-geocodes coordinates into a readable place name |
| `getCurrentLocation()` | Gets browser coordinates and starts the current-location flow |



## 🚀 Learning Sprint: What I’m Exploring Next

I’m using this project as a foundation to move from frontend API consumption toward backend development and HLD.

- [x] Build the weather interface using HTML and CSS.
- [x] Use JavaScript to handle user interactions.
- [x] Integrate the Geocoding API for city search.
- [x] Integrate the Forecast API for current conditions and daily forecast.
- [x] Use browser geolocation and reverse geocoding for current location.
- [x] Handle loading states and common request failures.
- [ ] Build a dedicated backend API for Atmos.
- [ ] Define a consistent JSON response contract for the frontend.
- [ ] Add caching and decide on an appropriate cache expiration strategy.
- [ ] Explore rate limiting, validation, and more robust error handling.
- [ ] Review the system for scalability, reliability, and maintainability.



## 💡 Key Takeaways

- **Geocoding** converts a place name into coordinates.
- **Reverse geocoding** converts coordinates into a readable place name.
- **Forecast** uses coordinates to return weather data, including current conditions and daily forecasts.
- Coordinates are extracted from one response and explicitly passed into the next function/API request.
- Independent API calls can potentially run in parallel; dependent calls must wait for the data they need.
- A dedicated backend could centralize API orchestration, caching, validation, and response formatting.

This is a learning project, and I’m documenting not only what I build but also the reasoning behind how each part works.



