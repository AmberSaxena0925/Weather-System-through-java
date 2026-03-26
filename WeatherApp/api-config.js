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

  // Google Maps Geocoding API
  GOOGLE_MAPS: {
    baseUrl: 'https://maps.googleapis.com/maps/api/geocode/json',
    apiKey: window.ENV?.GOOGLE_MAPS_API_KEY || 'AIzaSyAOF0rK-8iIZAOgffj2KYViS9fLAeu_5kc', // Your provided Google API key
    params: {
      sensor: false
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
 * Reverse geocode coordinates to city name using Google Maps API
 */
async function reverseGeocodeCoordinates(latitude, longitude) {
  const params = {
    key: API_CONFIG.GOOGLE_MAPS.apiKey,
    latlng: `${latitude},${longitude}`,
    sensor: API_CONFIG.GOOGLE_MAPS.params.sensor
  };

  const url = `${API_CONFIG.GOOGLE_MAPS.baseUrl}?${buildQueryString(params)}`;

  try {
    const response = await apiRequest(url);

    // Google Maps API response format
    if (response.status === 'OK' && response.results && response.results.length > 0) {
      // Extract city name from address components
      const addressComponents = response.results[0].address_components;
      let city = '';

      // Look for locality (city) or administrative_area_level_1 (state/province)
      for (const component of addressComponents) {
        if (component.types.includes('locality')) {
          city = component.long_name;
          break;
        } else if (component.types.includes('administrative_area_level_1') && !city) {
          city = component.long_name;
        }
      }

      // Return in a format similar to OpenCage for compatibility
      return {
        results: [{
          components: {
            city: city,
            town: city,
            country: addressComponents.find(c => c.types.includes('country'))?.long_name || ''
          },
          formatted: response.results[0].formatted_address
        }]
      };
    } else {
      throw new Error('Geocoding failed: ' + response.status);
    }
  } catch (error) {
    console.error('Google Maps Geocoding error:', error);
    throw error;
  }
}

/**
 * Get weather icon URL
 */
function getWeatherIconUrl(iconCode) {
  return `${API_CONFIG.ICONS.baseUrl}/${iconCode}${API_CONFIG.ICONS.size}`;
}
