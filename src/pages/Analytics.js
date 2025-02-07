import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';

import DataExplorer from '../components/analytics/DataExplorer';
import AdvancedStatistics from '../components/analytics/AdvancedStatistics';
import TimeSeriesAnalysis from '../components/analytics/TimeSeriesAnalysis';
import ClusterAnalysis from '../components/analytics/ClusterAnalysis';
import AdvancedVisualizations from '../components/analytics/AdvancedVisualizations';
import ModelComparison from '../components/analytics/ModelComparison';

// Sample data for testing
const sampleData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  x: Math.random() * 10,
  y: Math.random() * 10 + Math.sin(i / 10) * 2,
  category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
  timestamp: new Date(2024, 0, 1 + i).toISOString(),
  value: Math.random() * 100 + Math.sin(i / 10) * 20,
}));

function Analytics() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Data Explorer" />
          <Tab label="Advanced Statistics" />
          <Tab label="Time Series Analysis" />
          <Tab label="Cluster Analysis" />
          <Tab label="Model Comparison" />
          <Tab label="Advanced Visualizations" />
        </Tabs>
      </Paper>

      <Box sx={{ mt: 2 }}>
        {currentTab === 0 && <DataExplorer data={sampleData} />}
        {currentTab === 1 && <AdvancedStatistics data={sampleData} />}
        {currentTab === 2 && <TimeSeriesAnalysis data={sampleData} />}
        {currentTab === 3 && <ClusterAnalysis data={sampleData} />}
        {currentTab === 4 && (
          <ModelComparison
            data={sampleData}
            config={{
              metrics: ['x', 'y', 'value'],
              targetField: 'value',
              defaultMetric: 'x',
            }}
          />
        )}
        {currentTab === 5 && <AdvancedVisualizations data={sampleData} />}
      </Box>
    </Container>
  );
}

export default Analytics;
