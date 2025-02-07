import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
        <p style={{ margin: 0 }}>{`${data.xLabel}: ${data.x}`}</p>
        <p style={{ margin: 0 }}>{`${data.yLabel}: ${data.y}`}</p>
        <p style={{ margin: 0 }}>{`${data.zLabel}: ${data.z}`}</p>
      </div>
    );
  }
  return null;
};

export default function BubbleChart({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 400,
    xAxisKey = 'x',
    yAxisKey = 'y',
    zAxisKey = 'z',
    xLabel = 'X Axis',
    yLabel = 'Y Axis',
    zLabel = 'Size',
    series,
    colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main,
    ],
  } = config;

  const enrichedData = series.map((serie, index) => ({
    name: serie.name,
    data: serie.data.map(item => ({
      ...item,
      xLabel,
      yLabel,
      zLabel,
      color: colors[index % colors.length],
    })),
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 60,
        }}
      >
        <XAxis
          type="number"
          dataKey={xAxisKey}
          name={xLabel}
          tick={{ fill: theme.palette.text.secondary }}
          label={{
            value: xLabel,
            position: 'bottom',
            fill: theme.palette.text.primary,
          }}
        />
        <YAxis
          type="number"
          dataKey={yAxisKey}
          name={yLabel}
          tick={{ fill: theme.palette.text.secondary }}
          label={{
            value: yLabel,
            angle: -90,
            position: 'left',
            fill: theme.palette.text.primary,
          }}
        />
        <ZAxis
          type="number"
          dataKey={zAxisKey}
          range={[400, 4000]}
          name={zLabel}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {enrichedData.map((serie, index) => (
          <Scatter
            key={serie.name}
            name={serie.name}
            data={serie.data}
            fill={colors[index % colors.length]}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
