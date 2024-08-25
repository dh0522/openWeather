import { API_KEY, naverMapClientId, naverMapClientSecret } from './apikey.js';

//https://console.ncloud.com/naver-service/application
//https://guide.ncloud-docs.com/docs/maps-reversegeocoding-api
//https://api.ncloud-docs.com/docs/ai-naver-mapsreversegeocoding-gc
async function getLocation(){

    if( navigator.geolocation ){
        navigator.geolocation.getCurrentPosition( async (position)=>{
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const address = await getAddress(lat,lon);

           // todayWeather( lat , lon );
            fetchWeather( lat , lon, address );

        });
    }else{
        document.getElementById("weather").innerHTML = "Geolocation is not supported by this browser.";
    }
}


async function getAddress(lat, lon) {

    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const url = `${corsProxy}https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${lon},${lat}&output=json`;

    return fetch(url, {
        method: 'GET',
        headers: {
            'X-NCP-APIGW-API-KEY-ID': naverMapClientId,
            'X-NCP-APIGW-API-KEY': naverMapClientSecret
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if ( data && data.results && data.results.length > 0 ) {

                let loc = ` ${data.results[0].region.area1.name} ${data.results[0].region.area2.name} ${data.results[0].region.area3.name }`;
                document.getElementById("address").innerHTML = `    <br>현재 위치는 ${loc} 입니다. `;
                console.log(loc);
                return loc;

            } else {
                document.getElementById("address").innerHTML = "주소 정보를 가져올 수 없습니다.";
            }
        })
        .catch(error => {
            console.error("Error fetching the address: ", error);
            document.getElementById("address").innerHTML = "주소 정보를 가져오는 중 오류가 발생했습니다.";
        });
}


const fetchWeather = (lat,lon) =>{

    fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
        // `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    )
        .then((response) =>{
            return response.json();
        })
        .then((json)=>{



            let timeForecast = document.getElementById("weather");
            timeForecast.innerHTML = `<h2 class="text-xl mb-4"> 3시간 간격별 날씨 예보 </h2>`;

            json.list.forEach(item=>{
                console.log(item);
                const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
                timeForecast.innerHTML +=
                    `<div class="mb-3" >
                    <p><strong>${new Date(item.dt_txt).toLocaleString()} </strong></p>
                    <p>온도: ${item.main.temp}°C</p>
                    <p>상태: ${item.weather[0].description}</p>
                    <img src="${iconUrl}" alt = "Weather Icon" style="display: inline-block; margin: 0 auto;"/>
                </div>`;

            });
            //
            // let weatherHtml = `<h2>Location: ${address}</h2>`;
            // weatherHtml += `
            //     <div>
            //         <h3> Current Weather </h3>
            //         <p> Temperature: ${json.main.temp} °C </p>
            //         <p> Weather: ${json.weather[0].description} </p>
            //     </div>`;
            //
            // document.getElementById("weather").innerHTML = weatherHtml;
        })
        .catch((error)=>{
            console.log('날씨 예보 정보를 가져오는데 실패했습니다', error );
        });
}

window.getLocation = getLocation;



