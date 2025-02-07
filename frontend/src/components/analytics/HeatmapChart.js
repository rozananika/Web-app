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
        <p style={{ margin: 0, fontWeight: 'bold' }}>
          {`${data.xLabel}: ${data.x}`}
        </p>
        <p style={{ margin: 0 }}>
          {`${data.yLabel}: ${data.y}`}
        </p>
        <p style={{ margin: 0 }}>
          {`${data.valueLabel}: ${data.value}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function HeatmapChart({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 400,
    xAxisKey = 'x',
    yAxisKey = 'y',
    valueKey = 'value',
    xLabel = 'X Axis',
    yLabel = 'Y Axis',
    valueLabel = 'Value',
    minColor = theme.palette.primary.light,
    maxColor = theme.palette.primary.dark,
    dotSize = 800,
  } = config;

  const minValue = Math.min(...data.map(item => item[valueKey]));
  const maxValue = Math.max(...data.map(item => item[valueKey]));

  const getColor = (value) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    const hex = Math.round(ratio * 255).toString(16).padStart(2, '0');
    return `${maxColor}${hex}`;
  };

  const enrichedData = data.map(item => ({
    ...item,
    xLabel,
    yLabel,
    valueLabel,
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
          dataKey={valueKey}
          range={[dotSize / 2, dotSize]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Scatter data={enrichedData} shape="circle">
          {enrichedData.map((entry, index) => (
            <Cell
              key={index}
              fill={getColor(entry[valueKey])}
              fillOpacity={0.6}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
