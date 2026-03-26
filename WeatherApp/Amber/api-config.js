/**
 * Weather API Configuration
 * Centralized setup for all weather-related API calls
 */

const API_CONFIG = {
  // OpenWeatherMap API
  OPENWEATHER: {
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: window.ENV?.OPENWEATHER_API_KEY || '466ddaa21a8de191e9f608bd11a56acb', // Fallback to demo key
    endpoints: {
      current: '/weather',
      forecast: '/forecast'
    },
    params: {
      units: 'metric',
      lang: 'en'
    }
  },

  // OpenCage Geocoding API
  OPENCAGE: {
    baseUrl: 'https://api.opencagedata.com/geocode/v1/json',
    apiKey: window.ENV?.OPENCAGE_API_KEY || '089943fd115440dbb4d95b091479e834', // Fallback to demo key
    params: {
      no_annotations: 1
    }
  },

  // Weather Icons
  ICONS: {
    baseUrl: 'https://openweathermap.org/img/wn',
    size: '@2x.png'
  },

  // Request timeouts
  timeout: 10000
};

/**
 * Build query string from parameters
 */
function buildQueryString(params) {
  return Object.keys(params)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
    .join('&');
}

/**
 * Make API request with error handling
 */
async function apiRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      ...options
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Fetch current weather data
 */
async function getWeatherByCityName(city) {
  const params = {
    q: city,
    units: API_CONFIG.OPENWEATHER.params.units,
    appid: API_CONFIG.OPENWEATHER.apiKey
  };

  const url = `${API_CONFIG.OPENWEATHER.baseUrl}${API_CONFIG.OPENWEATHER.endpoints.current}?${buildQueryString(params)}`;

  return apiRequest(url);
}

/**
 * Fetch weather forecast data
 */
async function getWeatherForecast(city) {
  const params = {
    q: city,
    units: API_CONFIG.OPENWEATHER.params.units,
    appid: API_CONFIG.OPENWEATHER.apiKey
  };

  const url = `${API_CONFIG.OPENWEATHER.baseUrl}${API_CONFIG.OPENWEATHER.endpoints.forecast}?${buildQueryString(params)}`;

  return apiRequest(url);
}

/**
 * Reverse geocode coordinates to city name
 */
async function reverseGeocodeCoordinates(latitude, longitude) {
  const params = {
    key: API_CONFIG.OPENCAGE.apiKey,
    q: `${latitude},${longitude}`,
    pretty: 1,
    no_annotations: API_CONFIG.OPENCAGE.params.no_annotations
  };

  const url = `${API_CONFIG.OPENCAGE.baseUrl}?${buildQueryString(params)}`;

  return apiRequest(url);
}

/**
 * Get weather icon URL
 */
function getWeatherIconUrl(iconCode) {
  return `${API_CONFIG.ICONS.baseUrl}/${iconCode}${API_CONFIG.ICONS.size}`;
}
