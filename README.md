#Weather App

## WeatherApp

### Overview
Student project with two variants: Aarush (basic) and Amber (advanced).

**Amber variant** (recommended): Modern UI with geolocation, search, forecast chart (Chart.js), OpenWeatherMap + OpenCage APIs.

### Quick Setup & Run (Amber)
1. `cd WeatherApp/Amber`
2. **Uses demo API keys** - works immediately!
3. Run: `npx live-server` (opens browser at http://127.0.0.1:8080)
   - Search cities, use location button, view 24h forecast chart.

**Custom API keys** (optional):
- Copy `.env.example` → `.env`
- Edit `index.html`: uncomment `window.ENV` script with your keys
- Get keys: OpenWeatherMap, OpenCage (see Amber/README-API.md)

### Features (Amber)
- Current weather (temp, humidity, wind, icon)
- Geolocation support
- 24h forecast chart
- Responsive glassmorphism UI

See `Amber/README-API.md` for API details.

