import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: entry.color }}
          >
            {`${entry.name}: ${entry.value.toFixed(2)}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

export default function TrendPrediction({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 400,
    xAxisKey = 'date',
    metrics = [],
    confidenceInterval = true,
    showPredictionStart = true,
  } = config;

  const predictionStartIndex = data.findIndex(d => d.isPrediction);

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fill: theme.palette.text.secondary }}
        />
        <YAxis tick={{ fill: theme.palette.text.secondary }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />

        {showPredictionStart && predictionStartIndex >= 0 && (
          <ReferenceLine
            x={data[predictionStartIndex][xAxisKey]}
            stroke={theme.palette.warning.main}
            strokeDasharray="3 3"
            label={{
              value: 'Prediction Start',
              position: 'top',
              fill: theme.palette.warning.main,
            }}
          />
        )}

        {metrics.map((metric, index) => (
          <React.Fragment key={metric.key}>
            <Line
              type="monotone"
              dataKey={metric.key}
              name={metric.label}
              stroke={metric.color || theme.palette.primary.main}
              strokeWidth={2}
              dot={false}
            />
            {confidenceInterval && (
              <>
                <Line
                  type="monotone"
                  dataKey={`${metric.key}_upper`}
                  stroke={metric.color || theme.palette.primary.main}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  legendType="none"
                />
                <Line
                  type="monotone"
                  dataKey={`${metric.key}_lower`}
                  stroke={metric.color || theme.palette.primary.main}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  legendType="none"
                />
              </>
            )}
          </React.Fragment>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
