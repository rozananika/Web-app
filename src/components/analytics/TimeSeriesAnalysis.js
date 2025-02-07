import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { jStat } from 'jstat';

const calculateMovingAverage = (data, period) => {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const average = slice.reduce((sum, val) => sum + val, 0) / period;
    result.push(average);
  }
  return result;
};

const calculateExponentialSmoothing = (data, alpha) => {
  const result = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
};

const calculateSeasonalDecomposition = (data, period) => {
  const n = data.length;
  
  // Calculate trend using moving average
  const trend = calculateMovingAverage(data, period);
  
  // Calculate seasonal component
  const seasonal = Array(period).fill(0);
  const seasonalCounts = Array(period).fill(0);
  
  for (let i = 0; i < n; i++) {
    const seasonIndex = i % period;
    if (i < trend.length) {
      seasonal[seasonIndex] += data[i] / trend[i];
      seasonalCounts[seasonIndex]++;
    }
  }
  
  // Normalize seasonal factors
  for (let i = 0; i < period; i++) {
    seasonal[i] = seasonal[i] / seasonalCounts[i];
  }
  
  // Calculate residual
  const residual = data.map((value, i) => {
    if (i < trend.length) {
      return value / (trend[i] * seasonal[i % period]);
    }
    return null;
  });
  
  return { trend, seasonal, residual };
};

const calculateAutocorrelation = (data, maxLag) => {
  const mean = jStat.mean(data);
  const variance = jStat.variance(data);
  const n = data.length;
  
  const acf = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) {
      sum += (data[i] - mean) * (data[i + lag] - mean);
    }
    acf.push(sum / ((n - lag) * variance));
  }
  
  return acf;
};

const calculateForecast = (data, horizon, method = 'ets') => {
  const n = data.length;
  let forecast = [];
  let confidenceIntervals = [];
  
  switch (method) {
    case 'ets': {
      // Simple exponential smoothing with trend and seasonality
      const alpha = 0.2; // smoothing factor
      const beta = 0.1;  // trend factor
      const gamma = 0.3; // seasonal factor
      const period = 7;  // assuming weekly seasonality
      
      const level = [data[0]];
      const trend = [data[1] - data[0]];
      const seasonal = Array(period).fill(0);
      
      // Initialize seasonal factors
      for (let i = 0; i < period; i++) {
        let sum = 0;
        let count = 0;
        for (let j = i; j < n; j += period) {
          sum += data[j];
          count++;
        }
        seasonal[i] = sum / count;
      }
      
      // Normalize seasonal factors
      const seasonalMean = jStat.mean(seasonal);
      for (let i = 0; i < period; i++) {
        seasonal[i] /= seasonalMean;
      }
      
      // Calculate level, trend, and seasonal components
      for (let t = 1; t < n; t++) {
        const s = t % period;
        level.push(alpha * (data[t] / seasonal[s]) + 
                  (1 - alpha) * (level[t-1] + trend[t-1]));
        trend.push(beta * (level[t] - level[t-1]) + 
                  (1 - beta) * trend[t-1]);
        seasonal[s] = gamma * (data[t] / level[t]) + 
                     (1 - gamma) * seasonal[s];
      }
      
      // Generate forecasts
      const lastLevel = level[n-1];
      const lastTrend = trend[n-1];
      
      for (let h = 1; h <= horizon; h++) {
        const s = (n + h - 1) % period;
        const forecastValue = (lastLevel + h * lastTrend) * seasonal[s];
        forecast.push(forecastValue);
        
        // Calculate prediction intervals (assuming normal distribution)
        const sigma = Math.sqrt(jStat.variance(data));
        const z = 1.96; // 95% confidence interval
        const width = z * sigma * Math.sqrt(h);
        confidenceIntervals.push({
          lower: forecastValue - width,
          upper: forecastValue + width,
        });
      }
      break;
    }
    
    case 'arima': {
      // Simple AR(1) model for demonstration
      const phi = jStat.correlation(data.slice(0, -1), data.slice(1))[0];
      const lastValue = data[n-1];
      
      for (let h = 1; h <= horizon; h++) {
        const forecastValue = phi * (h === 1 ? lastValue : forecast[h-2]);
        forecast.push(forecastValue);
        
        // Calculate prediction intervals
        const sigma = Math.sqrt(jStat.variance(data));
        const z = 1.96;
        const width = z * sigma * Math.sqrt(1 - Math.pow(phi, 2*h));
        confidenceIntervals.push({
          lower: forecastValue - width,
          upper: forecastValue + width,
        });
      }
      break;
    }
  }
  
  return { forecast, confidenceIntervals };
};

// Holt-Winters implementation
const holtWinters = (data, alpha = 0.2, beta = 0.1, gamma = 0.3, period = 7, horizon = 30) => {
  const n = data.length;
  
  // Initialize components
  let level = data[0];
  let trend = data[1] - data[0];
  const seasonal = Array(period).fill(0);
  
  // Initialize seasonal indices
  for (let i = 0; i < period; i++) {
    let sum = 0;
    let count = 0;
    for (let j = i; j < n; j += period) {
      sum += data[j];
      count++;
    }
    seasonal[i] = sum / count;
  }
  
  // Normalize seasonal indices
  const seasonalMean = seasonal.reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < period; i++) {
    seasonal[i] /= seasonalMean;
  }
  
  // Arrays to store components
  const levels = [level];
  const trends = [trend];
  const seasonals = [...seasonal];
  const fitted = [level * seasonal[0]];
  
  // Apply Holt-Winters algorithm
  for (let t = 1; t < n; t++) {
    const s = t % period;
    
    // Update level
    const newLevel = alpha * (data[t] / seasonal[s]) + (1 - alpha) * (level + trend);
    
    // Update trend
    const newTrend = beta * (newLevel - level) + (1 - beta) * trend;
    
    // Update seasonal
    seasonal[s] = gamma * (data[t] / newLevel) + (1 - gamma) * seasonal[s];
    
    level = newLevel;
    trend = newTrend;
    
    levels.push(level);
    trends.push(trend);
    seasonals.push(seasonal[s]);
    fitted.push(level * seasonal[s]);
  }
  
  // Generate forecasts
  const forecasts = [];
  const forecastLower = [];
  const forecastUpper = [];
  
  for (let h = 1; h <= horizon; h++) {
    const s = (n + h - 1) % period;
    const forecast = (level + h * trend) * seasonal[s];
    forecasts.push(forecast);
    
    // Calculate prediction intervals
    const sigma = Math.sqrt(
      fitted.reduce((sum, f, i) => sum + Math.pow(data[i] - f, 2), 0) / (n - 3)
    );
    const z = 1.96;  // 95% confidence interval
    const width = z * sigma * Math.sqrt(1 + h/n);
    
    forecastLower.push(forecast - width);
    forecastUpper.push(forecast + width);
  }
  
  return {
    fitted,
    forecasts,
    forecastLower,
    forecastUpper,
    components: {
      level: levels,
      trend: trends,
      seasonal: seasonals,
    },
  };
};

// Prophet-like implementation
const prophetLike = (data, changepoints = 10, horizon = 30) => {
  const n = data.length;
  
  // Identify potential changepoints
  const potentialChangepoints = [];
  const step = Math.floor(n / (changepoints + 1));
  for (let i = step; i < n - step; i += step) {
    potentialChangepoints.push(i);
  }
  
  // Fit piecewise linear trend
  const X = Array(n).fill().map((_, i) => [1, i]);
  potentialChangepoints.forEach(cp => {
    X.forEach((row, i) => {
      row.push(i > cp ? i - cp : 0);
    });
  });
  
  // Simple linear regression for each component
  const solve = (y, X) => {
    const Xt = X[0].map((_, i) => X.map(row => row[i]));
    const XtX = Xt.map(row1 => X[0].map((_, j) =>
      row1.reduce((sum, _, k) => sum + row1[k] * X[k][j], 0)
    ));
    const XtY = Xt.map(row =>
      row.reduce((sum, _, i) => sum + row[i] * y[i], 0)
    );
    
    // Solve using Gaussian elimination
    const n = XtX.length;
    const augmented = XtX.map((row, i) => [...row, XtY[i]]);
    
    for (let i = 0; i < n; i++) {
      const pivot = augmented[i][i];
      for (let j = i; j <= n; j++) {
        augmented[i][j] /= pivot;
      }
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = i; j <= n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    return augmented.map(row => row[n]);
  };
  
  const coefficients = solve(data, X);
  
  // Generate trend
  const trend = X.map(row =>
    row.reduce((sum, x, i) => sum + x * coefficients[i], 0)
  );
  
  // Estimate seasonality using Fourier series
  const periods = [7, 365];  // Weekly and yearly seasonality
  const fourier = (t, period, order) => {
    const result = [];
    const x = 2 * Math.PI * t / period;
    for (let i = 1; i <= order; i++) {
      result.push(Math.sin(i * x));
      result.push(Math.cos(i * x));
    }
    return result;
  };
  
  const seasonalX = Array(n).fill().map((_, i) => [
    ...fourier(i, 7, 3),   // Weekly with 3 harmonics
    ...fourier(i, 365, 5), // Yearly with 5 harmonics
  ]);
  
  const seasonalCoef = solve(
    data.map((y, i) => y - trend[i]),
    seasonalX
  );
  
  const seasonal = seasonalX.map(row =>
    row.reduce((sum, x, i) => sum + x * seasonalCoef[i], 0)
  );
  
  // Generate forecasts
  const forecasts = [];
  const forecastLower = [];
  const forecastUpper = [];
  
  for (let h = 1; h <= horizon; h++) {
    const t = n + h - 1;
    
    // Forecast trend
    const trendForecast = [1, t, ...potentialChangepoints.map(cp =>
      t > cp ? t - cp : 0
    )].reduce((sum, x, i) => sum + x * coefficients[i], 0);
    
    // Forecast seasonality
    const seasonalForecast = [
      ...fourier(t, 7, 3),
      ...fourier(t, 365, 5),
    ].reduce((sum, x, i) => sum + x * seasonalCoef[i], 0);
    
    const forecast = trendForecast + seasonalForecast;
    forecasts.push(forecast);
    
    // Calculate prediction intervals
    const sigma = Math.sqrt(
      data.reduce((sum, y, i) =>
        sum + Math.pow(y - (trend[i] + seasonal[i]), 2), 0
      ) / (n - coefficients.length - seasonalCoef.length)
    );
    const z = 1.96;
    const width = z * sigma * Math.sqrt(1 + h/n);
    
    forecastLower.push(forecast - width);
    forecastUpper.push(forecast + width);
  }
  
  return {
    trend,
    seasonal,
    fitted: trend.map((t, i) => t + seasonal[i]),
    forecasts,
    forecastLower,
    forecastUpper,
  };
};

export default function TimeSeriesAnalysis({ data, config }) {
  const {
    metrics = [],
    dateField = 'date',
    defaultMetric = metrics[0],
    forecastHorizon = 30,
  } = config;

  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);
  const [decompositionPeriod, setDecompositionPeriod] = useState(7);
  const [smoothingMethod, setSmoothingMethod] = useState('ma');
  const [smoothingWindow, setSmoothingWindow] = useState(7);
  const [forecastMethod, setForecastMethod] = useState('ets');

  const timeSeriesData = useMemo(() => {
    return data
      .map(d => ({
        date: new Date(d[dateField]),
        value: d[selectedMetric],
      }))
      .sort((a, b) => a.date - b.date);
  }, [data, dateField, selectedMetric]);

  const values = timeSeriesData.map(d => d.value);

  const decomposition = useMemo(() => 
    calculateSeasonalDecomposition(values, decompositionPeriod),
    [values, decompositionPeriod]
  );

  const smoothedData = useMemo(() => {
    if (smoothingMethod === 'ma') {
      return calculateMovingAverage(values, smoothingWindow);
    } else {
      return calculateExponentialSmoothing(values, 0.2);
    }
  }, [values, smoothingMethod, smoothingWindow]);

  const acf = useMemo(() => 
    calculateAutocorrelation(values, Math.min(50, Math.floor(values.length / 4))),
    [values]
  );

  const forecast = useMemo(() => {
    switch (forecastMethod) {
      case 'ets':
        return calculateForecast(values, forecastHorizon, 'ets');
      case 'arima':
        return calculateForecast(values, forecastHorizon, 'arima');
      case 'holtwinters':
        return holtWinters(values, 0.2, 0.1, 0.3, decompositionPeriod, forecastHorizon);
      case 'prophet':
        return prophetLike(values, 10, forecastHorizon);
      default:
        return calculateForecast(values, forecastHorizon, 'ets');
    }
  }, [values, forecastMethod, forecastHorizon, decompositionPeriod]);

  const handleExport = (type, data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Metric</InputLabel>
              <Select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                {metrics.map((metric) => (
                  <MenuItem key={metric} value={metric}>
                    {metric}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Decomposition Period</InputLabel>
              <Select
                value={decompositionPeriod}
                onChange={(e) => setDecompositionPeriod(e.target.value)}
              >
                <MenuItem value={7}>Weekly</MenuItem>
                <MenuItem value={30}>Monthly</MenuItem>
                <MenuItem value={90}>Quarterly</MenuItem>
                <MenuItem value={365}>Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Smoothing Method</InputLabel>
              <Select
                value={smoothingMethod}
                onChange={(e) => setSmoothingMethod(e.target.value)}
              >
                <MenuItem value="ma">Moving Average</MenuItem>
                <MenuItem value="exp">Exponential</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Forecast Method</InputLabel>
              <Select
                value={forecastMethod}
                onChange={(e) => setForecastMethod(e.target.value)}
              >
                <MenuItem value="ets">ETS</MenuItem>
                <MenuItem value="arima">ARIMA</MenuItem>
                <MenuItem value="holtwinters">Holt-Winters</MenuItem>
                <MenuItem value="prophet">Prophet-like</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Time Series Plot */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, height: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Time Series Analysis</Typography>
          <IconButton onClick={() => handleExport('timeseries', {
            original: timeSeriesData,
            smoothed: smoothedData,
            forecast: forecast.forecasts,
            confidenceIntervals: forecast.forecastLower.map((l, i) => ({
              lower: l,
              upper: forecast.forecastUpper[i],
            })),
          })}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer>
          <LineChart
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line
              data={timeSeriesData}
              type="monotone"
              dataKey="value"
              name="Original"
              stroke="#8884d8"
              dot={false}
            />
            <Line
              data={smoothedData.map((value, i) => ({
                date: timeSeriesData[i + Math.floor(smoothingWindow/2)]?.date,
                value,
              }))}
              type="monotone"
              dataKey="value"
              name="Smoothed"
              stroke="#82ca9d"
              dot={false}
            />
            {forecast.forecasts.map((value, i) => {
              const date = new Date(timeSeriesData[timeSeriesData.length - 1].date);
              date.setDate(date.getDate() + i + 1);
              return {
                date,
                value,
                lower: forecast.forecastLower[i],
                upper: forecast.forecastUpper[i],
              };
            }).map((point, i) => (
              <Line
                key={i}
                data={[point]}
                type="monotone"
                dataKey="value"
                name="Forecast"
                stroke="#ff7300"
                strokeDasharray="5 5"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Decomposition */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Seasonal Decomposition</Typography>
          <IconButton onClick={() => handleExport('decomposition', decomposition)}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Trend
            </Typography>
            <ResponsiveContainer height={200}>
              <LineChart data={decomposition.trend.map((value, i) => ({
                index: i,
                value,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Seasonal
            </Typography>
            <ResponsiveContainer height={200}>
              <LineChart data={decomposition.seasonal.map((value, i) => ({
                index: i,
                value,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom>
              Residual
            </Typography>
            <ResponsiveContainer height={200}>
              <LineChart data={decomposition.residual.map((value, i) => ({
                index: i,
                value,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Line type="monotone" dataKey="value" stroke="#ff7300" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Paper>

      {/* Autocorrelation */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Autocorrelation Analysis</Typography>
          <IconButton onClick={() => handleExport('autocorrelation', { acf })}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <ResponsiveContainer height={300}>
          <LineChart data={acf.map((value, i) => ({
            lag: i,
            value,
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lag" />
            <YAxis domain={[-1, 1]} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
