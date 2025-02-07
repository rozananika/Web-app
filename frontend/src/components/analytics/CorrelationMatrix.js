import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Typography, Box } from '@mui/material';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
          {`${data.xMetric} vs ${data.yMetric}`}
        </Typography>
        <Typography variant="body2">
          {`Correlation: ${data.correlation.toFixed(3)}`}
        </Typography>
        <Typography variant="body2">
          {`Significance: ${data.significance}`}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function CorrelationMatrix({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 400,
    metrics = [],
    correlationThreshold = 0.3,
  } = config;

  const getCorrelationColor = (correlation) => {
    const absCorr = Math.abs(correlation);
    if (absCorr < correlationThreshold) return theme.palette.grey[300];
    return correlation > 0 
      ? theme.palette.success.main 
      : theme.palette.error.main;
  };

  const getSignificance = (correlation) => {
    const absCorr = Math.abs(correlation);
    if (absCorr < 0.3) return 'Weak';
    if (absCorr < 0.7) return 'Moderate';
    return 'Strong';
  };

  const correlationData = metrics.flatMap((xMetric, i) =>
    metrics.slice(i + 1).map((yMetric) => {
      const correlation = data[`${xMetric}_${yMetric}`] || 0;
      return {
        xMetric,
        yMetric,
        x: i,
        y: metrics.indexOf(yMetric),
        correlation,
        significance: getSignificance(correlation),
        color: getCorrelationColor(correlation),
        size: Math.abs(correlation) * 100,
      };
    })
  );

  return (
    <ResponsiveContainer width={width} height={height}>
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 60,
          left: 60,
        }}
      >
        <XAxis
          type="number"
          dataKey="x"
          name="x"
          domain={[0, metrics.length - 1]}
          ticks={metrics.map((_, i) => i)}
          tick={(props) => {
            const { x, y, payload } = props;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="middle"
                  fill={theme.palette.text.secondary}
                  transform="rotate(45)"
                >
                  {metrics[payload.value]}
                </text>
              </g>
            );
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="y"
          domain={[0, metrics.length - 1]}
          ticks={metrics.map((_, i) => i)}
          tick={(props) => {
            const { x, y, payload } = props;
            return (
              <text
                x={x}
                y={y}
                dx={-10}
                textAnchor="end"
                fill={theme.palette.text.secondary}
              >
                {metrics[payload.value]}
              </text>
            );
          }}
        />
        <ZAxis type="number" range={[50, 500]} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={correlationData}>
          {correlationData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
