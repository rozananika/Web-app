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
  TextField,
  Button,
  Slider,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  GetApp as DownloadIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';

const AGGREGATION_FUNCTIONS = {
  sum: (values) => values.reduce((a, b) => a + b, 0),
  avg: (values) => values.reduce((a, b) => a + b, 0) / values.length,
  min: (values) => Math.min(...values),
  max: (values) => Math.max(...values),
  count: (values) => values.length,
};

const DataFilter = ({ filter, onFilterChange, onRemove }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={filter.field}
        onChange={(e) => onFilterChange({ ...filter, field: e.target.value })}
      >
        {filter.availableFields.map((field) => (
          <MenuItem key={field} value={field}>
            {field}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <Select
        value={filter.operator}
        onChange={(e) => onFilterChange({ ...filter, operator: e.target.value })}
      >
        <MenuItem value="eq">=</MenuItem>
        <MenuItem value="neq">≠</MenuItem>
        <MenuItem value="gt">&gt;</MenuItem>
        <MenuItem value="gte">≥</MenuItem>
        <MenuItem value="lt">&lt;</MenuItem>
        <MenuItem value="lte">≤</MenuItem>
        <MenuItem value="contains">Contains</MenuItem>
        <MenuItem value="between">Between</MenuItem>
      </Select>
    </FormControl>
    {filter.operator === 'between' ? (
      <>
        <TextField
          size="small"
          value={filter.value[0]}
          onChange={(e) => onFilterChange({
            ...filter,
            value: [e.target.value, filter.value[1]],
          })}
        />
        <Typography>and</Typography>
        <TextField
          size="small"
          value={filter.value[1]}
          onChange={(e) => onFilterChange({
            ...filter,
            value: [filter.value[0], e.target.value],
          })}
        />
      </>
    ) : (
      <TextField
        size="small"
        value={filter.value}
        onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}
      />
    )}
    <IconButton size="small" onClick={onRemove}>
      <FilterListIcon />
    </IconButton>
  </Box>
);

export default function DataExplorer({ data, config }) {
  const {
    fields = [],
    numericalFields = [],
    categoricalFields = [],
    dateFields = [],
  } = config;

  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [zAxis, setZAxis] = useState('');
  const [colorBy, setColorBy] = useState('');
  const [aggregateBy, setAggregateBy] = useState('');
  const [aggregateFunction, setAggregateFunction] = useState('sum');
  const [filters, setFilters] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [brushDomain, setBrushDomain] = useState(null);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply filters
    filters.forEach(filter => {
      result = result.filter(item => {
        const value = item[filter.field];
        switch (filter.operator) {
          case 'eq':
            return value === filter.value;
          case 'neq':
            return value !== filter.value;
          case 'gt':
            return value > filter.value;
          case 'gte':
            return value >= filter.value;
          case 'lt':
            return value < filter.value;
          case 'lte':
            return value <= filter.value;
          case 'contains':
            return String(value).toLowerCase().includes(filter.value.toLowerCase());
          case 'between':
            return value >= filter.value[0] && value <= filter.value[1];
          default:
            return true;
        }
      });
    });

    // Apply search
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply brush domain filter
    if (brushDomain) {
      result = result.filter(item =>
        item[xAxis] >= brushDomain.x[0] &&
        item[xAxis] <= brushDomain.x[1] &&
        item[yAxis] >= brushDomain.y[0] &&
        item[yAxis] <= brushDomain.y[1]
      );
    }

    return result;
  }, [data, filters, searchTerm, brushDomain, xAxis, yAxis]);

  const aggregatedData = useMemo(() => {
    if (!aggregateBy) return filteredData;

    const groups = {};
    filteredData.forEach(item => {
      const key = item[aggregateBy];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return Object.entries(groups).map(([key, items]) => ({
      [aggregateBy]: key,
      [yAxis]: AGGREGATION_FUNCTIONS[aggregateFunction](items.map(item => item[yAxis])),
      count: items.length,
    }));
  }, [filteredData, aggregateBy, aggregateFunction, yAxis]);

  const sortedData = useMemo(() => {
    if (!sortBy) return aggregatedData;

    return [...aggregatedData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortDirection === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }, [aggregatedData, sortBy, sortDirection]);

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      {
        field: fields[0],
        operator: 'eq',
        value: '',
        availableFields: fields,
      },
    ]);
  };

  const handleFilterChange = (index, newFilter) => {
    const newFilters = [...filters];
    newFilters[index] = newFilter;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleExport = () => {
    const jsonString = JSON.stringify(sortedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'explored_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleBrushChange = (domain) => {
    setBrushDomain(domain);
  };

  return (
    <Box>
      {/* Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>X Axis</InputLabel>
              <Select value={xAxis} onChange={(e) => setXAxis(e.target.value)}>
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
              <InputLabel>Y Axis</InputLabel>
              <Select value={yAxis} onChange={(e) => setYAxis(e.target.value)}>
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
              <InputLabel>Size By</InputLabel>
              <Select value={zAxis} onChange={(e) => setZAxis(e.target.value)}>
                <MenuItem value="">None</MenuItem>
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
              <InputLabel>Color By</InputLabel>
              <Select value={colorBy} onChange={(e) => setColorBy(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                {categoricalFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Aggregate By</InputLabel>
              <Select
                value={aggregateBy}
                onChange={(e) => setAggregateBy(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {categoricalFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Aggregate Function</InputLabel>
              <Select
                value={aggregateFunction}
                onChange={(e) => setAggregateFunction(e.target.value)}
              >
                <MenuItem value="sum">Sum</MenuItem>
                <MenuItem value="avg">Average</MenuItem>
                <MenuItem value="min">Minimum</MenuItem>
                <MenuItem value="max">Maximum</MenuItem>
                <MenuItem value="count">Count</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <Button
            startIcon={<FilterListIcon />}
            onClick={handleAddFilter}
          >
            Add Filter
          </Button>
        </Box>
        {filters.map((filter, index) => (
          <DataFilter
            key={index}
            filter={filter}
            onFilterChange={(newFilter) => handleFilterChange(index, newFilter)}
            onRemove={() => handleRemoveFilter(index)}
          />
        ))}
      </Paper>

      {/* Visualization */}
      <Paper elevation={3} sx={{ p: 2, mb: 2, height: 400 }}>
        <ResponsiveContainer>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid />
            <XAxis
              type="number"
              dataKey={xAxis}
              name={xAxis}
              unit=""
            />
            <YAxis
              type="number"
              dataKey={yAxis}
              name={yAxis}
              unit=""
            />
            {zAxis && (
              <ZAxis
                type="number"
                dataKey={zAxis}
                range={[50, 400]}
                name={zAxis}
              />
            )}
            <RechartsTooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <Box
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.96)',
                        p: 1,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                      }}
                    >
                      {Object.entries(payload[0].payload).map(([key, value]) => (
                        <Typography key={key} variant="body2">
                          {`${key}: ${value}`}
                        </Typography>
                      ))}
                    </Box>
                  );
                }
                return null;
              }}
            />
            <Brush
              dataKey={xAxis}
              height={30}
              stroke="#8884d8"
              onChange={handleBrushChange}
            />
            <Scatter
              data={sortedData}
              fill="#8884d8"
              onClick={(data) => {
                const index = selectedPoints.indexOf(data.id);
                if (index === -1) {
                  setSelectedPoints([...selectedPoints, data.id]);
                } else {
                  setSelectedPoints(selectedPoints.filter((_, i) => i !== index));
                }
              }}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Paper>

      {/* Data Table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
          />
          <Button
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {fields.map((field) => (
                  <TableCell
                    key={field}
                    onClick={() => handleSort(field)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {field}
                      {sortBy === field && (
                        <SortIcon
                          sx={{
                            ml: 1,
                            transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none',
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData
                .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: selectedPoints.includes(row.id)
                        ? 'action.selected'
                        : 'inherit',
                    }}
                  >
                    {fields.map((field) => (
                      <TableCell key={field}>
                        {row[field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
}
