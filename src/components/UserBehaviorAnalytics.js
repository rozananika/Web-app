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
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import TrendChart from './TrendChart';

const UserSegmentIcon = ({ segment = 'UNKNOWN' }) => {
  const getColor = () => {
    switch (segment.toUpperCase()) {
      case 'POWER_USER':
        return 'success';
      case 'ACTIVE_USER':
        return 'primary';
      case 'CASUAL_USER':
        return 'warning';
      default:
        return 'error';
    }
  };

  return (
    <Chip
      icon={<PersonIcon />}
      label={segment.replace('_', ' ')}
      color={getColor()}
      size="small"
    />
  );
};

const RiskLevelChip = ({ risk = 'UNKNOWN' }) => {
  const getColor = () => {
    switch (risk.toUpperCase()) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      icon={<WarningIcon />}
      label={risk}
      color={getColor()}
      size="small"
    />
  );
};

const defaultData = {
  userSegments: [],
  readingPatterns: [],
  userRecommendations: [],
  retentionRisk: [],
};

export default function UserBehaviorAnalytics({ data = defaultData }) {
  const {
    userSegments = [],
    readingPatterns = [],
    userRecommendations = [],
    retentionRisk = [],
  } = data || defaultData;

  if (!data) {
    return (
      <Box p={2}>
        <Typography color="textSecondary">No user behavior data available</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* User Segments */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Segments
            </Typography>
            <List>
              {userSegments.slice(0, 5).map((user, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={user?.username || 'Unknown User'}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <UserSegmentIcon segment={user?.segment || 'UNKNOWN'} />
                        <Typography variant="body2" color="text.secondary">
                          Engagement: {(user?.engagementScore * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    }
                  />
                  <AvatarGroup max={3}>
                    {user?.preferredGenres.map((genre) => (
                      <Tooltip key={genre} title={genre}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          {genre[0]}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                </ListItem>
              ))}
              {userSegments.length === 0 && (
                <ListItem>
                  <ListItemText primary="No user segments available" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Reading Patterns */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reading Patterns
            </Typography>
            <List>
              {readingPatterns.slice(0, 5).map((pattern, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={pattern?.username || 'Unknown User'}
                    secondary={
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                        <Typography variant="body2">
                          Avg. Reading Time: {pattern?.avgReadingDays.toFixed(1)} days
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {pattern?.readingTrend === 'INCREASING' ? (
                            <TrendingUpIcon color="success" />
                          ) : (
                            <TrendingDownIcon color="error" />
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {pattern?.variedGenres ? 'Diverse Reader' : 'Genre Focused'}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {readingPatterns.length === 0 && (
                <ListItem>
                  <ListItemText primary="No reading patterns available" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* User Recommendations */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personalized Recommendations
            </Typography>
            <List>
              {userRecommendations.slice(0, 5).map((rec, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={rec?.username || 'Unknown User'}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" gutterBottom>
                          Recommended Books:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {rec?.recommendedBooks.slice(0, 3).map((book) => (
                            <Chip
                              key={book.id}
                              label={book.title}
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
              {userRecommendations.length === 0 && (
                <ListItem>
                  <ListItemText primary="No user recommendations available" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Retention Risk */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Retention Analysis
            </Typography>
            <List>
              {retentionRisk.slice(0, 5).map((risk, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={risk?.username || 'Unknown User'}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <RiskLevelChip risk={risk?.riskLevel || 'UNKNOWN'} />
                          <Typography variant="body2" color="text.secondary">
                            Score: {(risk?.retentionScore * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {risk?.riskFactors.map((factor) => (
                            <Chip
                              key={factor}
                              label={factor.replace('_', ' ')}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              {retentionRisk.length === 0 && (
                <ListItem>
                  <ListItemText primary="No retention risk available" />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
