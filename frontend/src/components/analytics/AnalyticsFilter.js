import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Collapse,
  Typography,
  Button,
  Grid,
  Autocomplete,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '180d', label: 'Last 180 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

const COMPARISON_TYPES = [
  { value: 'none', label: 'No Comparison' },
  { value: 'previousPeriod', label: 'Previous Period' },
  { value: 'previousYear', label: 'Previous Year' },
  { value: 'custom', label: 'Custom Period' },
];

export default function AnalyticsFilter({
  filters,
  onFilterChange,
  availableFilters,
  customRangeEnabled = true,
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleTimeRangeChange = (event) => {
    onFilterChange({
      ...filters,
      timeRange: event.target.value,
    });
  };

  const handleComparisonTypeChange = (event) => {
    onFilterChange({
      ...filters,
      comparisonType: event.target.value,
    });
  };

  const handleFilterAdd = (filter) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleFilterRemove = (filter) => {
    setActiveFilters(activeFilters.filter((f) => f !== filter));
    const newFilters = { ...filters };
    delete newFilters[filter];
    onFilterChange(newFilters);
  };

  const handleFilterValueChange = (filter, value) => {
    onFilterChange({
      ...filters,
      [filter]: value,
    });
  };

  const clearFilters = () => {
    setActiveFilters([]);
    onFilterChange({
      timeRange: '30d',
      comparisonType: 'none',
    });
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={clearFilters}
            startIcon={<ClearIcon />}
            disabled={activeFilters.length === 0}
          >
            Clear All
          </Button>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label="show more"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Time Range"
              value={filters.timeRange || '30d'}
              onChange={handleTimeRangeChange}
              size="small"
            >
              {TIME_RANGES.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={!customRangeEnabled && option.value === 'custom'}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Compare To"
              value={filters.comparisonType || 'none'}
              onChange={handleComparisonTypeChange}
              size="small"
            >
              {COMPARISON_TYPES.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={!customRangeEnabled && option.value === 'custom'}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {filters.timeRange === 'custom' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) =>
                    handleFilterValueChange('startDate', e.target.value)
                  }
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) =>
                    handleFilterValueChange('endDate', e.target.value)
                  }
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={availableFilters.filter(
                (filter) => !activeFilters.includes(filter.value)
              )}
              getOptionLabel={(option) => option.label}
              onChange={(_, newValue) => {
                setActiveFilters(newValue.map((v) => v.value));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Add Filters"
                  size="small"
                />
              )}
              size="small"
            />
          </Grid>

          {activeFilters.map((filter) => {
            const filterConfig = availableFilters.find((f) => f.value === filter);
            if (!filterConfig) return null;

            return (
              <Grid item xs={12} md={6} key={filter}>
                {filterConfig.type === 'select' ? (
                  <TextField
                    select
                    fullWidth
                    label={filterConfig.label}
                    value={filters[filter] || ''}
                    onChange={(e) =>
                      handleFilterValueChange(filter, e.target.value)
                    }
                    size="small"
                  >
                    {filterConfig.options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    label={filterConfig.label}
                    value={filters[filter] || ''}
                    onChange={(e) =>
                      handleFilterValueChange(filter, e.target.value)
                    }
                    size="small"
                    type={filterConfig.type}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
      </Collapse>

      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {activeFilters.map((filter) => {
            const filterConfig = availableFilters.find((f) => f.value === filter);
            if (!filterConfig) return null;

            return (
              <Chip
                key={filter}
                label={`${filterConfig.label}: ${
                  filterConfig.type === 'select'
                    ? filterConfig.options.find(
                        (o) => o.value === filters[filter]
                      )?.label || 'Any'
                    : filters[filter] || 'Any'
                }`}
                onDelete={() => handleFilterRemove(filter)}
                size="small"
              />
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
