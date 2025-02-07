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
  Slider,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const METRIC_RANGES = {
  engagement: { min: 0, max: 100, step: 5 },
  retention: { min: 0, max: 100, step: 5 },
  utilization: { min: 0, max: 100, step: 5 },
  popularity: { min: 0, max: 100, step: 5 },
};

export default function AdvancedFilters({
  filters,
  onFilterChange,
  availableFilters,
  onSavePreset,
  onLoadPreset,
  presets = [],
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [presetName, setPresetName] = useState('');

  const handleMetricRangeChange = (metric, value) => {
    onFilterChange({
      ...filters,
      metrics: {
        ...filters.metrics,
        [metric]: value,
      },
    });
  };

  const handleToggleChange = (name) => (event) => {
    onFilterChange({
      ...filters,
      toggles: {
        ...filters.toggles,
        [name]: event.target.checked,
      },
    });
  };

  const handlePresetSave = () => {
    if (presetName) {
      onSavePreset({
        name: presetName,
        filters: filters,
      });
      setPresetName('');
    }
  };

  const handlePresetLoad = (preset) => {
    onLoadPreset(preset);
    setActiveFilters(Object.keys(preset.filters));
  };

  const clearFilters = () => {
    setActiveFilters([]);
    onFilterChange({
      metrics: {},
      toggles: {},
      timeRange: '30d',
      comparisonType: 'none',
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon />
          <Typography variant="h6">Advanced Filters</Typography>
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
          {/* Metric Ranges */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Metric Ranges
            </Typography>
            {Object.entries(METRIC_RANGES).map(([metric, range]) => (
              <Box key={metric} sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Typography>
                <Slider
                  value={filters.metrics?.[metric] || [range.min, range.max]}
                  onChange={(_, value) => handleMetricRangeChange(metric, value)}
                  valueLabelDisplay="auto"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Toggle Filters */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Additional Options
            </Typography>
            <FormControl component="fieldset">
              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.toggles?.showInactive || false}
                          onChange={handleToggleChange('showInactive')}
                        />
                      }
                      label="Show Inactive Items"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.toggles?.includeArchived || false}
                          onChange={handleToggleChange('includeArchived')}
                        />
                      }
                      label="Include Archived"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.toggles?.compareToBaseline || false}
                          onChange={handleToggleChange('compareToBaseline')}
                        />
                      }
                      label="Compare to Baseline"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.toggles?.showProjections || false}
                          onChange={handleToggleChange('showProjections')}
                        />
                      }
                      label="Show Projections"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Filter Presets */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Filter Presets
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  label="Preset Name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={handlePresetSave}
                  disabled={!presetName}
                >
                  Save Current
                </Button>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {presets.map((preset) => (
                <Chip
                  key={preset.name}
                  label={preset.name}
                  onClick={() => handlePresetLoad(preset)}
                  onDelete={() => {/* Handle preset delete */}}
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
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
                onDelete={() => {
                  const newFilters = { ...filters };
                  delete newFilters[filter];
                  onFilterChange(newFilters);
                  setActiveFilters(activeFilters.filter((f) => f !== filter));
                }}
                size="small"
              />
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
