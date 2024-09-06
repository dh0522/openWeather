import { API_KEY, naverMapClientId, naverMapClientSecret } from './apikey.js';

const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';

async function getWeather() {
    console.log("getWeather 함수 시작");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            console.log("위치 정보 획득 성공");
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log(`위도: ${lat}, 경도: ${lon}`);
            try {
                const address = await getAddressFromCoords(lat, lon);
                console.log("주소 정보:", address);
                const weatherData = await fetchWeather(lat, lon);
                console.log("날씨 데이터:", weatherData);
                const forecastData = await fetchForecast(lat, lon);
                console.log("예보 데이터:", forecastData);
                displayWeather(weatherData, forecastData, address);
            } catch (error) {
                console.error("데이터 fetch 중 오류 발생:", error);
                document.getElementById("weatherContainer").innerHTML = "날씨 정보를 가져오는 데 실패했습니다. 오류: " + error.message;
            }
        }, (error) => {
            console.error("위치 정보 획득 실패:", error);
            document.getElementById("weatherContainer").innerHTML = "위치 정보를 가져오는 데 실패했습니다. 오류: " + error.message;
        });
    } else {
        console.log("Geolocation이 지원되지 않음");
        document.getElementById("weatherContainer").innerHTML = "이 브라우저는 위치 정보를 지원하지 않습니다.";
    }
}

async function getAddressFromCoords(lat, lon) {
    const url = `${PROXY_URL}https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lon},${lat}&output=json`;
    try {
        const response = await fetch(url, {
            headers: {
                "X-NCP-APIGW-API-KEY-ID": naverMapClientId,
                "X-NCP-APIGW-API-KEY": naverMapClientSecret
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status.code === 0 && data.results && data.results.length > 0) {
            const area = data.results[0].region;
            return `${area.area1.name} ${area.area2.name} ${area.area3.name}`;
        } else {
            throw new Error("주소를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error('getAddressFromCoords 에러:', error);
        throw error;
    }
}

async function fetchWeather(lat, lon) {
    const url = `${PROXY_URL}https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('fetchWeather 에러:', error);
        throw error;
    }
}

async function fetchForecast(lat, lon) {
    const url = `${PROXY_URL}https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('fetchForecast 에러:', error);
        throw error;
    }
}

function displayWeather(weatherData, forecastData, address) {
    console.log("displayWeather 함수 시작");
    try {
        document.getElementById("cityName").textContent = address;
        document.getElementById("currentTemp").innerHTML = `${Math.round(weatherData.main.temp)}° <i class="fas fa-sun"></i>`;
        document.getElementById("weatherDescription").textContent = weatherData.weather[0].description;
        document.getElementById("highLowTemp").textContent = `최고: ${Math.round(weatherData.main.temp_max)}° 최저: ${Math.round(weatherData.main.temp_min)}°`;
        document.getElementById("humidity").innerHTML = `<i class="fas fa-tint"></i> ${weatherData.main.humidity}%`;

        const forecastElement = document.getElementById("forecast");
        const threeDayForecast = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 3);

        forecastElement.innerHTML = threeDayForecast.map(day => `
            <div class="forecast-day">
                <div>${new Date(day.dt * 1000).toLocaleDateString('ko-KR', {weekday: 'short'})}</div>
                <i class="fas fa-sun"></i>
                <div>${Math.round(day.main.temp_max)}° ${Math.round(day.main.temp_min)}°</div>
            </div>
        `).join('');
        console.log("날씨 정보 표시 완료");
    } catch (error) {
        console.error("날씨 정보 표시 중 오류 발생:", error);
        document.getElementById("weatherContainer").innerHTML = "날씨 정보를 표시하는 데 실패했습니다. 오류: " + error.message;
    }
}



getWeather();
