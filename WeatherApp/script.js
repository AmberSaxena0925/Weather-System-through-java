let weather = {
    chart: null,
    fetchWeather: function(city){
        if (!city || city.trim() === "") {
            this.setStatus('Please enter a valid city name.');
            return;
        }

        this.setStatus('Loading weather...');
        document.querySelector('.weather').classList.add('loading');

        getWeatherByCityName(city)
        .then((data) => {
            this.displayWeather(data);
            this.fetchForecast(city.trim());
        })
        .catch((err) => {
            console.error(err);
            this.setStatus('Unable to fetch weather for "' + city + '". ' + err.message);
            document.querySelector('.weather').classList.remove('loading');
        });
    },

    displayWeather: function(data){
        const{ name } = data;
        const{ icon, description } = data.weather[0];
        const{ temp, humidity } = data.main;
        const{ speed } = data.wind;
        // console.log(name,icon,description,temp,humidity,speed);
        document.querySelector(".city").innerText = "Weather in " + name;
        document.querySelector(".icon").src = getWeatherIconUrl(icon);
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp +"°C";
        document.querySelector(".status-value.humidity").innerText = humidity + "%";
        document.querySelector(".status-value.wind").innerText = speed + " km/h";
        document.querySelector(".weather").classList.remove("loading");
        this.setStatus('Showing weather for ' + name + '.');
    },

    fetchForecast: function(city){
        getWeatherForecast(city)
        .then((data) => this.renderChart(data))
        .catch((err) => console.error('Forecast fetch error:', err));
    },

    renderChart: function(data){
        const ctx = document.getElementById('weatherChart').getContext('2d');
        const labels = [];
        const temps = [];

        // Get next 8 entries (24 hours, 3-hour intervals)
        for (let i = 0; i < Math.min(8, data.list.length); i++) {
            const item = data.list[i];
            const time = new Date(item.dt * 1000);
            labels.push(time.getHours() + ':00');
            temps.push(item.main.temp);
        }

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temps,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.2)'
                        }
                    }
                }
            }
        });
    },
    setStatus: function(message){
        var statusEl = document.querySelector('.status-message');
        if (statusEl) {
            statusEl.textContent = message;
        }
    },

    search: function(){
        this.fetchWeather(document.querySelector(".search-bar").value);
    }
};

let geocode = {
    reverseGeocode: function (latitude ,longitude) {
        reverseGeocodeCoordinates(latitude, longitude)
        .then((data) => {
            if (data.results && data.results.length > 0) {
                const components = data.results[0].components;
                const city = components.city || components.town || components.village || 'Denver';
                weather.fetchWeather(city);
            } else {
                throw new Error('No location found');
            }
        })
        .catch((err) => {
            console.error('Geocoding error:', err);
            weather.setStatus('Unable to geocode location. Showing weather for Denver.');
            weather.fetchWeather('Denver');
        });
    },

    getLocation: function(){
        weather.setStatus('Detecting your location...');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    geocode.reverseGeocode(position.coords.latitude, position.coords.longitude);
                },
                function (error) {
                    console.error('Geolocation error:', error);
                    weather.setStatus('Location access denied or unavailable. Showing weather for Denver.');
                    weather.fetchWeather('Denver');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            weather.setStatus('Geolocation not supported. Showing weather for Denver.');
            weather.fetchWeather('Denver');
        }
    }
}

document.querySelector('.search-btn').addEventListener('click', function () {
    weather.search();
});

document.querySelector('.location-btn').addEventListener('click', function () {
    geocode.getLocation();
});

document.querySelector(".search-bar").addEventListener("keyup", function(event) {
    if(event.key == 'Enter'){
        weather.search();
    }
});


geocode.getLocation();
