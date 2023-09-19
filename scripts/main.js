let apiKey;

/**
 * Get the api key from local storage.
 * Not using the event is too early and throws an error -_-
 */
window.onload = function () {
    apiKey = localStorage.getItem("apiKey");
    if (apiKey) {
        document.getElementById("api_key").value = apiKey;
    }
}

/**
 * Get the current weather, or if apikey isnt filled, sample data
 */
async function requestWeather() {
    let city = document.getElementById("location").value;

    // if input field has no value, try to use the actual location instead.
    if (!city && apiKey) {
        navigator.geolocation.getCurrentPosition(
            posData => getWeatherData(`https://api.openweathermap.org/data/2.5/forecast?lat=${posData.coords.latitude}&lon=${posData.coords.longitude}&units=metric&lang=de&appid=${apiKey}`),
            error => showError(error.message)
        )
    } else if (!city && !apiKey) {
        showError("Kann keine Live-Daten ohne API Schlüssel abfragen.")
    }
    else {
        getWeatherData(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=de&appid=${apiKey}`);
    }
}

/**
 * get the weather via a city name
 * @param {string} name name of the city to get the weather for
 */
async function getWeatherData(url) {
    let response = await fetchResponse(url);

    let data = await response.json();

    // fill error text when an error occurs
    if (!response.ok) {
        showError(`${response.status} ${data["message"]}`);
        return;
    }

    let container = document.getElementById("weather_data_container");
    container.replaceChildren();

    let weatherEntries = {};

    data.list.forEach(listEntry => {

        let weatherData = formatWeatherData(listEntry);

        let entry = weatherEntries[weatherData.date];
        if (!entry) {
            weatherEntries[weatherData.date] = []
        }
        weatherEntries[weatherData.date].push(weatherData);
    });

    Object.keys(weatherEntries).forEach(e => {
        console.log(e);
        console.log(weatherEntries[e]);
    });
}

/*
let weatherEntry = document.createElement("div");
        weatherEntry.classList.add("day_entry");
        weatherEntry.innerHTML = `
            <div class="entry_header">
                <div class="center_title">
                    <img width="50" height="50" src="https://openweathermap.org/img/wn/${weatherData.icon}@2x.png">
                    ${weatherData.date}
                </div>
                ${weatherData.time}
                <hr>
                ${weatherData.description}
            </div>
            <table>
                <tr>
                    <td>Temperatur</td>
                    <td class="entry_value">${weatherData.temperature}°C</td>
                </tr>
                <tr>
                    <td>Gefühlt</td>
                    <td>${weatherData.tempFeelsLike}°C</td>
                </tr>
                <tr>
                    <td>Luftfeuch.</td>
                    <td class="entry_value">${weatherData.humidity}%</td>
                </tr>
            </table>`;
        container.appendChild(weatherEntry);
*/

/**
 * Fetch weather data, or get random sample data
 * @param {string} url the url to fetch
 */
async function fetchResponse(url) {
    const samples = ["berlin", "duesseldorf", "london", "seattle"];
    let i = Math.floor(Math.random() * samples.length);
    return await fetch(apiKey ? url : `../sample/data/${samples[i]}.json`);
}

/**
 * extract and format data from api response
 */
function formatWeatherData(weatherEntry) {
    let date = new Date(weatherEntry.dt * 1000);

    return {
        icon: weatherEntry.weather[0].icon,
        time: date.toLocaleTimeString("de-DE"),
        date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        description: weatherEntry.weather[0].description,
        temperature: weatherEntry.main.temp.toFixed(1),
        tempFeelsLike: weatherEntry.main.feels_like.toFixed(1),
        humidity: weatherEntry.main.humidity
    };
}

/**
 * toggle the settings popup
 * @param {boolean} show wether the popup should be shown or hidden
 */
function toggleSettingsPopup(show) {
    let popup = document.getElementById("settings_popup");
    popup.style.display = show ? "block" : "none";
}

/**
 * saves the api key in local storage
 */
function saveApiKeyInLocalStorage() {
    apiKey = document.getElementById("api_key").value;
    localStorage.setItem("apiKey", apiKey);
}

/**
 * if the key that was pressed is "Enter" search for the weather
 * @param {KeyboardEvent} event 
 */
function triggerSearchOnEnter(event) {
    if (event.key == "Enter") {
        document.getElementById("get_weather_btn").click();
    }
}

/**
 * show an error message on the page
 * @param {string} errorMessage 
 */
function showError(errorMessage) {
    const errorContainer = document.getElementById("error_container");
    let errorElement = document.createElement("div");
    errorElement.innerHTML = `
        <div class="error_log">
            ${errorMessage}
        </div>
        <div class="progress_bar"></div>
    `;
    setTimeout(_ => errorElement.remove(), 10 * 1000);
    errorContainer.appendChild(errorElement)
}

function setLocationName(name) {
    const element = document.getElementById("location_name");
    element.style.display = "block";
    element.innerText = name;
}