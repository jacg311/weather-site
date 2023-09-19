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
};

/**
 * Get the current weather, or if apikey isnt filled, sample data
 */
async function requestWeather() {
    let city = document.getElementById("location").value;

    // if input field has no value, try to use the actual location instead.
    if (!city && apiKey) {
        navigator.geolocation.getCurrentPosition(
            posData => getWeatherData({ coords: posData.coords }),
            error => showError(error.message)
        )
    }
    else {
        getWeatherData({ cityName: city});
    }
}

/**
 * get the weather data, and display it to the user
 * @param {string} city the name of the city, defaults to empty
 * @param {GeolocationCoordinates} coords the coordinates to look up the weather for
 */
async function getWeatherData({ cityName = "", coords = undefined } = {}) {

    if (!apiKey) { // pick random sample if apiKey isnt filled
        const samples = ["berlin", "düsseldorf", "london", "seattle"];
        cityName = samples[Math.floor(Math.random() * samples.length)];
    }

    // if apikey isnt filled: pick sample data.
    // else if cityName is filled: request via name
    // else: request by coords
    let url = !apiKey ? `../sample/data/${cityName}.json`
                        : cityName ? `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&lang=de&appid=${apiKey}`
                        : `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.latitude}&lon=${coords.longitude}&units=metric&lang=de&appid=${apiKey}`;

    let response = await fetch(url);

    let data = await response.json();

    // fill error text when an error occurs
    if (!response.ok) {
        showError(`${response.status} ${data["message"]}`);
        return;
    }

    // set the location name to make it clear what city the weather is for
    if (cityName) {
        setLocationName(toTitleCase(cityName))
    } else {
        setLocationName("Your Location")
    }

    // reset the weather data
    let container = document.getElementById("weather_data_container");
    container.replaceChildren();

    // container for holding weather data ordered by date
    let weatherEntries = {};

    data.list.forEach(listEntry => {
        let weatherData = formatWeatherData(listEntry);
        let entry = weatherEntries[weatherData.date];
        if (!entry) {
            weatherEntries[weatherData.date] = [];
        }
        weatherEntries[weatherData.date].push(weatherData);
    });

    // go over all days and add a panel for each one
    Object.keys(weatherEntries).forEach(e => {
        let weatherEntry = weatherEntries[e];

        let dayEntry = document.createElement("div");
        dayEntry.classList.add("day_entry");
        dayEntry.innerHTML = `
        <div class="entry_header">
            <div class="center_title">
                <img width="50" height="50" src="https://openweathermap.org/img/wn/${weatherEntry[0].icon}@2x.png">
                ${e}<br>
            </div>
            <hr>
        </div>
        <div style="display: flex;">
            <div class="avg_day_data">
                <table>
                    <tr>
                        <td>Temperatur</td>
                        <td>${findMinMax(weatherEntry.map(elem => elem.temperature))}°C</td>
                    </tr>
                    <tr>
                        <td>Gefühlt</td>
                        <td>${findMinMax(weatherEntry.map(elem => elem.tempFeelsLike))}°C</td>
                    </tr>
                    <tr>
                        <td>Luftfeuch.</td>
                        <td>${findMinMax(weatherEntry.map(elem => elem.humidity))}%</td>
                    </tr>
                    <tr>
                        <td>Luftdruck</td>
                        <td>${findMinMax(weatherEntry.map(elem => elem.pressure))} hPa</td>
                    </tr>
                </table>
            </div>
            <div class="avg_day_data">
                <table>
                    <tr>
                        <td>Bewölkung</td>
                        <td>${findMinMax(weatherEntry.map(elem => elem.cloudiness))}%</td>
                    </tr>
                    <tr>
                        <td>Regenwahrscheinl.</td>
                        <td>${findMinMax(weatherEntry.map(elem => (elem.rainPercentage * 100).toFixed(0)))}%</td>
                    </tr>
                    <tr>
                        <td>Windgeschw.</td>
                        <td>${findMinMax(weatherEntry.map(elem => elem.windSpeed))} m/s</td>
                    </tr>
                    <tr>
                    <td>Windrichtung</td>
                    <td>${findMinMax(weatherEntry.map(elem => elem.windDirection))}°</td>
                </tr>
                </table>
            </div>
        </div>`;
        // append element and listen for clicks to show the detailed entries
        container.appendChild(dayEntry).addEventListener('click', (event) => toggleDetailedEntries(dayEntry));;
        
        let detailedEntries = document.createElement("div");
        detailedEntries.classList.add("detailed_entries", "hide")
        weatherEntry.forEach(elem => {
            detailedEntries.innerHTML += generateDetailedEntries(elem);
        });
        container.appendChild(detailedEntries)
    });
}

// generate a detailed entry with the given data
function generateDetailedEntries(weatherData) {
    return `<div class="weather_entry">
                <div class="entry_header">
                    <div class="center_title">
                        <img width="50" height="50" src="https://openweathermap.org/img/wn/${weatherData.icon}@2x.png">
                        ${weatherData.time}
                    </div>
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
                        <td>Regenwahr.</td>
                        <td class="entry_value">${(weatherData.rainPercentage * 100).toFixed(0)}%</td>
                    </tr>
                    <tr>
                        <td>Bewölkung</td>
                        <td>${weatherData.cloudiness}%</td>
                    </tr>
                </table>
            </div>
            `;
}

/**
 * convert a string to title case: hello world -> Hello World
 * @param {string} str the string to convert to title case
 */
function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        }
      );
}

/**
 * find the minimum and maximum values in the array and return them as a string
 * in the following format: "min-max" or "min" if they're the same
 * @param {number[]} arr 
 */
function findMinMax(arr) {
    let min = Math.min(...arr);
    let max = Math.max(...arr);
    if (min == max) {
        return min.toString()
    }
    return `${Math.min(...arr)}-${Math.max(...arr)}`
}

/**
 * extract and format data from api response for ease of access
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
        humidity: weatherEntry.main.humidity,
        pressure: weatherEntry.main.grnd_level,
        cloudiness: weatherEntry.clouds.all,
        windSpeed: weatherEntry.wind.speed,
        windDirection: weatherEntry.wind.deg,
        rainPercentage: weatherEntry.pop
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
 * show an error message popup that disappears after a bit
 * @param {string} errorMessage 
 */
function showError(errorMessage) {
    const errorContainer = document.getElementById("error_container");
    let errorElement = document.createElement("div");
    errorElement.innerHTML = `
        <div class="error_log">
            Error!<br>
            ${errorMessage}
        </div>
        <div class="progress_bar"></div>
    `;
    setTimeout(_ => errorElement.remove(), 7 * 1000);
    errorContainer.appendChild(errorElement)
}

function setLocationName(name) {
    const element = document.getElementById("location_name");
    element.style.display = "block";
    element.innerText = name;
}

/**
 * show the detailed entries for the clicked day
 * @param {HTMLDivElement} entry the entry to expand
 */
function toggleDetailedEntries(entry) {
    let sibling = entry.nextSibling;
    sibling.classList.toggle("hide");
}