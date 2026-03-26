let weather = {
    "apikey": "466ddaa21a8de191e9f608bd11a56acb",
    chart: null,
    fetchWeather: function(city){
        if (!city || city.trim() === "") {
            this.setStatus('Please enter a valid city name.');
            return;
        }

        this.setStatus('Loading weather...');
        document.querySelector('.weather').classList.add('loading');

        fetch(
        "https://api.openweathermap.org/data/2.5/weather?q="
        + encodeURIComponent(city.trim()) 
        + "&units=metric&appid=" 
        + this.apikey
        )
        .then((response) => {
            if (!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then((data) => {
            this.displayWeather(data);
            this.fetchForecast(city.trim());
        })
        .catch((err) => {
            console.error(err);
            this.setStatus('Unable to fetch weather for "' + city + '".');
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
        document.querySelector(".icon").src = "https://openweathermap.org/img/wn/"+ icon +".png";
        document.querySelector(".description").innerText = description;
        document.querySelector(".temp").innerText = temp +"°C";
        document.querySelector(".status-value.humidity").innerText = humidity + "%";
        document.querySelector(".status-value.wind").innerText = speed + " km/h";
        document.querySelector(".weather").classList.remove("loading");
        this.setStatus('Showing weather for ' + name + '.');
    },

    fetchForecast: function(city){
        fetch(
        "https://api.openweathermap.org/data/2.5/forecast?q="
        + encodeURIComponent(city) 
        + "&units=metric&appid=" 
        + this.apikey
        )
        .then((response) => response.json())
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
        var api_key = '089943fd115440dbb4d95b091479e834';

  var api_url = 'https://api.opencagedata.com/geocode/v1/json'

  var request_url = api_url
    + '?'
    + 'key=' + api_key
    + '&q=' + encodeURIComponent(latitude + ',' + longitude)
    + '&pretty=1'
    + '&no_annotations=1';

  // see full list of required and optional parameters:
  // https://opencagedata.com/api#forward

  var request = new XMLHttpRequest();
  request.open('GET', request_url, true);

  request.onload = function() {
    // see full list of possible response codes:
    // https://opencagedata.com/api#codes

    if (request.status === 200){
      // Success!
      var data = JSON.parse(request.responseText);
      weather.fetchWeather(data.results[0].components.city);

    } else if (request.status <= 500){
      // We reached our target server, but it returned an error

      console.log("unable to geocode! Response code: " + request.status);
      var data = JSON.parse(request.responseText);
      console.log('error msg: ' + data.status.message);
    } else {
      console.log("server error");
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
    console.log("unable to connect to server");
  };

  request.send();  // make the request
    },

    getLocation: function(){
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    geocode.reverseGeocode(position.coords.latitude, position.coords.longitude);
                },
                function (error) {
                    console.error('Geolocation error:', error);
                    weather.fetchWeather('Denver');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
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
