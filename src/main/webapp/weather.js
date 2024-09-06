import { API_KEY, naverMapClientId, naverMapClientSecret } from './apikey.js';

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const address = await getAddress(lat, lon);
            await fetchWeather(lat, lon, address);
        });
    } else {
        document.getElementById("weatherContainer").innerHTML = "Geolocation is not supported by this browser.";
    }
}

async function getAddress(lat, lon) {
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const url = `${corsProxy}https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lon},${lat}&output=json`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-NCP-APIGW-API-KEY-ID': naverMapClientId,
                'X-NCP-APIGW-API-KEY': naverMapClientSecret
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
            return `${data.results[0].region.area1.name} ${data.results[0].region.area2.name} ${data.results[0].region.area3.name}`;
        } else {
            throw new Error("주소 정보를 가져올 수 없습니다.");
        }
    } catch (error) {
        console.error("Error fetching the address: ", error);
        return "주소 정보를 가져오는 중 오류가 발생했습니다.";
    }
}

async function fetchWeather(lat, lon, address) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        );
        const json = await response.json();

        displayCurrentWeather(json.list[0], address);
        displayHourlyForecast(json.list.slice(0, 8));
        displayWeeklyForecast(json.list);
    } catch (error) {
        console.log('날씨 예보 정보를 가져오는데 실패했습니다', error);
    }
}

function displayCurrentWeather(currentWeather, address) {
    document.getElementById("cityName").textContent = address;
    document.getElementById("currentTemp").innerHTML = `${Math.round(currentWeather.main.temp)}°C`;
    document.getElementById("weatherDescription").textContent = currentWeather.weather[0].description;
    document.getElementById("highLowTemp").textContent = `최고: ${Math.round(currentWeather.main.temp_max)}°C 최저: ${Math.round(currentWeather.main.temp_min)}°C`;
    document.getElementById("humidity").innerHTML = `습도: ${currentWeather.main.humidity}%`;
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecast = document.getElementById("hourlyForecast");
    hourlyForecast.innerHTML = '<h2>시간별 예보</h2>';

    hourlyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        hourlyForecast.innerHTML += `
            <div class="hourly-item">
                <span>${hour}시</span>
                <img src="${iconUrl}" alt="Weather Icon">
                <span>${Math.round(item.main.temp)}°C</span>
            </div>
        `;
    });
}

function displayWeeklyForecast(fullData) {
    const weeklyForecast = document.getElementById("weeklyForecast");
    weeklyForecast.innerHTML = '<h2>주간 예보</h2>';

    const dailyData = fullData.filter((item, index) => index % 8 === 0);

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(date);
        const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

        weeklyForecast.innerHTML += `
            <div class="daily-item">
                <span>${dayName}</span>
                <img src="${iconUrl}" alt="Weather Icon">
                <span>${Math.round(item.main.temp_min)}°C / ${Math.round(item.main.temp_max)}°C</span>
            </div>
        `;
    });
}

window.getLocation = getLocation;
getLocation();

