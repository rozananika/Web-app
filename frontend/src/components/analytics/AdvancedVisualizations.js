import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Slider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Info as InfoIcon,
  GetApp as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Surface,
  Symbols,
} from 'recharts';
import * as d3 from 'd3';

// 3D Surface Plot implementation
const SurfacePlot = ({ data, xField, yField, zField, width = 500, height = 500 }) => {
  const [rotation, setRotation] = useState({ x: 45, y: 45, z: 0 });
  
  const points = useMemo(() => {
    const xValues = [...new Set(data.map(d => d[xField]))].sort((a, b) => a - b);
    const yValues = [...new Set(data.map(d => d[yField]))].sort((a, b) => a - b);
    
    const grid = Array(xValues.length).fill().map(() => Array(yValues.length));
    data.forEach(d => {
      const xi = xValues.indexOf(d[xField]);
      const yi = yValues.indexOf(d[yField]);
      grid[xi][yi] = d[zField];
    });
    
    const points = [];
    for (let i = 0; i < xValues.length; i++) {
      for (let j = 0; j < yValues.length; j++) {
        points.push({
          x: xValues[i],
          y: yValues[j],
          z: grid[i][j],
          projected: project(xValues[i], yValues[j], grid[i][j], rotation),
        });
      }
    }
    return points;
  }, [data, xField, yField, zField, rotation]);
  
  const project = (x, y, z, rotation) => {
    // 3D rotation and projection
    const rad = Math.PI / 180;
    const cosa = Math.cos(rotation.x * rad);
    const sina = Math.sin(rotation.x * rad);
    const cosb = Math.cos(rotation.y * rad);
    const sinb = Math.sin(rotation.y * rad);
    const cosc = Math.cos(rotation.z * rad);
    const sinc = Math.sin(rotation.z * rad);
    
    const x1 = x;
    const y1 = y * cosa - z * sina;
    const z1 = y * sina + z * cosa;
    
    const x2 = x1 * cosb + z1 * sinb;
    const y2 = y1;
    const z2 = -x1 * sinb + z1 * cosb;
    
    const x3 = x2 * cosc - y2 * sinc;
    const y3 = x2 * sinc + y2 * cosc;
    
    // Scale and translate
    const scale = 100;
    return {
      x: width/2 + scale * x3,
      y: height/2 + scale * y3,
      z: z2,
    };
  };
  
  return (
    <svg width={width} height={height}>
      <g>
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.projected.x}
            cy={point.projected.y}
            r={3}
            fill={`hsl(${240 + point.z * 120}deg, 70%, 50%)`}
            opacity={0.7 + 0.3 * (point.projected.z + 1) / 2}
          />
        ))}
      </g>
      <g transform={`translate(${width-100},${height-100})`}>
        <text x={0} y={-60}>Rotation</text>
        <g transform="translate(0,-50)">
          {['x', 'y', 'z'].map((axis, i) => (
            <g key={axis} transform={`translate(0,${i*20})`}>
              <text x={-10} y={15}>{axis}</text>
              <Slider
                value={rotation[axis]}
                onChange={(_, value) => setRotation({ ...rotation, [axis]: value })}
                min={0}
                max={360}
                sx={{ width: 80 }}
              />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};

// Heatmap implementation
const Heatmap = ({ data, xField, yField, valueField, width = 500, height = 500 }) => {
  const cellData = useMemo(() => {
    const xValues = [...new Set(data.map(d => d[xField]))].sort((a, b) => a - b);
    const yValues = [...new Set(data.map(d => d[yField]))].sort((a, b) => a - b);
    
    const grid = Array(xValues.length).fill().map(() => Array(yValues.length));
    const values = [];
    
    data.forEach(d => {
      const xi = xValues.indexOf(d[xField]);
      const yi = yValues.indexOf(d[yField]);
      grid[xi][yi] = d[valueField];
      values.push(d[valueField]);
    });
    
    const colorScale = d3.scaleSequential()
      .domain([Math.min(...values), Math.max(...values)])
      .interpolator(d3.interpolateViridis);
    
    const cells = [];
    const cellWidth = (width - 100) / xValues.length;
    const cellHeight = (height - 100) / yValues.length;
    
    for (let i = 0; i < xValues.length; i++) {
      for (let j = 0; j < yValues.length; j++) {
        cells.push({
          x: 50 + i * cellWidth,
          y: 50 + j * cellHeight,
          width: cellWidth,
          height: cellHeight,
          value: grid[i][j],
          color: colorScale(grid[i][j]),
          xLabel: xValues[i],
          yLabel: yValues[j],
        });
      }
    }
    
    return {
      cells,
      xValues,
      yValues,
      cellWidth,
      cellHeight,
    };
  }, [data, xField, yField, valueField, width, height]);
  
  return (
    <svg width={width} height={height}>
      <g>
        {cellData.cells.map((cell, i) => (
          <g key={i}>
            <rect
              x={cell.x}
              y={cell.y}
              width={cell.width}
              height={cell.height}
              fill={cell.color}
            >
              <title>
                {`${xField}: ${cell.xLabel}\n${yField}: ${cell.yLabel}\n${valueField}: ${cell.value}`}
              </title>
            </rect>
          </g>
        ))}
      </g>
      {/* X-axis */}
      <g transform={`translate(50,${height-45})`}>
        {cellData.xValues.map((value, i) => (
          <text
            key={i}
            x={i * cellData.cellWidth + cellData.cellWidth/2}
            y={0}
            textAnchor="middle"
            transform="rotate(-45)"
          >
            {value}
          </text>
        ))}
        <text
          x={(width-100)/2}
          y={40}
          textAnchor="middle"
        >
          {xField}
        </text>
      </g>
      {/* Y-axis */}
      <g transform="translate(45,50)">
        {cellData.yValues.map((value, i) => (
          <text
            key={i}
            x={0}
            y={i * cellData.cellHeight + cellData.cellHeight/2}
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {value}
          </text>
        ))}
        <text
          x={-40}
          y={(height-100)/2}
          textAnchor="middle"
          transform="rotate(-90)"
        >
          {yField}
        </text>
      </g>
    </svg>
  );
};

// Parallel Coordinates implementation
const ParallelCoordinates = ({ data, dimensions, width = 500, height = 500 }) => {
  const [activeDimension, setActiveDimension] = useState(null);
  const [brushExtents, setBrushExtents] = useState({});
  
  const scales = useMemo(() => {
    const scales = {};
    dimensions.forEach(dim => {
      const values = data.map(d => d[dim]);
      scales[dim] = d3.scaleLinear()
        .domain([Math.min(...values), Math.max(...values)])
        .range([height-50, 50]);
    });
    return scales;
  }, [data, dimensions, height]);
  
  const dimensionX = d3.scalePoint()
    .domain(dimensions)
    .range([50, width-50]);
  
  const line = d3.line()
    .x(d => dimensionX(d.dimension))
    .y(d => scales[d.dimension](d.value));
  
  const filteredData = useMemo(() => {
    return data.filter(d => {
      return Object.entries(brushExtents).every(([dim, [min, max]]) => {
        const value = scales[dim].invert(d[dim]);
        return value >= min && value <= max;
      });
    });
  }, [data, brushExtents, scales]);
  
  const handleBrush = (dimension, [y0, y1]) => {
    if (y0 === y1) {
      const newBrushExtents = { ...brushExtents };
      delete newBrushExtents[dimension];
      setBrushExtents(newBrushExtents);
    } else {
      setBrushExtents({
        ...brushExtents,
        [dimension]: [scales[dimension].invert(y0), scales[dimension].invert(y1)],
      });
    }
  };
  
  return (
    <svg width={width} height={height}>
      <g>
        {/* Draw dimension axes */}
        {dimensions.map(dim => (
          <g
            key={dim}
            transform={`translate(${dimensionX(dim)},0)`}
            onMouseEnter={() => setActiveDimension(dim)}
            onMouseLeave={() => setActiveDimension(null)}
          >
            <line
              y1={50}
              y2={height-50}
              stroke="black"
              strokeWidth={1}
            />
            <text
              y={height-35}
              textAnchor="middle"
              transform="rotate(-45)"
            >
              {dim}
            </text>
            {activeDimension === dim && (
              <rect
                x={-10}
                y={50}
                width={20}
                height={height-100}
                fill="transparent"
                stroke="blue"
                strokeWidth={1}
                style={{ cursor: 'ns-resize' }}
                onMouseDown={e => {
                  const startY = e.clientY;
                  const startExtent = brushExtents[dim] || [
                    scales[dim].invert(height-50),
                    scales[dim].invert(50),
                  ];
                  
                  const handleMouseMove = e => {
                    const dy = e.clientY - startY;
                    const newExtent = startExtent.map(v =>
                      scales[dim].invert(scales[dim](v) + dy)
                    );
                    handleBrush(dim, newExtent.map(v => scales[dim](v)));
                  };
                  
                  const handleMouseUp = () => {
                    window.removeEventListener('mousemove', handleMouseMove);
                    window.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  window.addEventListener('mousemove', handleMouseMove);
                  window.addEventListener('mouseup', handleMouseUp);
                }}
              />
            )}
          </g>
        ))}
        
        {/* Draw lines */}
        {filteredData.map((d, i) => (
          <path
            key={i}
            d={line(dimensions.map(dim => ({
              dimension: dim,
              value: d[dim],
            })))}
            fill="none"
            stroke="steelblue"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}
      </g>
    </svg>
  );
};

export default function AdvancedVisualizations({ data, config }) {
  const {
    fields = [],
    numericalFields = [],
    defaultFields = numericalFields.slice(0, 3),
  } = config;

  const [visualizationType, setVisualizationType] = useState('3d');
  const [xField, setXField] = useState(defaultFields[0]);
  const [yField, setYField] = useState(defaultFields[1]);
  const [zField, setZField] = useState(defaultFields[2]);
  const [dimensions, setDimensions] = useState(defaultFields);

  const handleExport = () => {
    const exportData = {
      type: visualizationType,
      data: data.map(d => ({
        x: d[xField],
        y: d[yField],
        z: d[zField],
        ...dimensions.reduce((acc, dim) => ({
          ...acc,
          [dim]: d[dim],
        }), {}),
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visualization_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      {/* Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Visualization Type</InputLabel>
              <Select
                value={visualizationType}
                onChange={(e) => setVisualizationType(e.target.value)}
              >
                <MenuItem value="3d">3D Surface Plot</MenuItem>
                <MenuItem value="heatmap">Heatmap</MenuItem>
                <MenuItem value="parallel">Parallel Coordinates</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {visualizationType !== 'parallel' && (
            <>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>X Field</InputLabel>
                  <Select
                    value={xField}
                    onChange={(e) => setXField(e.target.value)}
                  >
                    {numericalFields.map((field) => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Y Field</InputLabel>
                  <Select
                    value={yField}
                    onChange={(e) => setYField(e.target.value)}
                  >
                    {numericalFields.map((field) => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {visualizationType === '3d' && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Z Field</InputLabel>
                    <Select
                      value={zField}
                      onChange={(e) => setZField(e.target.value)}
                    >
                      {numericalFields.map((field) => (
                        <MenuItem key={field} value={field}>
                          {field}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </>
          )}
          {visualizationType === 'parallel' && (
            <Grid item xs={12} md={9}>
              <FormControl fullWidth>
                <InputLabel>Dimensions</InputLabel>
                <Select
                  multiple
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                >
                  {numericalFields.map((field) => (
                    <MenuItem key={field} value={field}>
                      {field}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Visualization */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            {visualizationType === '3d' ? '3D Surface Plot' :
             visualizationType === 'heatmap' ? 'Heatmap' :
             'Parallel Coordinates'}
          </Typography>
          <IconButton onClick={handleExport}>
            <DownloadIcon />
          </IconButton>
        </Box>
        <Box sx={{ height: 500 }}>
          {visualizationType === '3d' && (
            <SurfacePlot
              data={data}
              xField={xField}
              yField={yField}
              zField={zField}
              width={800}
              height={500}
            />
          )}
          {visualizationType === 'heatmap' && (
            <Heatmap
              data={data}
              xField={xField}
              yField={yField}
              valueField={zField}
              width={800}
              height={500}
            />
          )}
          {visualizationType === 'parallel' && (
            <ParallelCoordinates
              data={data}
              dimensions={dimensions}
              width={800}
              height={500}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
