import React from 'react';
import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={onStartDateChange}
          maxDate={endDate}
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={onEndDateChange}
          minDate={startDate}
          renderInput={(params) => <TextField {...params} />}
        />
      </Box>
    </LocalizationProvider>
  );
}
