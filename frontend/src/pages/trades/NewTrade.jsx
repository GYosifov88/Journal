import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NewTrade = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/trades')}
        sx={{ mb: 3 }}
      >
        Back to Trades
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Trade
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          This is a placeholder for the new trade form.
        </Typography>
        <Typography variant="body1">
          The form to add a new trade will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default NewTrade; 