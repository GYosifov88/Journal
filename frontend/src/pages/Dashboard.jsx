import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Account Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Account Summary
            </Typography>
            <Typography variant="body1">
              Welcome to your Trading Journal! This is a placeholder dashboard that will display your trading performance metrics.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Recent Trades */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Trades
            </Typography>
            <Typography variant="body1">
              Your recent trades will appear here once you start adding them.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Trading Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Trading Performance
            </Typography>
            <Typography variant="body1">
              Performance metrics and charts will be displayed here.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Goals Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Goals Progress
            </Typography>
            <Typography variant="body1">
              Your trading goals and progress will be shown here.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 