import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

const TEMPLATES = [
  {
    id: 'overview',
    name: 'Overview Dashboard',
    description: 'General overview of library performance with key metrics and trends',
    image: '/templates/overview.png',
    widgets: [
      {
        id: 'overview-radar',
        type: 'radar',
        title: 'Performance Overview',
        width: 6,
        height: 400,
      },
      {
        id: 'overview-trend',
        type: 'trend',
        title: 'Key Metrics Trends',
        width: 6,
        height: 400,
      },
      {
        id: 'overview-pie',
        type: 'pie',
        title: 'Distribution Analysis',
        width: 4,
        height: 400,
      },
      {
        id: 'overview-heatmap',
        type: 'heatmap',
        title: 'Activity Patterns',
        width: 8,
        height: 400,
      },
    ],
  },
  {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Deep dive into data correlations and statistical analysis',
    image: '/templates/analytics.png',
    widgets: [
      {
        id: 'analytics-correlation',
        type: 'correlation',
        title: 'Metric Correlations',
        width: 6,
        height: 500,
      },
      {
        id: 'analytics-stats',
        type: 'statistical',
        title: 'Statistical Analysis',
        width: 6,
        height: 500,
      },
      {
        id: 'analytics-trend',
        type: 'trend',
        title: 'Predictive Analysis',
        width: 12,
        height: 400,
      },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory Management',
    description: 'Focus on book inventory, demand patterns, and maintenance',
    image: '/templates/inventory.png',
    widgets: [
      {
        id: 'inventory-bubble',
        type: 'bubble',
        title: 'Book Performance',
        width: 8,
        height: 500,
      },
      {
        id: 'inventory-pie',
        type: 'pie',
        title: 'Category Distribution',
        width: 4,
        height: 500,
      },
      {
        id: 'inventory-trend',
        type: 'trend',
        title: 'Inventory Trends',
        width: 12,
        height: 400,
      },
    ],
  },
  {
    id: 'user',
    name: 'User Behavior',
    description: 'Analysis of user engagement, patterns, and preferences',
    image: '/templates/user.png',
    widgets: [
      {
        id: 'user-heatmap',
        type: 'heatmap',
        title: 'Activity Patterns',
        width: 6,
        height: 400,
      },
      {
        id: 'user-radar',
        type: 'radar',
        title: 'User Metrics',
        width: 6,
        height: 400,
      },
      {
        id: 'user-trend',
        type: 'trend',
        title: 'Engagement Trends',
        width: 12,
        height: 400,
      },
    ],
  },
];

const TemplateDialog = ({ open, onClose, onApply, template }) => {
  const [name, setName] = React.useState('');
  const [replaceExisting, setReplaceExisting] = React.useState(true);

  const handleApply = () => {
    onApply({
      name: name || template.name,
      replaceExisting,
      widgets: template.widgets,
    });
    onClose();
  };

  React.useEffect(() => {
    if (open && template) {
      setName(template.name);
    }
  }, [open, template]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply Template: {template?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Dashboard Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
              />
            }
            label="Replace existing widgets"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function DashboardTemplates({ onApplyTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  return (
    <>
      <Grid container spacing={3}>
        {TEMPLATES.map((template) => (
          <Grid item xs={12} sm={6} md={3} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
              onClick={() => handleTemplateClick(template)}
            >
              <CardMedia
                component="img"
                height="140"
                image={template.image}
                alt={template.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {template.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <TemplateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onApply={onApplyTemplate}
        template={selectedTemplate}
      />
    </>
  );
}
