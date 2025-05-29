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
import { Cloud, Sun, CloudRain, MapPin, Calendar, Search, Droplets, Wind, Eye, Thermometer } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false);

  const tempChartRef = useRef(null);
  const humidityChartRef = useRef(null);
  const tempChartInstance = useRef(null);
  const humidityChartInstance = useRef(null);

  const API_KEY = 'bfac9ce8ea81a7cafe0a5818d7ba00a8';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  const fetchWeatherData = async () => {
    setLoading(true);
    setError('');
    setIsVisible(false);
    
    try {
      const res1 = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`);
      const res2 = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);

      if (!res1.ok || !res2.ok) throw new Error('Failed to fetch');

      const current = await res1.json();
      const forecast = await res2.json();

      setCurrentWeather(current);
      setForecast(forecast);
      setLoading(false);
      
      setTimeout(() => setIsVisible(true), 100);
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
    const labels = forecast.list.slice(0, 8).map(item =>
      new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    const temperatures = forecast.list.slice(0, 8).map(item => item.main.temp);

    tempChartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: '#06b6d4',
          backgroundColor: 'rgba(250, 253, 253, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#06b6d4',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '24-Hour Temperature Forecast',
            font: { size: 18, weight: 'bold' },
            color: '#1f2937'
          },
          legend: {
            labels: {
              color: '#374151',
              font: { size: 14 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: { 
              color: '#6B7280',
              font: { size: 12 }
            },
            grid: { 
              color: 'rgba(107, 114, 128, 0.2)',
              drawBorder: false
            }
          },
          x: {
            ticks: { 
              color: '#6B7280',
              font: { size: 12 }
            },
            grid: { 
              color: 'rgba(107, 114, 128, 0.2)',
              drawBorder: false
            }
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
    const labels = forecast.list.slice(0, 8).map(item =>
      new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    const humidity = forecast.list.slice(0, 8).map(item => item.main.humidity);

    humidityChartInstance.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Humidity (%)',
          data: humidity,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 12,
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
            font: { size: 18, weight: 'bold' },
            color: '#1f2937'
          },
          legend: {
            labels: {
              color: '#374151',
              font: { size: 14 },
              usePointStyle: true,
              pointStyle: 'rect'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              color: '#6B7280',
              font: { size: 12 }
            },
            grid: { 
              color: 'rgba(107, 114, 128, 0.2)',
              drawBorder: false
            }
          },
          x: {
            ticks: { 
              color: '#6B7280',
              font: { size: 12 }
            },
            grid: { 
              color: 'rgba(107, 114, 128, 0.2)',
              drawBorder: false
            }
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
      tempChartInstance.current?.destroy();
      humidityChartInstance.current?.destroy();
    };
  }, [forecast]);

  const getWeatherIcon = (main) => {
    const iconStyle = { width: '120px', height: '120px' };
    switch ((main || '').toLowerCase()) {
      case 'clear':
        return <Sun style={{ ...iconStyle, color: '#f59e0b', animation: 'pulse 2s infinite' }} />;
      case 'rain':
        return <CloudRain style={{ ...iconStyle, color: '#3b82f6', animation: 'bounce 1s infinite' }} />;
      case 'clouds':
        return <Cloud style={{ ...iconStyle, color: '#6b7280', animation: 'pulse 2s infinite' }} />;
      default:
        return <Cloud style={{ ...iconStyle, color: '#6b7280', animation: 'pulse 2s infinite' }} />;
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

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(0, 0, 0) 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      
      overflow: 'hidden'
    },
    backgroundOrb1: {
      position: 'fixed',
      top: '-160px',
      right: '-160px',
      width: '320px',
      height: '320px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 6s ease-in-out infinite',
      zIndex: 1
    },
    backgroundOrb2: {
      position: 'fixed',
      bottom: '-160px',
      left: '-160px',
      width: '320px',
      height: '320px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 6s ease-in-out infinite reverse',
      zIndex: 1
    },
    backgroundOrb3: {
      position: 'fixed',
      top: '160px',
      left: '160px',
      width: '320px',
      height: '320px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '50%',
      filter: 'blur(40px)',
      animation: 'float 8s ease-in-out infinite',
      zIndex: 1
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      animation: 'fadeInDown 1s ease-out'
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '10px',
      textShadow: '0 4px 8px rgba(0,0,0,0.1)'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '1.2rem',
      fontWeight: '300'
    },
    searchContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '40px',
      animation: 'fadeIn 1s ease-out 0.3s both'
    },
    searchWrapper: {
      position: 'relative',
      display: 'inline-block'
    },
    searchBox: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '25px',
      padding: '5px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)'
    },
    searchInput: {
      border: 'none',
      outline: 'none',
      background: 'transparent',
      padding: '15px 20px',
      fontSize: '1.1rem',
      color: '#333',
      flex: 1,
      minWidth: '300px'
    },
    searchButton: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      border: 'none',
      borderRadius: '20px',
      padding: '12px 20px',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '50px',
      marginRight: '5px'
    },
    error: {
      background: 'rgba(239, 68, 68, 0.9)',
      color: 'white',
      padding: '15px 30px',
      borderRadius: '15px',
      textAlign: 'center',
      marginBottom: '30px',
      animation: 'shake 0.5s ease-in-out',
      boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)'
    },
    weatherCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      borderRadius: '30px',
      padding: '40px',
      marginBottom: '40px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 1s ease',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
    },
    weatherGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '40px',
      alignItems: 'center'
    },
    weatherInfo: {
      color: 'white'
    },
    cityName: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    date: {
      fontSize: '1.1rem',
      opacity: 0.8,
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    temperature: {
      fontSize: '4rem',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    description: {
      fontSize: '1.3rem',
      textTransform: 'capitalize',
      marginBottom: '10px'
    },
    feelsLike: {
      fontSize: '1.1rem',
      opacity: 0.8
    },
    weatherIconContainer: {
      textAlign: 'center'
    },
    weatherIcon: {
      marginBottom: '30px',
      transition: 'transform 0.3s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px'
    },
    statCard: {
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '20px',
      borderRadius: '20px',
      textAlign: 'center',
      transition: 'all 0.3s ease'
    },
    statIcon: {
      marginBottom: '10px'
    },
    statLabel: {
      fontSize: '0.9rem',
      opacity: 0.8,
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '1.2rem',
      fontWeight: 'bold'
    },
    chartsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
      gap: '30px',
      transition: 'all 1s ease 0.3s',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
    },
    chartCard: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      borderRadius: '25px',
      padding: '25px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease'
    },
    chartContainer: {
      height: '320px',
      position: 'relative'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      <div style={styles.backgroundOrb3}></div>
      
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>☀️ Weather Dashboard</h1>
          <p style={styles.subtitle}>Your personal weather companion</p>
        </div>

        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <div style={styles.searchBox}>
              <MapPin style={{ marginLeft: '15px', color: '#666' }} size={20} />
              <input
                style={styles.searchInput}
                value={city}
                onChange={e => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name..."
              />
              <button 
                style={styles.searchButton}
                onClick={handleSearch} 
                disabled={loading}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {loading ? (
                  <div style={styles.spinner}></div>
                ) : (
                  <Search size={20} />
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {currentWeather && (
          <div style={styles.weatherCard}>
            <div style={styles.weatherGrid}>
              <div style={styles.weatherInfo}>
                <div style={styles.cityName}>
                  <MapPin size={28} />
                  {currentWeather.name}
                </div>
                
                <div style={styles.date}>
                  <Calendar size={20} />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>

                <div style={styles.temperature}>
                  {Math.round(currentWeather.main.temp)}°C
                </div>
                <div style={styles.description}>
                  {currentWeather.weather[0]?.description}
                </div>
                <div style={styles.feelsLike}>
                  Feels like {Math.round(currentWeather.main.feels_like)}°C
                </div>
              </div>

              <div style={styles.weatherIconContainer}>
                <div 
                  style={styles.weatherIcon}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {getWeatherIcon(currentWeather.weather[0]?.main)}
                </div>
                
                <div style={styles.statsGrid}>
                  <div 
                    style={{...styles.statCard, background: 'rgba(59, 130, 246, 0.2)'}}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.statIcon}>
                      <Droplets color="#3b82f6" size={24} />
                    </div>
                    <div style={styles.statLabel}>Humidity</div>
                    <div style={styles.statValue}>{currentWeather.main.humidity}%</div>
                  </div>
                  
                  <div 
                    style={{...styles.statCard, background: 'rgba(16, 185, 129, 0.2)'}}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.statIcon}>
                      <Wind color="#10b981" size={24} />
                    </div>
                    <div style={styles.statLabel}>Wind Speed</div>
                    <div style={styles.statValue}>{currentWeather.wind.speed} m/s</div>
                  </div>
                  
                  <div 
                    style={{...styles.statCard, background: 'rgba(168, 85, 247, 0.2)'}}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.statIcon}>
                      <Eye color="#a855f7" size={24} />
                    </div>
                    <div style={styles.statLabel}>Pressure</div>
                    <div style={styles.statValue}>{currentWeather.main.pressure} hPa</div>
                  </div>
                  
                  <div 
                    style={{...styles.statCard, background: 'rgba(245, 158, 11, 0.2)'}}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <div style={styles.statIcon}>
                      <Thermometer color="#f59e0b" size={24} />
                    </div>
                    <div style={styles.statLabel}>Visibility</div>
                    <div style={styles.statValue}>{(currentWeather.visibility / 1000).toFixed(1)} km</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {forecast && (
          <div style={styles.chartsContainer}>
            <div 
              style={styles.chartCard}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 35px 70px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.chartContainer}>
                <canvas ref={tempChartRef} style={{ width: '100%', height: '100%' }}></canvas>
              </div>
            </div>
            
            <div 
              style={styles.chartCard}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 35px 70px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.chartContainer}>
                <canvas ref={humidityChartRef} style={{ width: '100%', height: '100%' }}></canvas>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -5px, 0);
          }
          70% {
            transform: translate3d(0, -3px, 0);
          }
          90% {
            transform: translate3d(0, -1px, 0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 768px) {
          .weather-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .search-input {
            min-width: 200px;
          }
          
          .title {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherDashboard;