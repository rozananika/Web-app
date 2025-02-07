import React, { useState } from 'react';
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Info as InfoIcon,
  GetApp as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { jStat } from 'jstat';

const calculateTTest = (data1, data2) => {
  const mean1 = jStat.mean(data1);
  const mean2 = jStat.mean(data2);
  const var1 = jStat.variance(data1);
  const var2 = jStat.variance(data2);
  const n1 = data1.length;
  const n2 = data2.length;

  // Welch's t-test
  const t = (mean1 - mean2) / Math.sqrt((var1 / n1) + (var2 / n2));
  const df = Math.floor(Math.pow((var1 / n1 + var2 / n2), 2) /
    (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1)));
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));

  return {
    t: t.toFixed(4),
    df,
    pValue: pValue.toFixed(4),
    significant: pValue < 0.05,
    cohensD: ((mean1 - mean2) / Math.sqrt((var1 + var2) / 2)).toFixed(4),
  };
};

const calculateANOVA = (groups) => {
  const grandMean = jStat.mean([].concat(...groups));
  const n = groups.reduce((sum, group) => sum + group.length, 0);
  const k = groups.length;

  // Between-groups sum of squares
  const ssb = groups.reduce((sum, group) => {
    const groupMean = jStat.mean(group);
    return sum + group.length * Math.pow(groupMean - grandMean, 2);
  }, 0);

  // Within-groups sum of squares
  const ssw = groups.reduce((sum, group) => {
    const groupMean = jStat.mean(group);
    return sum + group.reduce((s, x) => s + Math.pow(x - groupMean, 2), 0);
  }, 0);

  const dfb = k - 1;
  const dfw = n - k;
  const msb = ssb / dfb;
  const msw = ssw / dfw;
  const f = msb / msw;
  const pValue = 1 - jStat.centralF.cdf(f, dfb, dfw);

  return {
    f: f.toFixed(4),
    dfb,
    dfw,
    pValue: pValue.toFixed(4),
    significant: pValue < 0.05,
    etaSquared: (ssb / (ssb + ssw)).toFixed(4),
  };
};

const calculateChiSquare = (observed, expected) => {
  const chiSquare = observed.reduce((sum, obs, i) => {
    return sum + Math.pow(obs - expected[i], 2) / expected[i];
  }, 0);

  const df = observed.length - 1;
  const pValue = 1 - jStat.chisquare.cdf(chiSquare, df);

  return {
    chiSquare: chiSquare.toFixed(4),
    df,
    pValue: pValue.toFixed(4),
    significant: pValue < 0.05,
    cramerV: Math.sqrt(chiSquare / (jStat.sum(observed) * (Math.min(observed.length, expected.length) - 1))).toFixed(4),
  };
};

const TestSection = ({ title, children, onExport }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, ml: 1 }}>
          {title}
        </Typography>
        <IconButton onClick={onExport}>
          <DownloadIcon />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        {children}
      </Collapse>
    </Box>
  );
};

export default function AdvancedStatistics({ data, config }) {
  const {
    metrics = [],
    categories = [],
    timeRanges = ['daily', 'weekly', 'monthly'],
  } = config;

  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('');

  const handleExport = (testType, results) => {
    const jsonString = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testType}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMetricData = (metric, category, timeRange) => {
    return data
      .filter(d => (!category || d.category === category) &&
                   (!timeRange || d.timeRange === timeRange))
      .map(d => d[metric])
      .filter(v => !isNaN(v));
  };

  return (
    <Box>
      {/* Test Configuration */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Metrics</InputLabel>
              <Select
                multiple
                value={selectedMetrics}
                onChange={(e) => setSelectedMetrics(e.target.value)}
                renderValue={(selected) => selected.join(', ')}
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
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {timeRanges.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* T-Tests */}
      <TestSection
        title="T-Tests"
        onExport={() => handleExport('ttest', selectedMetrics.map(metric => ({
          metric,
          results: calculateTTest(
            getMetricData(metric, selectedCategory, selectedTimeRange),
            getMetricData(metric, selectedCategory, 'previous')
          ),
        })))}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>t-statistic</TableCell>
                <TableCell>p-value</TableCell>
                <TableCell>Significant</TableCell>
                <TableCell>
                  <Tooltip title="Effect size measure">
                    <span>Cohen's d <InfoIcon fontSize="small" /></span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMetrics.map(metric => {
                const result = calculateTTest(
                  getMetricData(metric, selectedCategory, selectedTimeRange),
                  getMetricData(metric, selectedCategory, 'previous')
                );
                return (
                  <TableRow key={metric}>
                    <TableCell>{metric}</TableCell>
                    <TableCell>{result.t}</TableCell>
                    <TableCell>{result.pValue}</TableCell>
                    <TableCell>{result.significant ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{result.cohensD}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TestSection>

      {/* ANOVA */}
      <TestSection
        title="ANOVA"
        onExport={() => handleExport('anova', selectedMetrics.map(metric => ({
          metric,
          results: calculateANOVA(
            categories.map(cat => getMetricData(metric, cat, selectedTimeRange))
          ),
        })))}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>F-statistic</TableCell>
                <TableCell>p-value</TableCell>
                <TableCell>Significant</TableCell>
                <TableCell>
                  <Tooltip title="Measure of effect size">
                    <span>η² (Eta squared) <InfoIcon fontSize="small" /></span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMetrics.map(metric => {
                const result = calculateANOVA(
                  categories.map(cat => getMetricData(metric, cat, selectedTimeRange))
                );
                return (
                  <TableRow key={metric}>
                    <TableCell>{metric}</TableCell>
                    <TableCell>{result.f}</TableCell>
                    <TableCell>{result.pValue}</TableCell>
                    <TableCell>{result.significant ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{result.etaSquared}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TestSection>

      {/* Chi-Square Tests */}
      <TestSection
        title="Chi-Square Tests"
        onExport={() => handleExport('chisquare', selectedMetrics.map(metric => ({
          metric,
          results: calculateChiSquare(
            getMetricData(metric, selectedCategory, selectedTimeRange),
            getMetricData(metric, selectedCategory, 'expected')
          ),
        })))}
      >
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>χ² statistic</TableCell>
                <TableCell>p-value</TableCell>
                <TableCell>Significant</TableCell>
                <TableCell>
                  <Tooltip title="Measure of effect size">
                    <span>Cramer's V <InfoIcon fontSize="small" /></span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMetrics.map(metric => {
                const result = calculateChiSquare(
                  getMetricData(metric, selectedCategory, selectedTimeRange),
                  getMetricData(metric, selectedCategory, 'expected')
                );
                return (
                  <TableRow key={metric}>
                    <TableCell>{metric}</TableCell>
                    <TableCell>{result.chiSquare}</TableCell>
                    <TableCell>{result.pValue}</TableCell>
                    <TableCell>{result.significant ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{result.cramerV}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TestSection>
    </Box>
  );
}
