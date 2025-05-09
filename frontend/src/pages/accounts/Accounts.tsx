import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Container,
  Card, 
  CardContent, 
  CardActions,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { Add as AddIcon, AccountBalanceWallet, CurrencyExchange } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import accountService, { Account } from '../../services/accountService';
import NewAccountDialog from './NewAccountDialog';

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openNewAccountDialog, setOpenNewAccountDialog] = useState<boolean>(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const accounts = await accountService.getAccounts();
      console.log('Fetched accounts:', accounts);
      setAccounts(accounts);
    } catch (err: any) {
      console.error('Error fetching accounts:', err);
      setError(err.message || 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewAccountDialog = () => {
    setOpenNewAccountDialog(true);
  };

  const handleCloseNewAccountDialog = () => {
    setOpenNewAccountDialog(false);
  };

  const handleAccountCreated = (newAccount: Account) => {
    setAccounts([...accounts, newAccount]);
    setOpenNewAccountDialog(false);
  };

  const handleAccountClick = (accountId: number) => {
    navigate(`/accounts/${accountId}`);
  };

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Trading Accounts
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenNewAccountDialog}
        >
          Add Account
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {accounts.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <AccountBalanceWallet sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Trading Accounts Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You need to create at least one trading account to start tracking your trades.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleOpenNewAccountDialog}
          >
            Create Your First Account
          </Button>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {accounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handleAccountClick(account.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {account.name}
                  </Typography>
                  
                  <Chip 
                    icon={<CurrencyExchange />} 
                    label={account.currency}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />

                  <Divider sx={{ my: 1 }} />
                  
                  <Typography color="textSecondary" gutterBottom>
                    Current Balance
                  </Typography>
                  <Typography variant="h4" component="p">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: account.currency,
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2
                    }).format(account.balance)}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Account Type: {account.accountType || 'Standard'}
                  </Typography>
                  
                  {account.broker && (
                    <Typography variant="body2" color="textSecondary">
                      Broker: {account.broker}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <NewAccountDialog 
        open={openNewAccountDialog}
        onClose={handleCloseNewAccountDialog}
        onAccountCreated={handleAccountCreated}
      />
    </Container>
  );
};

export default Accounts; 