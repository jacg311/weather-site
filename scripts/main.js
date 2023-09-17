/*import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(10, 3, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x18b507 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;
cube.rotation.x += -1.1;
cube.rotation.z += -0.25;


window.onresize = function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();*/

let apiKey = localStorage.getItem("apiKey");
if (apiKey) {
    document.getElementById("api_key").value = apiKey;
}

export async function getCurrentWeather() {
    // get current weather for city
    let city = document.getElementById("location").value;

    // if there is an api key, request live data, otherwise return sample data
    let response = apiKey
        ? await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=de&appid=${apiKey}`)
        : new Response("{}", {
            status: 512,
            statusText: "test response"
        });

    let data = await response.json();

    // fill error text when an error occurs
    let errorText = document.getElementById("error_text");
    if (!response.ok) {
        errorText.innerText = `An error occured!\n${response.status} ${data["message"]}`;
        errorText.style.display = "block";
        return;
    } else {
        errorText.style.display = "none";
    }

    let container = document.getElementById("weather_data_container");
    container.replaceChildren();

    data["list"].forEach(listEntry => {
        let weatherEntry = document.createElement("div");

        let weatherData = formatWeatherData(listEntry);

        weatherEntry.innerText = "Test";
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

function formatWeatherData(weatherEntry) {
    let date = new Date(weatherEntry.dt * 1000);
    
    return {
        icon: weatherEntry.weather[0].icon,
        time: date.toLocaleTimeString("de-DE"),
        date: date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit"}),
        description: weatherEntry.weather[0].description,
        temperature: weatherEntry.main.temp.toFixed(1),
        tempFeelsLike: weatherEntry.main.feels_like.toFixed(1),
        humidity: weatherEntry.main.humidity
    };
}

export function toggleSettingsPopup(show) {
    let popup = document.getElementById("settings_popup");
    popup.style.display = show ? "block" : "none";
}

export function saveApiKeyInLocalStorage() {
    apiKey = document.getElementById("api_key").value;
    localStorage.setItem("apiKey", apiKey);
}