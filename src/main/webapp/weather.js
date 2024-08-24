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

            console.log( address );
            getWeather( lat , lon, address );

        });
    }else{
        document.getElementById("weather").innerHTML = "Geolocation is not supported ny this browser.";
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
            if (data && data.results && data.results.length > 0) {
                console.log(data.results[0]);
                let loc = `주소: ${data.results[0].region.area1.name} ${data.results[0].region.area2.name} ${data.results[0].region.area3.name }`;
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



const getWeather = (lat,lon, address) =>{

    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    )
        .then((response) =>{
            return response.json();
        })
        .then((json)=>{

            let weatherHtml = `<h2>Location: ${address}</h2>`;
            weatherHtml += `
                <div>
                    <h3> Current Weather </h3>
                    <p> Temperature: ${json.main.temp} °C </p>
                    <p> Weather: ${json.weather[0].description} </p>
                </div>`;

            document.getElementById("weather").innerHTML = weatherHtml;
        })
        .catch((error)=>{
            alert(error);
        });
}
window.getLocation = getLocation;



