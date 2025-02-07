import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
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
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{ margin: 0, color: entry.color }}
          >
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
        {payload.length === 2 && (
          <p style={{ margin: '4px 0 0 0', borderTop: '1px solid #eee', paddingTop: '4px' }}>
            {`Change: ${((payload[1].value - payload[0].value) / payload[0].value * 100).toFixed(1)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function ComparativeChart({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 300,
    xAxisKey,
    series,
    showGrid = true,
    layout = 'vertical',
    stackedBars = false,
    showChangePercentage = true,
  } = config;

  const calculateDomain = () => {
    if (!showChangePercentage) return ['auto', 'auto'];
    
    const allValues = data.flatMap(item =>
      series.map(s => item[s.dataKey])
    );
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1;
    
    return [minValue - padding, maxValue + padding];
  };

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 20, right: 30, left: 30, bottom: 10 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        
        {layout === 'horizontal' ? (
          <>
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              domain={calculateDomain()}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
          </>
        ) : (
          <>
            <XAxis
              type="number"
              domain={calculateDomain()}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
            <YAxis
              dataKey={xAxisKey}
              type="category"
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            />
          </>
        )}

        {showChangePercentage && <ReferenceLine x={0} stroke="#666" />}

        {series.map((serie, index) => (
          <Bar
            key={serie.dataKey}
            dataKey={serie.dataKey}
            name={serie.name}
            fill={serie.color || theme.palette.primary.main}
            stackId={stackedBars ? 'stack' : undefined}
          />
        ))}

        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </BarChart>
    </ResponsiveContainer>
  );
}
