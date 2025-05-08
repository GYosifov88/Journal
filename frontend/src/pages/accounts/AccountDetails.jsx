import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/accounts')}
        sx={{ mb: 3 }}
      >
        Back to Accounts
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Account Details
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          This is a placeholder for account ID: {id}
        </Typography>
        <Typography variant="body1">
          The account details will be loaded from the API in a real implementation.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AccountDetails; 