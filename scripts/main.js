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
    if (!city) {
        navigator.geolocation.getCurrentPosition(
            posData => {getWeatherData(`https://api.openweathermap.org/data/2.5/forecast?lat=${posData.coords.latitude}&lon=${posData.coords.longitude}&units=metric&lang=de&appid=${apiKey}`)
            console.log(posData.coords)},
            error => showError(error.message)
        )
    } else {
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
    let errorText = document.getElementById("error_text");
    if (!response.ok) {
        showError(`${response.status} ${data["message"]}`);
        return;
    } else {
        hideError();
    }

    let container = document.getElementById("weather_data_container");
    container.replaceChildren();

    let weatherEntries = {};

    data.list.forEach(listEntry => {
        let weatherEntry = document.createElement("div");

        let weatherData = formatWeatherData(listEntry);

        weatherEntry.classList.add("weather_entry");
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
            <span class="left_text"></span>
            <span></span>
            <table>
                <tr>
                    
                </tr>
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
            </table>
        `
        container.appendChild(weatherEntry);
    });



}

/**
 * Fetch weather data, or get random sample data
 * @param {string} url the url to fetch
 */
async function fetchResponse(url) {
    const samples = ["berlin", "duesseldorf", "london", "seattle"];
    return fetch(apiKey ? url : `./sample/data/${samples[Math.random() * samples.length]}.json`)
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
    let errorText = document.getElementById("error_text");
    errorText.innerText = `Ein Fehler ist passiert!\n${errorMessage}`;
    errorText.style.display = "block";
}

/**
 * hide the error text
 */
function hideError() {
    let errorText = document.getElementById("error_text");
    errorText.style.display = "none";
}