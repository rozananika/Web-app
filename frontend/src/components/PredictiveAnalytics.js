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

export default function PredictiveAnalytics({ predictions }) {
  const {
    demandForecast,
    popularityTrends,
    returnPredictions,
    genreTrends,
  } = predictions;

  return (
    <Grid container spacing={3}>
      {/* Demand Forecast */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Demand Forecast (Next 30 Days)
            </Typography>
            <TrendChart
              data={demandForecast}
              type="area"
              config={{
                xKey: 'date',
                yKey: 'predictedDemand',
                label: 'Predicted Demand',
                height: 300,
              }}
            />
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
              {popularityTrends.slice(0, 5).map((book) => (
                <ListItem key={book.bookId}>
                  <ListItemText
                    primary={book.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TrendIcon trend={book.trend} />
                        <Typography variant="body2" color="text.secondary">
                          Score: {(book.popularityScore * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip
                    label={book.trend}
                    color={
                      book.trend === 'RISING'
                        ? 'success'
                        : book.trend === 'FALLING'
                        ? 'error'
                        : 'default'
                    }
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Return Predictions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Return Predictions
            </Typography>
            <List>
              {returnPredictions.slice(0, 5).map((prediction) => (
                <ListItem key={prediction.lendingId}>
                  <ListItemText
                    primary={prediction.bookTitle}
                    secondary={`Due: ${new Date(prediction.dueDate).toLocaleDateString()}`}
                  />
                  <Tooltip title={`Return Probability: ${(prediction.returnProbability * 100).toFixed(1)}%`}>
                    <Chip
                      label={prediction.predictedStatus.replace('_', ' ')}
                      color={
                        prediction.predictedStatus === 'LIKELY_ON_TIME'
                          ? 'success'
                          : prediction.predictedStatus === 'POSSIBLY_DELAYED'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </Tooltip>
                </ListItem>
              ))}
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
              {genreTrends.map((genre) => (
                <Grid item key={genre.genre} xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      {genre.genre}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendIcon trend={genre.trend} />
                      <Typography variant="body2" color="text.secondary">
                        Popularity: {(genre.popularityScore * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <Chip
                      label={`${genre.recommendationStrength} Recommendation`}
                      color={
                        genre.recommendationStrength === 'STRONG'
                          ? 'success'
                          : genre.recommendationStrength === 'MODERATE'
                          ? 'warning'
                          : 'default'
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
