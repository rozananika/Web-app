import React, { useState, useMemo, useEffect } from 'react';
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
  Tabs,
  Tab,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Info as InfoIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { analytics } from '../../services/api';

// Cross-validation implementation
const crossValidate = (data, model, k = 5) => {
  const n = data.length;
  const foldSize = Math.floor(n / k);
  const scores = [];
  
  for (let i = 0; i < k; i++) {
    const testStart = i * foldSize;
    const testEnd = i === k - 1 ? n : (i + 1) * foldSize;
    
    const trainData = [
      ...data.slice(0, testStart),
      ...data.slice(testEnd),
    ];
    const testData = data.slice(testStart, testEnd);
    
    const trainedModel = model.train(trainData);
    const predictions = testData.map(d => trainedModel.predict(d));
    const actual = testData.map(d => d.target);
    
    scores.push(calculateMetrics(predictions, actual));
  }
  
  return {
    mean: scores.reduce((acc, score) => ({
      mse: acc.mse + score.mse / k,
      mae: acc.mae + score.mae / k,
      r2: acc.r2 + score.r2 / k,
    }), { mse: 0, mae: 0, r2: 0 }),
    std: {
      mse: Math.sqrt(scores.reduce((acc, score) =>
        acc + Math.pow(score.mse - scores.reduce((a, s) => a + s.mse / k, 0), 2), 0) / k),
      mae: Math.sqrt(scores.reduce((acc, score) =>
        acc + Math.pow(score.mae - scores.reduce((a, s) => a + s.mae / k, 0), 2), 0) / k),
      r2: Math.sqrt(scores.reduce((acc, score) =>
        acc + Math.pow(score.r2 - scores.reduce((a, s) => a + s.r2 / k, 0), 2), 0) / k),
    },
  };
};

// Model evaluation metrics
const calculateMetrics = (predictions, actual) => {
  const n = predictions.length;
  
  // Mean Squared Error
  const mse = predictions.reduce((sum, pred, i) =>
    sum + Math.pow(pred - actual[i], 2), 0) / n;
  
  // Mean Absolute Error
  const mae = predictions.reduce((sum, pred, i) =>
    sum + Math.abs(pred - actual[i]), 0) / n;
  
  // R-squared
  const meanActual = actual.reduce((a, b) => a + b, 0) / n;
  const totalSS = actual.reduce((sum, y) =>
    sum + Math.pow(y - meanActual, 2), 0);
  const residualSS = predictions.reduce((sum, pred, i) =>
    sum + Math.pow(actual[i] - pred, 2), 0);
  const r2 = 1 - residualSS / totalSS;
  
  return { mse, mae, r2 };
};

// Model implementations
const models = {
  linear: {
    train: (data) => {
      const n = data.length;
      const X = data.map(d => [1, d.x]);
      const y = data.map(d => d.target);
      
      // Normal equation: β = (X'X)^(-1)X'y
      const Xt = X[0].map((_, i) => X.map(row => row[i]));
      const XtX = Xt.map(row1 => X[0].map((_, j) =>
        row1.reduce((sum, _, k) => sum + row1[k] * X[k][j], 0)
      ));
      const XtY = Xt.map(row =>
        row.reduce((sum, _, i) => sum + row[i] * y[i], 0)
      );
      
      // Solve using Gaussian elimination
      const augmented = XtX.map((row, i) => [...row, XtY[i]]);
      const n2 = XtX.length;
      
      for (let i = 0; i < n2; i++) {
        const pivot = augmented[i][i];
        for (let j = i; j <= n2; j++) {
          augmented[i][j] /= pivot;
        }
        for (let k = 0; k < n2; k++) {
          if (k !== i) {
            const factor = augmented[k][i];
            for (let j = i; j <= n2; j++) {
              augmented[k][j] -= factor * augmented[i][j];
            }
          }
        }
      }
      
      const coefficients = augmented.map(row => row[n2]);
      
      return {
        predict: (x) => coefficients[0] + coefficients[1] * x.x,
        coefficients,
      };
    },
  },
  
  polynomial: {
    train: (data, degree = 2) => {
      const n = data.length;
      const X = data.map(d => Array(degree + 1).fill().map((_, i) =>
        Math.pow(d.x, i)
      ));
      const y = data.map(d => d.target);
      
      // Same as linear regression but with polynomial features
      const Xt = X[0].map((_, i) => X.map(row => row[i]));
      const XtX = Xt.map(row1 => X[0].map((_, j) =>
        row1.reduce((sum, _, k) => sum + row1[k] * X[k][j], 0)
      ));
      const XtY = Xt.map(row =>
        row.reduce((sum, _, i) => sum + row[i] * y[i], 0)
      );
      
      const augmented = XtX.map((row, i) => [...row, XtY[i]]);
      const n2 = XtX.length;
      
      for (let i = 0; i < n2; i++) {
        const pivot = augmented[i][i];
        for (let j = i; j <= n2; j++) {
          augmented[i][j] /= pivot;
        }
        for (let k = 0; k < n2; k++) {
          if (k !== i) {
            const factor = augmented[k][i];
            for (let j = i; j <= n2; j++) {
              augmented[k][j] -= factor * augmented[i][j];
            }
          }
        }
      }
      
      const coefficients = augmented.map(row => row[n2]);
      
      return {
        predict: (x) => coefficients.reduce((sum, coef, i) =>
          sum + coef * Math.pow(x.x, i), 0),
        coefficients,
      };
    },
  },
  
  exponential: {
    train: (data) => {
      // Log transform for exponential regression
      const transformedData = data.map(d => ({
        x: d.x,
        target: Math.log(d.target),
      }));
      
      const linearModel = models.linear.train(transformedData);
      
      return {
        predict: (x) => Math.exp(linearModel.predict(x)),
        coefficients: linearModel.coefficients,
      };
    },
  },
};

export default function ModelComparison({ data = [], config }) {
  const {
    metrics = ['accuracy', 'precision', 'recall', 'f1'],
    targetField = 'value',
    defaultMetric = 'accuracy'
  } = config || {};

  const [selectedModels, setSelectedModels] = useState(['linear', 'polynomial', 'exponential']);
  const [selectedMetric, setSelectedMetric] = useState(defaultMetric);
  const [currentTab, setCurrentTab] = useState(0);
  const [modelData, setModelData] = useState(data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await analytics.getModelComparisonData();
        setModelData(response.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        // Use sample data as fallback
        setModelData(Array.from({ length: 100 }, (_, i) => ({
          id: i,
          x: Math.random() * 10,
          y: Math.random() * 10 + Math.sin(i / 10) * 2,
          value: Math.random() * 100 + Math.sin(i / 10) * 20,
        })));
      } finally {
        setLoading(false);
      }
    };

    if (data.length === 0) {
      fetchData();
    } else {
      setModelData(data);
      setLoading(false);
    }
  }, [data]);

  const modelResults = useMemo(() => {
    if (!modelData || modelData.length === 0) return {};
    
    const results = {};
    
    selectedModels.forEach(modelName => {
      try {
        const model = models[modelName];
        if (!model) return;

        const dataPoints = modelData.map(d => ({
          x: d[selectedMetric] || 0,
          target: d[targetField] || 0,
        }));

        const cvResults = crossValidate(dataPoints, model);
        
        // Train on full dataset for predictions
        const trainedModel = model.train(dataPoints);
        
        const predictions = modelData.map(d => ({
          actual: d[targetField] || 0,
          predicted: trainedModel.predict({ x: d[selectedMetric] || 0 }),
          x: d[selectedMetric] || 0,
        }));
        
        results[modelName] = {
          cvResults,
          predictions,
          model: trainedModel,
        };
      } catch (error) {
        console.error(`Error processing model ${modelName}:`, error);
      }
    });
    
    return results;
  }, [modelData, selectedModels, selectedMetric, targetField]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Models</InputLabel>
              <Select
                multiple
                value={selectedModels}
                onChange={(e) => setSelectedModels(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="linear">Linear</MenuItem>
                <MenuItem value="polynomial">Polynomial</MenuItem>
                <MenuItem value="exponential">Exponential</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Target Field</InputLabel>
              <Select
                value={targetField}
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Predictor</InputLabel>
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
        </Grid>
      </Paper>

      {/* Results */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Model Comparison</Typography>
          <IconButton>
            <DownloadIcon />
          </IconButton>
        </Box>

        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Cross-Validation Results" />
          <Tab label="Predictions" />
          <Tab label="Residuals" />
        </Tabs>

        {currentTab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Model</TableCell>
                  <TableCell>MSE (mean ± std)</TableCell>
                  <TableCell>MAE (mean ± std)</TableCell>
                  <TableCell>R² (mean ± std)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(modelResults).map(([name, results]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>
                      {results.cvResults.mean.mse.toFixed(4)} ±{' '}
                      {results.cvResults.std.mse.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {results.cvResults.mean.mae.toFixed(4)} ±{' '}
                      {results.cvResults.std.mae.toFixed(4)}
                    </TableCell>
                    <TableCell>
                      {results.cvResults.mean.r2.toFixed(4)} ±{' '}
                      {results.cvResults.std.r2.toFixed(4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {currentTab === 1 && (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={selectedMetric}
                />
                <YAxis
                  type="number"
                  dataKey="actual"
                  name={targetField}
                />
                <RechartsTooltip />
                <Legend />
                <Scatter
                  name="Actual"
                  data={modelData.map(d => ({
                    x: d[selectedMetric],
                    actual: d[targetField],
                  }))}
                  fill="#8884d8"
                />
                {Object.entries(modelResults).map(([name, results], i) => (
                  <Scatter
                    key={name}
                    name={`${name} predictions`}
                    data={results.predictions}
                    fill={`hsl(${(i + 1) * 137.508}deg, 70%, 50%)`}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        )}

        {currentTab === 2 && (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="x"
                  name={selectedMetric}
                />
                <YAxis
                  type="number"
                  dataKey="residual"
                  name="Residual"
                />
                <RechartsTooltip />
                <Legend />
                {Object.entries(modelResults).map(([name, results], i) => (
                  <Scatter
                    key={name}
                    name={`${name} residuals`}
                    data={results.predictions.map(p => ({
                      x: p.x,
                      residual: p.actual - p.predicted,
                    }))}
                    fill={`hsl(${(i + 1) * 137.508}deg, 70%, 50%)`}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
