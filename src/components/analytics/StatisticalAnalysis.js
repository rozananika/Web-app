import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
import regression from 'regression';

const calculateStatistics = (data, metric) => {
  const values = data.map(d => d[metric]).filter(v => !isNaN(v));
  const n = values.length;
  
  if (n === 0) return null;

  // Basic statistics
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = n % 2 === 0
    ? (sortedValues[n/2 - 1] + sortedValues[n/2]) / 2
    : sortedValues[Math.floor(n/2)];
  
  // Variance and standard deviation
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Quartiles
  const q1 = sortedValues[Math.floor(n * 0.25)];
  const q3 = sortedValues[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  // Skewness
  const skewness = values.reduce((acc, val) => 
    acc + Math.pow(val - mean, 3), 0) / (n * Math.pow(stdDev, 3));

  // Kurtosis
  const kurtosis = values.reduce((acc, val) =>
    acc + Math.pow(val - mean, 4), 0) / (n * Math.pow(variance, 2)) - 3;

  return {
    mean: mean.toFixed(2),
    median: median.toFixed(2),
    stdDev: stdDev.toFixed(2),
    q1: q1.toFixed(2),
    q3: q3.toFixed(2),
    iqr: iqr.toFixed(2),
    skewness: skewness.toFixed(2),
    kurtosis: kurtosis.toFixed(2),
    n,
  };
};

const detectSeasonality = (data, metric, period) => {
  const values = data.map(d => d[metric]);
  const n = values.length;
  
  if (n < period * 2) return null;

  // Calculate autocorrelation at the specified period
  let sumProduct = 0;
  let sumSquares = 0;
  for (let i = 0; i < n - period; i++) {
    sumProduct += (values[i] - values[i + period]) ** 2;
    sumSquares += values[i] ** 2;
  }
  
  const seasonalityStrength = 1 - (sumProduct / (2 * sumSquares));
  
  return {
    period,
    strength: seasonalityStrength.toFixed(3),
    significant: seasonalityStrength > 0.5,
  };
};

const performRegression = (data, xMetric, yMetric, type = 'linear') => {
  const points = data
    .filter(d => !isNaN(d[xMetric]) && !isNaN(d[yMetric]))
    .map(d => [d[xMetric], d[yMetric]]);

  const result = regression[type](points);
  
  return {
    equation: result.equation,
    r2: result.r2,
    points: result.points,
    predict: result.predict,
    string: result.string,
  };
};

export default function StatisticalAnalysis({ data, config }) {
  const {
    metrics = [],
    seasonalityPeriods = [7, 30, 365], // daily, monthly, yearly
    regressionTypes = ['linear', 'exponential', 'polynomial'],
  } = config;

  const handleExport = (analysisType, data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysisType}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Descriptive Statistics */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Descriptive Statistics</Typography>
          <IconButton onClick={() => handleExport('descriptive', metrics.map(m => ({
            metric: m,
            statistics: calculateStatistics(data, m),
          })))}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Mean</TableCell>
                <TableCell>Median</TableCell>
                <TableCell>Std Dev</TableCell>
                <TableCell>
                  <Tooltip title="Interquartile Range">
                    <span>IQR <InfoIcon fontSize="small" /></span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Measure of asymmetry">
                    <span>Skewness <InfoIcon fontSize="small" /></span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title="Measure of tail extremity">
                    <span>Kurtosis <InfoIcon fontSize="small" /></span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.map(metric => {
                const stats = calculateStatistics(data, metric);
                if (!stats) return null;
                return (
                  <TableRow key={metric}>
                    <TableCell>{metric}</TableCell>
                    <TableCell>{stats.mean}</TableCell>
                    <TableCell>{stats.median}</TableCell>
                    <TableCell>{stats.stdDev}</TableCell>
                    <TableCell>{stats.iqr}</TableCell>
                    <TableCell>{stats.skewness}</TableCell>
                    <TableCell>{stats.kurtosis}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Seasonality Analysis */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Seasonality Analysis</Typography>
          <IconButton onClick={() => handleExport('seasonality', metrics.map(m => ({
            metric: m,
            seasonality: seasonalityPeriods.map(p => detectSeasonality(data, m, p)),
          })))}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {seasonalityPeriods.map(period => (
                  <TableCell key={period}>
                    {period === 7 ? 'Weekly' : period === 30 ? 'Monthly' : 'Yearly'}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.map(metric => (
                <TableRow key={metric}>
                  <TableCell>{metric}</TableCell>
                  {seasonalityPeriods.map(period => {
                    const seasonality = detectSeasonality(data, metric, period);
                    return (
                      <TableCell key={period}>
                        {seasonality ? (
                          <Tooltip title={`Strength: ${seasonality.strength}`}>
                            <span>
                              {seasonality.significant ? 'Significant' : 'Not Significant'}
                            </span>
                          </Tooltip>
                        ) : 'N/A'}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Regression Analysis */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Regression Analysis</Typography>
          <IconButton onClick={() => handleExport('regression', metrics.map(m1 => 
            metrics.map(m2 => ({
              x: m1,
              y: m2,
              regressions: regressionTypes.map(type => ({
                type,
                result: performRegression(data, m1, m2, type),
              })),
            }))
          ))}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <Grid container spacing={2}>
          {metrics.map(metric1 => (
            metrics.map(metric2 => {
              if (metric1 === metric2) return null;
              return (
                <Grid item xs={12} md={6} key={`${metric1}-${metric2}`}>
                  <Typography variant="subtitle1" gutterBottom>
                    {`${metric1} vs ${metric2}`}
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Type</TableCell>
                          <TableCell>Equation</TableCell>
                          <TableCell>R²</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {regressionTypes.map(type => {
                          const result = performRegression(data, metric1, metric2, type);
                          return (
                            <TableRow key={type}>
                              <TableCell>{type}</TableCell>
                              <TableCell>{result.string}</TableCell>
                              <TableCell>{result.r2.toFixed(3)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              );
            })
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
