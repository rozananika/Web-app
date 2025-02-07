import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Tooltip,
  Button,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import TrendChart from './TrendChart';

const InventoryStatusChip = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case 'UNDER_STOCKED':
        return 'error';
      case 'OVER_STOCKED':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Chip
      icon={<InventoryIcon />}
      label={status.replace('_', ' ')}
      color={getColor()}
      size="small"
    />
  );
};

const MaintenanceStatusChip = ({ condition }) => {
  const getColor = () => {
    switch (condition) {
      case 'POOR':
        return 'error';
      case 'FAIR':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Chip
      icon={<BuildIcon />}
      label={condition}
      color={getColor()}
      size="small"
    />
  );
};

export default function InventoryAnalytics({ data }) {
  const {
    inventoryHealth,
    demandPredictions,
    acquisitionRecommendations,
    maintenanceNeeds,
  } = data;

  return (
    <Grid container spacing={3}>
      {/* Inventory Health */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Inventory Health
            </Typography>
            <List>
              {inventoryHealth.slice(0, 5).map((item) => (
                <ListItem key={item.bookId}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <InventoryStatusChip status={item.status} />
                          <Typography variant="body2" color="text.secondary">
                            {item.availableCopies} / {item.totalCopies} copies
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Utilization: {(item.utilization * 100).toFixed(1)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={item.utilization * 100}
                              color={item.utilization > 0.8 ? 'error' : 'primary'}
                            />
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Demand Predictions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Demand Predictions
            </Typography>
            <List>
              {demandPredictions.slice(0, 5).map((item) => (
                <ListItem key={item.bookId}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          Current Demand: {item.currentDemand} copies/month
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Projected: {item.projectedDemand.toFixed(1)} copies/month
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(item.seasonalFactors)
                            .slice(0, 3)
                            .map(([month, factor]) => (
                              <Chip
                                key={month}
                                label={`${month}: ${(factor * 100).toFixed(0)}%`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Acquisition Recommendations */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Acquisition Recommendations
            </Typography>
            <List>
              {acquisitionRecommendations.slice(0, 5).map((item) => (
                <ListItem key={item.bookId}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip
                            icon={<AddIcon />}
                            label={`Add ${item.recommendedCopies} copies`}
                            color={item.priority === 'HIGH' ? 'error' : 'primary'}
                            size="small"
                          />
                          <Chip
                            label={item.priority}
                            color={
                              item.priority === 'HIGH'
                                ? 'error'
                                : item.priority === 'MEDIUM'
                                ? 'warning'
                                : 'default'
                            }
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Justification:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {item.justification.map((reason, index) => (
                            <Chip
                              key={index}
                              label={reason}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Maintenance Needs */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Maintenance Schedule
            </Typography>
            <List>
              {maintenanceNeeds.slice(0, 5).map((item) => (
                <ListItem key={item.bookId}>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <MaintenanceStatusChip condition={item.condition} />
                          {item.replacementNeeded && (
                            <Chip
                              icon={<WarningIcon />}
                              label="Replacement Needed"
                              color="error"
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography variant="body2" gutterBottom>
                          Maintenance Schedule:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {Object.entries(item.maintenanceSchedule).map(([type, date]) => (
                            <Tooltip
                              key={type}
                              title={new Date(date).toLocaleDateString()}
                            >
                              <Chip
                                label={`${type}: ${new Date(date).toLocaleDateString()}`}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
