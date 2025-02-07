import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

export default function TrendChart({ data, type = 'line', config = {} }) {
  const theme = useTheme();

  const {
    xKey = 'date',
    yKey = 'value',
    label = '',
    gradient = true,
    showLegend = true,
    height = 300,
    customTooltip,
  } = config;

  const gradientOffset = () => {
    if (!data.length) return 0;
    
    const dataMax = Math.max(...data.map(i => i[yKey]));
    const dataMin = Math.min(...data.map(i => i[yKey]));
    
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    
    return dataMax / (dataMax - dataMin);
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset={gradientOffset()}
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.8}
                />
                <stop
                  offset={gradientOffset()}
                  stopColor={theme.palette.error.main}
                  stopOpacity={0.8}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis tick={{ fill: theme.palette.text.secondary }} />
            {customTooltip ? (
              <Tooltip content={customTooltip} />
            ) : (
              <Tooltip />
            )}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yKey}
              name={label}
              stroke={theme.palette.primary.main}
              fill={gradient ? "url(#splitColor)" : theme.palette.primary.main}
            />
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis tick={{ fill: theme.palette.text.secondary }} />
            {customTooltip ? (
              <Tooltip content={customTooltip} />
            ) : (
              <Tooltip />
            )}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yKey}
              name={label}
              stroke={theme.palette.primary.main}
              dot={{ fill: theme.palette.primary.main }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
