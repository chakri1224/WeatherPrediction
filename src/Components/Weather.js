import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from 'chart.js';
import { Cloud, Sun, CloudRain, MapPin, Calendar, Thermometer } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

const WeatherDashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const tempChartRef = useRef(null);
  const humidityChartRef = useRef(null);
  const tempChartInstance = useRef(null);
  const humidityChartInstance = useRef(null);

  const API_KEY = 'bfac9ce8ea81a7cafe0a5818d7ba00a8';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Mock data generator for different cities
  const generateMockWeatherData = (cityName) => {
    const cities = {
      'london': { baseTemp: 15, humidity: 70, condition: 'Clouds' },
      'new york': { baseTemp: 20, humidity: 60, condition: 'Clear' },
      'tokyo': { baseTemp: 25, humidity: 80, condition: 'Rain' },
      'paris': { baseTemp: 18, humidity: 65, condition: 'Clouds' },
      'mumbai': { baseTemp: 30, humidity: 85, condition: 'Clear' },
      'sydney': { baseTemp: 22, humidity: 55, condition: 'Clear' },
      'dubai': { baseTemp: 35, humidity: 40, condition: 'Clear' },
      'moscow': { baseTemp: 5, humidity: 75, condition: 'Snow' }
    };

    const cityKey = cityName.toLowerCase();
    const cityData = cities[cityKey] || cities['london'];
    
    const tempVariation = (Math.random() - 0.5) * 6;
    const humidityVariation = (Math.random() - 0.5) * 20;
    
    const currentWeather = {
      name: cityName.charAt(0).toUpperCase() + cityName.slice(1),
      main: {
        temp: Math.round(cityData.baseTemp + tempVariation),
        feels_like: Math.round(cityData.baseTemp + tempVariation - 2),
        humidity: Math.max(20, Math.min(100, Math.round(cityData.humidity + humidityVariation))),
        pressure: Math.round(1013 + (Math.random() - 0.5) * 40)
      },
      weather: [{
        main: cityData.condition,
        description: getWeatherDescription(cityData.condition),
        icon: '03d'
      }],
      wind: {
        speed: Math.round((Math.random() * 8 + 1) * 10) / 10
      }
    };

    const forecastList = [];
    for (let i = 0; i < 8; i++) {
      const hourlyTempVariation = (Math.random() - 0.5) * 8;
      const hourlyHumidityVariation = (Math.random() - 0.5) * 15;
      
      forecastList.push({
        dt: Date.now() + (i * 3600000),
        main: {
          temp: Math.round(cityData.baseTemp + hourlyTempVariation),
          humidity: Math.max(20, Math.min(100, Math.round(cityData.humidity + hourlyHumidityVariation)))
        },
        weather: [{
          main: i % 3 === 0 ? 'Rain' : i % 2 === 0 ? 'Clouds' : 'Clear'
        }]
      });
    }

    return {
      current: currentWeather,
      forecast: { list: forecastList }
    };
  };

  const getWeatherDescription = (condition) => {
    const descriptions = {
      'Clear': 'clear sky',
      'Clouds': 'scattered clouds',
      'Rain': 'light rain',
      'Snow': 'light snow'
    };
    return descriptions[condition] || 'partly cloudy';
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError('');
    
    try {
      setTimeout(() => {
        const weatherData = generateMockWeatherData(city);
        setCurrentWeather(weatherData.current);
        setForecast(weatherData.forecast);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      setError('Failed to fetch weather data');
      setLoading(false);
    }
  };

  const createTemperatureChart = () => {
    if (!forecast?.list || !tempChartRef.current) return;

    if (tempChartInstance.current) {
      tempChartInstance.current.destroy();
    }

    const ctx = tempChartRef.current.getContext('2d');
    const labels = forecast.list.map((item, index) => `${index * 3}h`);
    const temperatures = forecast.list.map(item => item.main.temp);

    tempChartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '24-Hour Temperature Forecast',
            font: { size: 16, weight: 'bold' },
            color: '#374151'
          },
          legend: {
            labels: {
              color: '#374151',
              font: { size: 14 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { color: '#6B7280' }
          },
          x: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { color: '#6B7280' }
          }
        }
      }
    });
  };

  const createHumidityChart = () => {
    if (!forecast?.list || !humidityChartRef.current) return;

    if (humidityChartInstance.current) {
      humidityChartInstance.current.destroy();
    }

    const ctx = humidityChartRef.current.getContext('2d');
    const labels = forecast.list.map((item, index) => `${index * 3}h`);
    const humidity = forecast.list.map(item => item.main.humidity);

    humidityChartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Humidity (%)',
          data: humidity,
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '24-Hour Humidity Forecast',
            font: { size: 16, weight: 'bold' },
            color: '#374151'
          },
          legend: {
            labels: {
              color: '#374151',
              font: { size: 14 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { color: '#6B7280' }
          },
          x: {
            grid: { color: 'rgba(0,0,0,0.1)' },
            ticks: { color: '#6B7280' }
          }
        }
      }
    });
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => {
    if (forecast) {
      createTemperatureChart();
      createHumidityChart();
    }

    return () => {
      if (tempChartInstance.current) {
        tempChartInstance.current.destroy();
      }
      if (humidityChartInstance.current) {
        humidityChartInstance.current.destroy();
      }
    };
  }, [forecast]);

  const getWeatherIcon = (weatherMain) => {
    const iconStyle = { width: '80px', height: '80px' };
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return <Sun style={{...iconStyle, color: '#F59E0B'}} />;
      case 'rain':
        return <CloudRain style={{...iconStyle, color: '#3B82F6'}} />;
      case 'clouds':
        return <Cloud style={{...iconStyle, color: '#6B7280'}} />;
      case 'snow':
        return <Cloud style={{...iconStyle, color: '#93C5FD'}} />;
      default:
        return <Cloud style={{...iconStyle, color: '#6B7280'}} />;
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeatherData();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>
          🌤️ Weather Dashboard
        </h1>

        {/* Search Section */}
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter city name (e.g., London, New York, Tokyo)"
              style={styles.searchInput}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={loading ? {...styles.searchButton, ...styles.searchButtonDisabled} : styles.searchButton}
            >
              {loading ? '🔄 Loading...' : '🔍 Search'}
            </button>
          </div>
        </div>

        {error && (
          <div style={styles.errorMessage}>
            ⚠️ {error}
          </div>
        )}

        {/* Current Weather Card */}
        {currentWeather && (
          <div style={styles.weatherCard}>
            <div style={styles.weatherHeader}>
              <div style={styles.locationInfo}>
                <MapPin style={styles.locationIcon} />
                <h2 style={styles.cityName}>
                  {currentWeather.name}
                </h2>
              </div>
              <div style={styles.dateInfo}>
                <Calendar style={styles.dateIcon} />
                <span style={styles.dateText}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div style={styles.weatherContent}>
              <div style={styles.mainWeatherInfo}>
                <div style={styles.weatherIconContainer}>
                  {getWeatherIcon(currentWeather.weather[0]?.main)}
                </div>
                <div style={styles.temperatureInfo}>
                  <div style={styles.temperature}>
                    {Math.round(currentWeather.main.temp)}°C
                  </div>
                  <div style={styles.weatherDescription}>
                    {currentWeather.weather[0]?.description}
                  </div>
                  <div style={styles.feelsLike}>
                    Feels like {Math.round(currentWeather.main.feels_like)}°C
                  </div>
                </div>
              </div>

              <div style={styles.weatherStats}>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>💧 Humidity</div>
                  <div style={styles.statValue}>
                    {currentWeather.main.humidity}%
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>💨 Wind Speed</div>
                  <div style={styles.statValue}>
                    {currentWeather.wind.speed} m/s
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>🌡️ Pressure</div>
                  <div style={styles.statValue}>
                    {currentWeather.main.pressure} hPa
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statLabel}>👁️ Visibility</div>
                  <div style={styles.statValue}>
                    Good
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {forecast && (
          <div style={styles.chartsContainer}>
            <div style={styles.chartCard}>
              <canvas ref={tempChartRef} style={styles.chartCanvas} />
            </div>
            <div style={styles.chartCard}>
              <canvas ref={humidityChartRef} style={styles.chartCanvas} />
            </div>
          </div>
        )}

        {/* API Key Notice */}
        <div style={styles.notice}>
          <div style={styles.noticeContent}>
            <p style={styles.noticeText}>
              <strong>🎭 Demo Mode:</strong> Currently showing dynamic mock data. Try searching for different cities like: 
              London, New York, Tokyo, Paris, Mumbai, Sydney, Dubai, Moscow.
              <br />
              <strong>🔑 For Real Data:</strong> Replace the API key with your actual OpenWeatherMap API key from{' '}
              <a href="https://openweathermap.org/api" style={styles.noticeLink}>openweathermap.org/api</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: '2rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    letterSpacing: '1px'
  },
  searchSection: {
    marginBottom: '2rem'
  },
  searchContainer: {
    display: 'flex',
    gap: '12px',
    maxWidth: '500px',
    margin: '0 auto'
  },
  searchInput: {
    flex: 1,
    padding: '15px 20px',
    borderRadius: '25px',
    border: 'none',
    fontSize: '16px',
    outline: 'none',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.95)'
  },
  searchButton: {
    padding: '15px 25px',
    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    minWidth: '120px'
  },
  searchButtonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  errorMessage: {
    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
    color: 'white',
    padding: '15px',
    borderRadius: '15px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '500',
    boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
  },
  weatherCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '25px',
    padding: '30px',
    marginBottom: '2rem',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  weatherHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  locationIcon: {
    width: '24px',
    height: '24px',
    color: '#6B7280'
  },
  cityName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1F2937',
    margin: 0
  },
  dateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#6B7280'
  },
  dateIcon: {
    width: '18px',
    height: '18px'
  },
  dateText: {
    fontSize: '16px'
  },
  weatherContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    alignItems: 'center'
  },
  mainWeatherInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px'
  },
  weatherIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  temperatureInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  temperature: {
    fontSize: '4rem',
    fontWeight: 'bold',
    color: '#1F2937',
    lineHeight: 1,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  weatherDescription: {
    color: '#6B7280',
    fontSize: '18px',
    textTransform: 'capitalize',
    marginTop: '5px'
  },
  feelsLike: {
    fontSize: '14px',
    color: '#9CA3AF',
    marginTop: '5px'
  },
  weatherStats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
    padding: '20px',
    borderRadius: '15px',
    textAlign: 'center',
    border: '1px solid rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease',
    cursor: 'default'
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: '8px'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1F2937'
  },
  chartsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '2rem'
  },
  chartCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  chartCanvas: {
    maxWidth: '100%',
    height: '300px'
  },
  notice: {
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    borderLeft: '5px solid #F59E0B',
    borderRadius: '15px',
    padding: '20px',
    marginTop: '2rem',
    boxShadow: '0 10px 25px rgba(245,158,11,0.2)'
  },
  noticeContent: {
    marginLeft: '15px'
  },
  noticeText: {
    fontSize: '14px',
    color: '#92400E',
    lineHeight: '1.6',
    margin: 0
  },
  noticeLink: {
    color: '#1D4ED8',
    textDecoration: 'underline',
    fontWeight: '500'
  }
};

// Responsive styles
const mediaQuery = window.matchMedia('(max-width: 768px)');
if (mediaQuery.matches) {
  styles.weatherContent.gridTemplateColumns = '1fr';
  styles.weatherContent.gap = '20px';
  styles.chartsContainer.gridTemplateColumns = '1fr';
  styles.mainWeatherInfo.flexDirection = 'column';
  styles.mainWeatherInfo.textAlign = 'center';
  styles.title.fontSize = '2.5rem';
  styles.searchContainer.flexDirection = 'column';
  styles.weatherHeader.flexDirection = 'column';
  styles.weatherHeader.textAlign = 'center';
}

export default WeatherDashboard;