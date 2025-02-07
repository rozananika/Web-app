import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: 0 }}>{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function RadarChart({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 300,
    dataKey,
    nameKey,
    series,
  } = config;

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsRadar
        data={data}
        margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
      >
        <PolarGrid stroke={theme.palette.divider} />
        <PolarAngleAxis
          dataKey={nameKey}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 'auto']}
          tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
        />
        {series.map((serie, index) => (
          <Radar
            key={serie.dataKey}
            name={serie.name}
            dataKey={serie.dataKey}
            stroke={serie.color || theme.palette.primary.main}
            fill={serie.color || theme.palette.primary.main}
            fillOpacity={0.3}
          />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}
