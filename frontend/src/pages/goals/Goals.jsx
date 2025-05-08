import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Goals = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trading Goals
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Add Goal
        </Button>
      </Box>

      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          No Goals Set Yet
        </Typography>
        <Typography variant="body1" paragraph>
          Set trading goals to track your progress and stay motivated.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Create First Goal
        </Button>
      </Paper>
    </Box>
  );
};

export default Goals; 