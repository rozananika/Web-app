import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const WIDGET_TYPES = {
  RADAR: 'radar',
  PIE: 'pie',
  COMPARATIVE: 'comparative',
  HEATMAP: 'heatmap',
  BUBBLE: 'bubble',
  CORRELATION: 'correlation',
  TREND: 'trend',
};

const WidgetMenu = ({ onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { onEdit(); handleClose(); }}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={() => { onDelete(); handleClose(); }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  );
};

const WidgetDialog = ({ open, onClose, onSave, widget = {} }) => {
  const [formData, setFormData] = useState({
    title: widget.title || '',
    type: widget.type || WIDGET_TYPES.RADAR,
    width: widget.width || 6,
    height: widget.height || 400,
    config: widget.config || {},
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {widget.id ? 'Edit Widget' : 'Add Widget'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Widget Type</InputLabel>
            <Select
              value={formData.type}
              label="Widget Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value={WIDGET_TYPES.RADAR}>Radar Chart</MenuItem>
              <MenuItem value={WIDGET_TYPES.PIE}>Pie Chart</MenuItem>
              <MenuItem value={WIDGET_TYPES.COMPARATIVE}>Comparative Chart</MenuItem>
              <MenuItem value={WIDGET_TYPES.HEATMAP}>Heatmap</MenuItem>
              <MenuItem value={WIDGET_TYPES.BUBBLE}>Bubble Chart</MenuItem>
              <MenuItem value={WIDGET_TYPES.CORRELATION}>Correlation Matrix</MenuItem>
              <MenuItem value={WIDGET_TYPES.TREND}>Trend Prediction</MenuItem>
            </Select>
          </FormControl>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Width (1-12)"
                value={formData.width}
                onChange={(e) => setFormData({
                  ...formData,
                  width: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)),
                })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Height (px)"
                value={formData.height}
                onChange={(e) => setFormData({
                  ...formData,
                  height: Math.max(200, parseInt(e.target.value) || 200),
                })}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function CustomDashboard({
  widgets = [],
  onWidgetsChange,
  renderWidget,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const newWidgets = Array.from(widgets);
    const [removed] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, removed);

    onWidgetsChange(newWidgets);
  };

  const handleAddWidget = (widgetData) => {
    const newWidget = {
      id: Date.now().toString(),
      ...widgetData,
    };
    onWidgetsChange([...widgets, newWidget]);
  };

  const handleEditWidget = (widget) => {
    setEditingWidget(widget);
    setDialogOpen(true);
  };

  const handleSaveWidget = (widgetData) => {
    if (editingWidget) {
      const newWidgets = widgets.map((w) =>
        w.id === editingWidget.id ? { ...w, ...widgetData } : w
      );
      onWidgetsChange(newWidgets);
    } else {
      handleAddWidget(widgetData);
    }
    setEditingWidget(null);
  };

  const handleDeleteWidget = (widgetId) => {
    onWidgetsChange(widgets.filter((w) => w.id !== widgetId));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Widget
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <Grid
              container
              spacing={2}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {widgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                >
                  {(provided) => (
                    <Grid
                      item
                      xs={12}
                      md={widget.width}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Paper
                        elevation={3}
                        sx={{
                          height: widget.height,
                          position: 'relative',
                          '&:hover .widget-controls': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          className="widget-controls"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            gap: 1,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 1,
                            padding: '2px',
                          }}
                        >
                          <div {...provided.dragHandleProps}>
                            <IconButton size="small">
                              <DragHandleIcon />
                            </IconButton>
                          </div>
                          <WidgetMenu
                            onEdit={() => handleEditWidget(widget)}
                            onDelete={() => handleDeleteWidget(widget.id)}
                          />
                        </Box>
                        <Box sx={{ p: 2, height: '100%' }}>
                          <Typography variant="h6" gutterBottom>
                            {widget.title}
                          </Typography>
                          {renderWidget(widget)}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      <WidgetDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingWidget(null);
        }}
        onSave={handleSaveWidget}
        widget={editingWidget}
      />
    </Box>
  );
}
