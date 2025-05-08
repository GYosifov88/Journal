import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TradeDetails = () => {
  const { id } = useParams();
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
        Trade Details
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          This is a placeholder for trade ID: {id}
        </Typography>
        <Typography variant="body1">
          The trade details will be loaded from the API in a real implementation.
        </Typography>
      </Paper>
    </Box>
  );
};

export default TradeDetails; 