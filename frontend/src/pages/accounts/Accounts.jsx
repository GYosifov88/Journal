import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchAccounts } from '../../store/slices/accountsSlice';

const Accounts = () => {
  const dispatch = useDispatch();
  const { accounts, status, error } = useSelector(state => state.accounts);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAccounts());
    }
  }, [status, dispatch]);

  const isLoading = status === 'loading';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trading Accounts
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/accounts/new')}
        >
          Add Account
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : accounts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Trading Accounts Yet
          </Typography>
          <Typography variant="body1" paragraph>
            You don't have any trading accounts set up yet. Create your first account to start tracking your trades.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/accounts/new')}
          >
            Create First Account
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {accounts.map(account => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {account.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {account.broker || 'Trading Account'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2">Balance:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      ${account.balance ? account.balance.toFixed(2) : account.initial_balance.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Currency:</Typography>
                    <Typography variant="body2">{account.currency}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/accounts/${account.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Accounts; 