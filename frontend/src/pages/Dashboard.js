import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analytics, books, lendings } from '../services/api';
import { DateRangePicker } from '../components/DateRangePicker';

const OverallStats = ({ data }) => (
  <Grid container spacing={3}>
    {data.map((stat, index) => (
      <Grid item xs={12} md={6} lg={3} key={index}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              {stat.label}
            </Typography>
            <Typography variant="h4" color={stat.color || 'textPrimary'}>
              {stat.value}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

const BarChartComponent = ({ title, data, xKey, barDataKey, color }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {data ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} />
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey={barDataKey} fill={color || '#8884d8'} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography color="textSecondary">No data available</Typography>
      )}
    </CardContent>
  </Card>
);

const LineChartComponent = ({ title, data, lines }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {data ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.dataKey}
                stroke={line.color}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Typography color="textSecondary">No data available</Typography>
      )}
    </CardContent>
  </Card>
);

const PieChartComponent = ({ title, data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {data ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
              ))}
            </Pie>
            <RechartsTooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Typography color="textSecondary">No data available</Typography>
      )}
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date(),
  ]);
  const [data, setData] = useState({ overall: [], books: null, lendings: null, users: null });
  const [exportAnchorEl, setExportAnchorEl] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [startDate, endDate] = dateRange;

      const [overall, books, lendings, users] = await Promise.all([
        analytics.getStats(startDate, endDate),
        books.getStats(startDate, endDate),
        lendings.getStats(startDate, endDate),
        analytics.getUserBehavior(startDate, endDate),
      ]);

      setData({
        overall: overall.data,
        books: books.data,
        lendings: lendings.data,
        users: users.data,
      });
    } catch (err) {
      setError('Failed to fetch dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const [startDate, endDate] = dateRange;
      const response = await analytics.exportDashboard({
        format,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard.${format}`;
      link.click();
    } catch (err) {
      setError('Export failed. Please try again.');
    } finally {
      setExportAnchorEl(null);
    }
  };

  return (
    <Box p={3}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Dashboard</Typography>
            <Box>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <IconButton onClick={fetchDashboardData}><RefreshIcon /></IconButton>
              <IconButton onClick={(e) => setExportAnchorEl(e.currentTarget)}><ExportIcon /></IconButton>
            </Box>
          </Box>
        </Grid>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : (
          <>
            <OverallStats data={data.overall} />

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Books" />
              <Tab label="Lendings" />
              <Tab label="Users" />
            </Tabs>

            {activeTab === 0 && <BarChartComponent title="Book Stats" data={data.books} xKey="title" barDataKey="count" />}
            {activeTab === 1 && <LineChartComponent title="Lending Trends" data={data.lendings} lines={[{ dataKey: 'borrowed', color: '#8884d8', name: 'Borrowed' }]} />}
            {activeTab === 2 && <PieChartComponent title="User Stats" data={data.users} />}
          </>
        )}
      </Grid>

      <Menu
        anchorEl={exportAnchorEl}
        open={Boolean(exportAnchorEl)}
        onClose={() => setExportAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
        <MenuItem onClick={() => handleExport('json')}>Export as JSON</MenuItem>
      </Menu>
    </Box>
  );
}
