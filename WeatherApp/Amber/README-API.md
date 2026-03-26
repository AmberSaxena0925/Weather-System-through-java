# Weather App - API Integration Guide

## Overview
This weather app uses two main APIs:
1. **OpenWeatherMap API** - For current weather and forecast data
2. **OpenCage Geocoding API** - For reverse geocoding (coordinates to city names)

## API Setup

### 1. OpenWeatherMap API

#### Sign Up
- Visit [OpenWeatherMap API](https://openweathermap.org/api)
- Create a free account
- Generate an API key from your account dashboard

#### Endpoints Used
- **Current Weather**: `GET https://api.openweathermap.org/data/2.5/weather`
- **Forecast**: `GET https://api.openweathermap.org/data/2.5/forecast`

#### Example Response
```json
{
  "coord": {"lon": -104.9903, "lat": 39.7392},
  "weather": [{"main": "Clear", "description": "clear sky", "icon": "01d"}],
  "main": {
    "temp": 22.5,
    "feels_like": 20.8,
    "humidity": 60
  },
  "wind": {"speed": 12.5},
  "name": "Denver"
}
```

### 2. OpenCage Geocoding API

#### Sign Up
- Visit [OpenCage Geocoding](https://opencagedata.com/api)
- Create a free account (250 requests/day free tier)
- Generate an API key

#### Endpoint Used
- **Reverse Geocoding**: `GET https://api.opencagedata.com/geocode/v1/json`

#### Example Response
```json
{
  "results": [{
    "components": {
      "city": "Denver",
      "town": "Denver",
      "country": "United States"
    }
  }]
}
```

## Configuration

### For Development (Updated for static hosting)
API keys now support environment variables with fallback to demo keys in `api-config.js`.

**Quick Start (uses demo keys):**
- No setup needed - works out of the box!

**Custom Keys (recommended):**
1. Copy `Amber/.env.example` to `Amber/.env`
2. Fill in your API keys
3. Uncomment and update the `<script>` block in `index.html`:
   ```
   <script>
       window.ENV = {
           OPENWEATHER_API_KEY: 'your_openweathermap_key',
           OPENCAGE_API_KEY: 'your_opencage_key'
       };
   </script>
   ```
4. Save and reload

### Get API Keys:
- **OpenWeatherMap**: [openweathermap.org/api](https://openweathermap.org/api) (free tier: 60 calls/min)
- **OpenCage**: [opencagedata.com/api](https://opencagedata.com/api) (free: 2500 req/day)

## File Structure

```
Amber/
├── index.html           # Main HTML file
├── style.css            # Styling
├── script.js            # Main application logic
├── api-config.js        # API configuration and utility functions
├── .env.example         # Environment variables template
└── README-API.md        # This file
```

## API Functions

### `getWeatherByCityName(city)`
Fetches current weather for a given city name.

```javascript
getWeatherByCityName('Denver')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### `getWeatherForecast(city)`
Fetches 5-day weather forecast (3-hour intervals) for a city.

```javascript
getWeatherForecast('Denver')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### `reverseGeocodeCoordinates(latitude, longitude)`
Converts GPS coordinates to city name.

```javascript
reverseGeocodeCoordinates(39.7392, -104.9903)
  .then(data => console.log(data.results[0].components.city))
  .catch(err => console.error(err));
```

### `getWeatherIconUrl(iconCode)`
Returns the URL for a weather icon.

```javascript
const iconUrl = getWeatherIconUrl('01d');
// Returns: https://openweathermap.org/img/wn/01d@2x.png
```

## Error Handling

All API calls include:
- **Timeout handling**: 10 seconds
- **Error messages**: User-friendly status messages
- **Fallback behavior**: Falls back to Denver weather if location detection fails

## API Limits

### OpenWeatherMap (Free Tier)
- 60 calls/minute
- Current weather & forecast: 5 day / 3 hour forecast

### OpenCage (Free Tier)
- 250 requests/day
- No request/minute limit

## Testing

To test the API setup:
1. Open browser console (F12)
2. Test individual functions:
   ```javascript
   getWeatherByCityName('London')
   getWeatherForecast('New York')
   reverseGeocodeCoordinates(51.5074, -0.1278)
   ```

## Security Notes

- **Never commit API keys** to version control
- Use `.env` files for local development
- Use environment variables in production
- Consider using backend proxy for API calls in production
- Implement rate limiting and request authentication

## Future Enhancements

- [ ] Multiple weather data providers (WeatherAPI, Weather.gov)
- [ ] Weather alerts and notifications
- [ ] Historical weather data
- [ ] Air quality index integration
- [ ] UV index and pollen count
- [ ] Backend API proxy for security
