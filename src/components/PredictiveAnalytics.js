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
  ListItemSecondary,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import TrendChart from './TrendChart';

const TrendIcon = ({ trend }) => {
  switch (trend?.toUpperCase()) {
    case 'RISING':
      return <TrendingUpIcon color="success" />;
    case 'FALLING':
      return <TrendingDownIcon color="error" />;
    default:
      return <TrendingFlatIcon color="action" />;
  }
};

const defaultPredictions = {
  demandForecast: [],
  popularityTrends: [],
  returnPredictions: [],
  genreTrends: [],
};

export default function PredictiveAnalytics({ predictions = defaultPredictions }) {
  const {
    demandForecast = [],
    popularityTrends = [],
    returnPredictions = [],
    genreTrends = [],
  } = predictions || defaultPredictions;

  if (!predictions) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">No prediction data available</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Demand Forecast */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Demand Forecast (Next 30 Days)
            </Typography>
            {demandForecast.length > 0 ? (
              <TrendChart
                data={demandForecast}
                height={300}
                xKey="date"
                yKey="value"
                tooltipFormatter={(value) => `${value} books`}
              />
            ) : (
              <Typography color="textSecondary">No forecast data available</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Popularity Trends */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Book Popularity Trends
            </Typography>
            <List>
              {(popularityTrends || []).slice(0, 5).map((trend, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={trend?.title || 'Unknown Book'}
                    secondary={trend?.description || 'No description available'}
                  />
                  <TrendIcon trend={trend?.trend || 'FLAT'} />
                </ListItem>
              ))}
              {(!popularityTrends || popularityTrends.length === 0) && (
                <ListItem>
                  <ListItemText primary="No popularity trends available" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Return Predictions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Expected Returns
            </Typography>
            <List>
              {(returnPredictions || []).slice(0, 5).map((prediction, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={prediction?.title || 'Unknown Book'}
                    secondary={`Expected return: ${prediction?.date || 'Unknown'}`}
                  />
                  <Chip
                    label={prediction?.probability ? `${(prediction.probability * 100).toFixed(0)}%` : 'N/A'}
                    color={prediction?.probability > 0.7 ? 'success' : 'warning'}
                  />
                </ListItem>
              ))}
              {(!returnPredictions || returnPredictions.length === 0) && (
                <ListItem>
                  <ListItemText primary="No return predictions available" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Genre Trends */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Genre Trends
            </Typography>
            <Grid container spacing={2}>
              {(genreTrends || []).slice(0, 6).map((trend, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box display="flex" alignItems="center">
                    <TrendIcon trend={trend?.trend || 'FLAT'} />
                    <Box ml={1}>
                      <Typography variant="subtitle1">{trend?.genre || 'Unknown Genre'}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {trend?.description || 'No description available'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
              {(!genreTrends || genreTrends.length === 0) && (
                <Grid item xs={12}>
                  <Typography color="textSecondary">No genre trends available</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
