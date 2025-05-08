import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Paper, Box, Typography } from '@mui/material';

const AuthLayout = () => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{ mb: 3, color: 'primary.main' }}
          >
            Forex & Crypto Trading Journal
          </Typography>
          <Outlet />
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthLayout; 