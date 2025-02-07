import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Divider,
  Box,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analytics } from '../services/api';
import BookRecommendations from '../components/BookRecommendations';
import DateRangePicker from '../components/DateRangePicker'; 
import PredictiveAnalytics from '../components/PredictiveAnalytics';
import UserBehaviorAnalytics from '../components/UserBehaviorAnalytics';
import InventoryAnalytics from '../components/InventoryAnalytics';
import AnalyticsFilter from '../components/analytics/AnalyticsFilter';
import AdvancedFilters from '../components/analytics/AdvancedFilters';
import RadarChart from '../components/analytics/RadarChart';
import { default as CustomPieChart } from '../components/analytics/PieChart';
import ComparativeChart from '../components/analytics/ComparativeChart';
import HeatmapChart from '../components/analytics/HeatmapChart';
import BubbleChart from '../components/analytics/BubbleChart';
import CorrelationMatrix from '../components/analytics/CorrelationMatrix';
import TrendPrediction from '../components/analytics/TrendPrediction';
import CustomDashboard from '../components/analytics/CustomDashboard';
import StatisticalAnalysis from '../components/analytics/StatisticalAnalysis';
import DashboardTemplates from '../components/analytics/DashboardTemplates';
import AdvancedStatistics from '../components/analytics/AdvancedStatistics';
import DataExplorer from '../components/analytics/DataExplorer';
import TimeSeriesAnalysis from '../components/analytics/TimeSeriesAnalysis';
import ClusterAnalysis from '../components/analytics/ClusterAnalysis';
import { createTheme } from '@mui/material/styles';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AVAILABLE_FILTERS = [
  {
    value: 'userSegment',
    label: 'User Segment',
    type: 'select',
    options: [
      { value: 'POWER_USER', label: 'Power Users' },
      { value: 'ACTIVE_USER', label: 'Active Users' },
      { value: 'CASUAL_USER', label: 'Casual Users' },
      { value: 'INACTIVE_USER', label: 'Inactive Users' },
    ],
  },
  {
    value: 'genre',
    label: 'Genre',
    type: 'select',
    options: [
      { value: 'FICTION', label: 'Fiction' },
      { value: 'NON_FICTION', label: 'Non-Fiction' },
      { value: 'SCIENCE', label: 'Science' },
      { value: 'HISTORY', label: 'History' },
      { value: 'TECHNOLOGY', label: 'Technology' },
    ],
  },
  {
    value: 'inventoryStatus',
    label: 'Inventory Status',
    type: 'select',
    options: [
      { value: 'UNDER_STOCKED', label: 'Under Stocked' },
      { value: 'OPTIMAL', label: 'Optimal' },
      { value: 'OVER_STOCKED', label: 'Over Stocked' },
    ],
  },
  {
    value: 'maintenanceStatus',
    label: 'Maintenance Status',
    type: 'select',
    options: [
      { value: 'GOOD', label: 'Good' },
      { value: 'FAIR', label: 'Fair' },
      { value: 'POOR', label: 'Poor' },
    ],
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeUsers: 0,
    averageRating: 0,
    totalLendings: 0,
    activeLendings: 0,
    overdueBooks: 0,
    metrics: {},
    categories: [],
    booksByGenre: {},
    lendingsByMonth: {},
    timeline: [],
    comparisonTimeline: [],
    mostBorrowedBooks: [],
    mostActiveMembers: [],
    highestRatedBooks: [],
  });
  const [predictions, setPredictions] = useState([]);
  const [userBehavior, setUserBehavior] = useState([]);
  const [inventoryAnalytics, setInventoryAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [filters, setFilters] = useState({
    timeRange: '30d',
    comparisonType: 'none',
    metrics: {},
    toggles: {}
  });
  const [filterPresets, setFilterPresets] = useState([]);
  const [dashboardWidgets, setDashboardWidgets] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDataExplorer, setShowDataExplorer] = useState(false);
  const [showTimeSeriesAnalysis, setShowTimeSeriesAnalysis] = useState(false);
  const [showClusterAnalysis, setShowClusterAnalysis] = useState(false);
  const [error, setError] = useState(null);
  const theme = createTheme();

  const handleError = (err) => {
    setError(err.message);
    setLoading(false);
  };

  const generatePieData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      name: item.category || 'Unknown',
      value: item.value || 0
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          statsData,
          predictionsData,
          userBehaviorData,
          inventoryData,
          correlationData,
          trendData
        ] = await Promise.all([
          analytics.getStats(startDate, endDate, filters),
          analytics.getPredictions(filters),
          analytics.getUserBehavior(filters),
          analytics.getInventoryAnalytics(filters),
          analytics.getCorrelationData(filters),
          analytics.getTrendData(filters)
        ]);

        // Ensure stats has all required properties
        setStats({
          ...statsData.data,
          totalBooks: statsData.data?.totalBooks || 0,
          activeUsers: statsData.data?.activeUsers || 0,
          averageRating: statsData.data?.averageRating || 0,
          totalLendings: statsData.data?.totalLendings || 0,
          activeLendings: statsData.data?.activeLendings || 0,
          overdueBooks: statsData.data?.overdueBooks || 0,
          metrics: statsData.data?.metrics || {},
          categories: statsData.data?.categories || [],
          booksByGenre: statsData.data?.booksByGenre || {},
          lendingsByMonth: statsData.data?.lendingsByMonth || {},
          timeline: statsData.data?.timeline || [],
          comparisonTimeline: statsData.data?.comparisonTimeline || [],
          mostBorrowedBooks: statsData.data?.mostBorrowedBooks || [],
          mostActiveMembers: statsData.data?.mostActiveMembers || [],
          highestRatedBooks: statsData.data?.highestRatedBooks || [],
        });

        // Set predictions data
        setPredictions(predictionsData.data || {
          demandForecast: [],
          popularityTrends: [],
          returnPredictions: [],
          genreTrends: [],
        });

        // Set user behavior data
        setUserBehavior(userBehaviorData.data || {
          userSegments: [],
          activityTrends: [],
          riskAssessments: [],
          retentionMetrics: { currentRate: 0, previousRate: 0, trend: 'FLAT' },
          engagementScores: [],
        });

        // Set inventory analytics data
        setInventoryAnalytics(inventoryData.data || {
          stockLevels: [],
          turnoverRates: [],
          reorderPoints: [],
          costAnalysis: [],
        });

        // Set correlation data
        setCorrelationData(correlationData.data || []);

        // Set trend data
        setTrendData(trendData.data || []);

        setError(null);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, filters]);

  const fetchStats = async () => {
    try {
      const response = await analytics.getStats(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPredictions = async () => {
    try {
      const response = await analytics.getPredictions();
      setPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    }
  };

  const fetchUserBehavior = async () => {
    try {
      const response = await analytics.getUserBehavior();
      setUserBehavior(response.data);
    } catch (error) {
      console.error('Error fetching user behavior:', error);
    }
  };

  const fetchInventoryAnalytics = async () => {
    try {
      const response = await analytics.getInventoryAnalytics();
      setInventoryAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
    }
  };

  const handleExport = async (type, format = 'excel') => {
    try {
      const exportFn = format === 'pdf' ? analytics.exportToPdf : analytics.exportAnalytics;
      const response = await exportFn(
        type,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `library-${type}-${format}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
    }
  };

  const handleSavePreset = (preset) => {
    setFilterPresets([...filterPresets, preset]);
  };

  const handleLoadPreset = (preset) => {
    setFilters(preset.filters);
  };

  const handleApplyTemplate = (template) => {
    if (template.replaceExisting) {
      setDashboardWidgets(template.widgets);
    } else {
      setDashboardWidgets([...dashboardWidgets, ...template.widgets]);
    }
    setShowTemplates(false);
  };

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'radar':
        return (
          <RadarChart
            data={generateRadarData()}
            config={{ height: widget.height - 80 }}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={generatePieData()}
            config={{ height: widget.height - 80 }}
          />
        );
      case 'comparative':
        return (
          <ComparativeChart
            data={generateComparativeData()}
            config={{ height: widget.height - 80 }}
          />
        );
      case 'heatmap':
        return (
          <HeatmapChart
            data={generateHeatmapData(userBehavior)}
            config={{ height: widget.height - 80 }}
          />
        );
      case 'bubble':
        return (
          <BubbleChart
            data={generateBubbleData(inventoryAnalytics)}
            config={{ height: widget.height - 80 }}
          />
        );
      case 'correlation':
        return (
          <CorrelationMatrix
            data={correlationData}
            config={{
              height: widget.height - 80,
              metrics: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
            }}
          />
        );
      case 'trend':
        return (
          <TrendPrediction
            data={trendData}
            config={{
              height: widget.height - 80,
              metrics: [
                {
                  key: 'checkouts',
                  label: 'Checkouts',
                  color: theme.palette.primary.main,
                },
                {
                  key: 'activeUsers',
                  label: 'Active Users',
                  color: theme.palette.secondary.main,
                },
              ],
            }}
          />
        );
      case 'statistical':
        return (
          <StatisticalAnalysis
            data={stats}
            config={{
              height: widget.height - 80,
              metrics: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
              seasonalityPeriods: [7, 30, 365],
              regressionTypes: ['linear', 'exponential', 'polynomial'],
            }}
          />
        );
      case 'advanced-stats':
        return (
          <AdvancedStatistics
            data={stats}
            config={{
              height: widget.height - 80,
              metrics: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
              categories: ['fiction', 'non-fiction', 'academic', 'children'],
              timeRanges: ['daily', 'weekly', 'monthly'],
            }}
          />
        );
      case 'data-explorer':
        return (
          <DataExplorer
            data={stats}
            config={{
              height: widget.height - 80,
              fields: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
                'category',
                'date',
              ],
              numericalFields: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
              categoricalFields: ['category'],
              dateFields: ['date'],
            }}
          />
        );
      case 'timeseries':
        return (
          <TimeSeriesAnalysis
            data={stats}
            config={{
              height: widget.height - 80,
              metrics: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
              dateField: 'date',
              defaultMetric: 'checkouts',
              forecastHorizon: 30,
            }}
          />
        );
      case 'cluster':
        return (
          <ClusterAnalysis
            data={stats}
            config={{
              height: widget.height - 80,
              numericalFields: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
              defaultFields: ['checkouts', 'activeUsers'],
            }}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '80vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  const genreData = Object.entries(stats?.booksByGenre || {}).map(([name, value]) => ({
    name,
    value,
  }));

  const lendingData = Object.entries(stats?.lendingsByMonth || {}).map(([month, count]) => ({
    month,
    count,
  }));

  const generateComparativeData = (stats, filters) => {
    if (!stats) return [];
    
    // Transform stats data based on selected time range and comparison type
    const currentData = stats.timeline || [];
    const previousData = stats.comparisonTimeline || [];
    
    return currentData.map((item, index) => ({
      period: item.date,
      current: item.value,
      previous: previousData[index]?.value || 0,
    }));
  };

  const generateRadarData = (userBehavior) => {
    if (!userBehavior) return [];
    
    return [
      { metric: 'Engagement', score: userBehavior.avgEngagementScore || 0 },
      { metric: 'Retention', score: userBehavior.avgRetentionScore || 0 },
      { metric: 'Activity', score: userBehavior.avgActivityScore || 0 },
      { metric: 'Satisfaction', score: userBehavior.avgSatisfactionScore || 0 },
      { metric: 'Diversity', score: userBehavior.avgDiversityScore || 0 },
    ];
  };

  const generateUserSegmentData = (userBehavior) => {
    if (!userBehavior?.userSegments) return [];
    
    const segments = userBehavior.userSegments.reduce((acc, user) => {
      acc[user.segment] = (acc[user.segment] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(segments).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  };

  const generateGenreData = (inventoryAnalytics) => {
    if (!inventoryAnalytics?.inventoryHealth) return [];
    
    const genres = inventoryAnalytics.inventoryHealth.reduce((acc, item) => {
      acc[item.genre] = (acc[item.genre] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(genres).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const generateInventoryStatusData = (inventoryAnalytics) => {
    if (!inventoryAnalytics?.inventoryHealth) return [];
    
    const status = inventoryAnalytics.inventoryHealth.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(status).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  };

  const generateHeatmapData = (userBehavior) => {
    if (!userBehavior?.activityPatterns) return [];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const data = [];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const activity = userBehavior.activityPatterns?.[day]?.[hour] || 0;
        data.push({
          day,
          hour,
          activity,
          dayName: days[day],
        });
      }
    }

    return data;
  };

  const generateBubbleData = (inventoryAnalytics) => {
    if (!inventoryAnalytics?.bookPerformance) return [];

    return Object.entries(inventoryAnalytics.bookPerformance).map(([genre, books]) => ({
      name: genre,
      data: books.map(book => ({
        name: book.title,
        x: book.popularityScore * 100,
        y: book.turnoverRate,
        z: book.demandLevel,
      })),
    }));
  };

  return (
    <Grid container spacing={3}>
      {/* Controls */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowDataExplorer(!showDataExplorer)}
          >
            {showDataExplorer ? 'Hide Data Explorer' : 'Show Data Explorer'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowTimeSeriesAnalysis(!showTimeSeriesAnalysis)}
          >
            {showTimeSeriesAnalysis ? 'Hide Time Series' : 'Show Time Series'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowClusterAnalysis(!showClusterAnalysis)}
          >
            {showClusterAnalysis ? 'Hide Clustering' : 'Show Clustering'}
          </Button>
        </Box>
      </Grid>

      {/* Dashboard Templates */}
      {showTemplates && (
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Dashboard Templates
            </Typography>
            <DashboardTemplates onApplyTemplate={handleApplyTemplate} />
          </Paper>
        </Grid>
      )}

      {/* Date Range and Export Controls */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <Box>
              <Button
                variant="outlined"
                onClick={() => handleExport('lending-history')}
                sx={{ mr: 1 }}
              >
                Export Lending History
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleExport('analytics')}
              >
                Export Analytics Report
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Analytics Filter */}
      <Grid item xs={12}>
        <AnalyticsFilter
          filters={filters}
          onFilterChange={setFilters}
          availableFilters={AVAILABLE_FILTERS}
        />
      </Grid>

      {/* Advanced Filters */}
      <Grid item xs={12}>
        <AdvancedFilters
          filters={filters}
          onFilterChange={setFilters}
          availableFilters={AVAILABLE_FILTERS}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          presets={filterPresets}
        />
      </Grid>

      {/* Summary Cards */}
      <Grid item xs={12} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Total Books</Typography>
          <Typography variant="h4">{stats.totalBooks}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Active Members</Typography>
          <Typography variant="h4">{stats.activeUsers}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Active Lendings</Typography>
          <Typography variant="h4">{stats.activeLendings}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={3}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6">Overdue Books</Typography>
          <Typography variant="h4" color="error">{stats.overdueBooks}</Typography>
        </Paper>
      </Grid>

      {/* Recommended Books */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recommended for You
          </Typography>
          <BookRecommendations />
        </Paper>
      </Grid>

      {/* Predictive Analytics */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Predictive Analytics
          </Typography>
          {predictions && <PredictiveAnalytics predictions={predictions} />}
        </Paper>
      </Grid>

      {/* User Behavior Analytics */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              User Behavior Analytics
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => handleExport('user-behavior', 'excel')}
                sx={{ mr: 1 }}
              >
                Export to Excel
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleExport('user-behavior', 'pdf')}
              >
                Export to PDF
              </Button>
            </Box>
          </Box>
          {userBehavior && <UserBehaviorAnalytics data={userBehavior} />}
        </Paper>
      </Grid>

      {/* Inventory Analytics */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Inventory Analytics
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={() => handleExport('inventory', 'excel')}
                sx={{ mr: 1 }}
              >
                Export to Excel
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleExport('inventory', 'pdf')}
              >
                Export to PDF
              </Button>
            </Box>
          </Box>
          {inventoryAnalytics && <InventoryAnalytics data={inventoryAnalytics} />}
        </Paper>
      </Grid>

      {/* Advanced Visualizations */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Analytics
          </Typography>
          <Grid container spacing={3}>
            {/* Heatmap - User Activity Patterns */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                User Activity Patterns
              </Typography>
              <HeatmapChart
                data={generateHeatmapData(userBehavior)}
                config={{
                  height: 400,
                  xAxisKey: 'hour',
                  yAxisKey: 'day',
                  valueKey: 'activity',
                  xLabel: 'Hour of Day',
                  yLabel: 'Day of Week',
                  valueLabel: 'Activity Level',
                }}
              />
            </Grid>

            {/* Bubble Chart - Book Performance */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Book Performance Analysis
              </Typography>
              <BubbleChart
                data={generateBubbleData(inventoryAnalytics)}
                config={{
                  height: 400,
                  xAxisKey: 'popularity',
                  yAxisKey: 'turnover',
                  zAxisKey: 'demand',
                  xLabel: 'Popularity Score',
                  yLabel: 'Turnover Rate',
                  zLabel: 'Demand Level',
                  series: [
                    { name: 'Fiction', data: [] },
                    { name: 'Non-Fiction', data: [] },
                    { name: 'Academic', data: [] },
                  ],
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Comparative Analytics */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Comparative Analytics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ComparativeChart
                data={generateComparativeData(stats, filters)}
                config={{
                  height: 300,
                  xAxisKey: 'period',
                  series: [
                    { dataKey: 'current', name: 'Current Period' },
                    { dataKey: 'previous', name: 'Previous Period' },
                  ],
                  showChangePercentage: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RadarChart
                data={generateRadarData(userBehavior)}
                config={{
                  height: 300,
                  nameKey: 'metric',
                  series: [
                    { dataKey: 'score', name: 'Performance Score' },
                  ],
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Distribution Charts */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Distribution Analysis
          </Typography>
          <Grid container spacing={3}>
            {/* User Segments */}
            <Grid item xs={12} md={4}>
              <CustomPieChart
                data={generateUserSegmentData(userBehavior)}
                config={{
                  height: 300,
                  dataKey: 'value',
                  nameKey: 'name',
                  innerRadius: '60%',
                }}
              />
              <Typography variant="subtitle1" align="center" gutterBottom>
                User Segments Distribution
              </Typography>
            </Grid>
            {/* Genre */}
            <Grid item xs={12} md={4}>
              <CustomPieChart
                data={generateGenreData(inventoryAnalytics)}
                config={{
                  height: 300,
                  dataKey: 'value',
                  nameKey: 'name',
                }}
              />
              <Typography variant="subtitle1" align="center" gutterBottom>
                Genre Distribution
              </Typography>
            </Grid>
            {/* Inventory Status */}
            <Grid item xs={12} md={4}>
              <CustomPieChart
                data={generateInventoryStatusData(inventoryAnalytics)}
                config={{
                  height: 300,
                  dataKey: 'value',
                  nameKey: 'name',
                  innerRadius: '50%',
                }}
              />
              <Typography variant="subtitle1" align="center" gutterBottom>
                Inventory Status Distribution
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Customizable Dashboard */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Custom Dashboard
          </Typography>
          <CustomDashboard
            widgets={dashboardWidgets}
            onWidgetsChange={setDashboardWidgets}
            renderWidget={renderWidget}
          />
        </Paper>
      </Grid>

      {/* Interactive Data Explorer */}
      {showDataExplorer && (
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Interactive Data Explorer
            </Typography>
            <DataExplorer
              data={stats}
              config={{
                fields: [
                  'checkouts',
                  'returns',
                  'renewals',
                  'newUsers',
                  'activeUsers',
                  'retention',
                  'category',
                  'date',
                ],
                numericalFields: [
                  'checkouts',
                  'returns',
                  'renewals',
                  'newUsers',
                  'activeUsers',
                  'retention',
                ],
                categoricalFields: ['category'],
                dateFields: ['date'],
              }}
            />
          </Paper>
        </Grid>
      )}

      {/* Advanced Statistical Analysis */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Advanced Statistical Analysis
          </Typography>
          <AdvancedStatistics
            data={stats}
            config={{
              metrics: [
                'checkouts',
                'returns',
                'renewals',
                'newUsers',
                'activeUsers',
                'retention',
              ],
              categories: ['fiction', 'non-fiction', 'academic', 'children'],
              timeRanges: ['daily', 'weekly', 'monthly'],
            }}
          />
        </Paper>
      </Grid>

      {/* Time Series Analysis */}
      {showTimeSeriesAnalysis && (
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Time Series Analysis
            </Typography>
            <TimeSeriesAnalysis
              data={stats}
              config={{
                metrics: [
                  'checkouts',
                  'returns',
                  'renewals',
                  'newUsers',
                  'activeUsers',
                  'retention',
                ],
                dateField: 'date',
                defaultMetric: 'checkouts',
                forecastHorizon: 30,
              }}
            />
          </Paper>
        </Grid>
      )}

      {/* Cluster Analysis */}
      {showClusterAnalysis && (
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cluster Analysis
            </Typography>
            <ClusterAnalysis
              data={stats}
              config={{
                numericalFields: [
                  'checkouts',
                  'returns',
                  'renewals',
                  'newUsers',
                  'activeUsers',
                  'retention',
                ],
                defaultFields: ['checkouts', 'activeUsers'],
              }}
            />
          </Paper>
        </Grid>
      )}

      {/* Charts */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Monthly Lendings</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Lendings" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Books by Genre</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genreData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Top Items Lists */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Most Borrowed Books</Typography>
            <List>
              {stats.mostBorrowedBooks.slice(0, 5).map((book) => (
                <ListItem key={book.id}>
                  <ListItemText
                    primary={book.name}
                    secondary={`${book.count} times borrowed`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Most Active Members</Typography>
            <List>
              {stats.mostActiveMembers.slice(0, 5).map((member) => (
                <ListItem key={member.id}>
                  <ListItemText
                    primary={member.name}
                    secondary={`${member.count} books borrowed`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Highest Rated Books</Typography>
            <List>
              {stats.highestRatedBooks.slice(0, 5).map((book) => (
                <ListItem key={book.id}>
                  <ListItemText
                    primary={book.name}
                    secondary={`Rating: ${book.rating.toFixed(1)}/5`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
