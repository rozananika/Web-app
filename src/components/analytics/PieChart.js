import React from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
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
        <p style={{ margin: 0, fontWeight: 'bold' }}>{payload[0].name}</p>
        <p style={{ margin: 0 }}>
          {`Value: ${payload[0].value}`}
        </p>
        <p style={{ margin: 0 }}>
          {`Percentage: ${(payload[0].percent * 100).toFixed(1)}%`}
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChart({ data, config }) {
  const theme = useTheme();
  const {
    width = '100%',
    height = 300,
    dataKey,
    nameKey,
    colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.info.main,
    ],
    innerRadius = 0,
    outerRadius = '80%',
    showLabel = true,
  } = config;

  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPie margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabel ? renderCustomizedLabel : null}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey={dataKey}
          nameKey={nameKey}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
