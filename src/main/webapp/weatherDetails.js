import { API_KEY } from './apikey.js';

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        lat: params.get('lat'),
        lon: params.get('lon')
    };
}

async function fetchWeatherData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return {
            temp: data.main.temp,
            temp_max: data.main.temp_max,
            temp_min: data.main.temp_min,
            humidity: data.main.humidity,
            desc: data.weather[0].description,
            icon: data.weather[0].icon
        };
    } catch (error) {
        console.error('날씨 정보를 가져오는 중 오류 발생:', error);
        return null;
    }
}

async function displayWeather() {
    const { lat, lon } = getQueryParams();
    if (lat && lon) {
        const weatherData = await fetchWeatherData(lat, lon);
        if (weatherData) {
            updateWeatherInfo(weatherData);
        } else {
            document.getElementById('weatherInfo').innerHTML = '날씨 정보를 가져오는 중 오류 발생';
        }
    } else {
        document.getElementById('weatherInfo').innerHTML = '위치 정보를 가져올 수 없습니다.';
    }
}

function updateWeatherInfo(weatherData) {
    const weatherInfo = document.getElementById("weatherInfo");
    const imgSrc = `https://openweathermap.org/img/w/${weatherData.icon}.png`;

    weatherInfo.innerHTML = `
        <h1>Weather Information</h1>
        <div>
            <strong>온도: ${weatherData.temp.toFixed(0)}°C</strong>
        </div>
        <div>
            <img src="${imgSrc}" alt="Weather Icon" />
        </div>
        <div>
            <p>상태: ${weatherData.desc}</p>
            <p>최고 온도: ${weatherData.temp_max.toFixed(0)}°C</p>
            <p>최저 온도: ${weatherData.temp_min.toFixed(0)}°C</p>
            <p>습도: ${weatherData.humidity}%</p>
        </div>
    `;
}

// 페이지 로드 시 날씨 정보 표시
window.onload = displayWeather;
