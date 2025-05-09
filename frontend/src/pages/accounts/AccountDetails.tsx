import React, { useState, useEffect } from 'react';
import { 
  Container,
  Typography,
  Box,
  Paper,
  Divider,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowBack, 
  AddCircleOutline, 
  TrendingUp, 
  AccountBalanceWallet, 
  CurrencyExchange,
  BarChart
} from '@mui/icons-material';
import accountService, { Account, Trade, Deposit } from '../../services/accountService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);

  useEffect(() => {
    if (id) {
      fetchAccountData(parseInt(id));
    }
  }, [id]);

  const fetchAccountData = async (accountId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch account details
      const accountData = await accountService.getAccountById(accountId);
      setAccount(accountData);
      
      // Fetch trades for this account
      const tradesData = await accountService.getTrades(accountId);
      setTrades(tradesData);
      
      // Fetch deposits for this account
      const depositsData = await accountService.getDeposits(accountId);
      setDeposits(depositsData);
    } catch (err: any) {
      console.error('Error fetching account data:', err);
      setError(err.message || 'Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleNewTrade = () => {
    navigate(`/trades/new?accountId=${id}`);
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
        <Box mt={2}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/accounts')}
          >
            Back to Accounts
          </Button>
        </Box>
      </Container>
    );
  }

  if (!account) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 3 }}>
          Account not found
        </Alert>
        <Box mt={2}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />} 
            onClick={() => navigate('/accounts')}
          >
            Back to Accounts
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/accounts')}
          sx={{ mb: 2 }}
        >
          Back to Accounts
        </Button>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {account.name}
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <Chip 
                icon={<CurrencyExchange />} 
                label={account.currency} 
                color="primary" 
                variant="outlined"
              />
              <Chip 
                label={account.accountType || 'Standard'} 
                color="secondary" 
                variant="outlined"
              />
              {account.broker && (
                <Chip 
                  label={`Broker: ${account.broker}`} 
                  variant="outlined" 
                />
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="subtitle2">
                    Current Balance
                  </Typography>
                  <Typography variant="h4">
                    {new Intl.NumberFormat('en-US', { 
                      style: 'currency', 
                      currency: account.currency 
                    }).format(account.balance)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography color="textSecondary" variant="subtitle2">
                    Total Trades
                  </Typography>
                  <Typography variant="h4">
                    {trades.length}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="account tabs"
          >
            <Tab label="Trades" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Deposits" icon={<AccountBalanceWallet />} iconPosition="start" />
            <Tab label="Performance" icon={<BarChart />} iconPosition="start" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Trading History</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddCircleOutline />}
              onClick={handleNewTrade}
            >
              New Trade
            </Button>
          </Box>
          
          {trades.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Trades Yet
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Start tracking your trading activity by adding your first trade.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddCircleOutline />}
                onClick={handleNewTrade}
              >
                Add Your First Trade
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {trades.map((trade) => (
                <Grid item xs={12} key={trade.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => navigate(`/trades/${trade.id}`)}
                  >
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Typography color="textSecondary" variant="body2">
                            Pair
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {trade.pair}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={2}>
                          <Typography color="textSecondary" variant="body2">
                            Direction
                          </Typography>
                          <Chip 
                            label={trade.direction}
                            color={trade.direction === 'LONG' ? 'success' : 'error'}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={6} sm={2}>
                          <Typography color="textSecondary" variant="body2">
                            Size
                          </Typography>
                          <Typography variant="subtitle1">
                            {trade.size}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6} sm={2}>
                          <Typography color="textSecondary" variant="body2">
                            Status
                          </Typography>
                          <Chip 
                            label={trade.status}
                            color={trade.status === 'OPEN' ? 'warning' : 'primary'}
                            size="small"
                          />
                        </Grid>
                        
                        <Grid item xs={6} sm={3}>
                          <Typography color="textSecondary" variant="body2">
                            Entry Date
                          </Typography>
                          <Typography variant="subtitle1">
                            {new Date(trade.entryDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Deposit History</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddCircleOutline />}
            >
              New Deposit
            </Button>
          </Box>
          
          {deposits.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AccountBalanceWallet sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Deposits Yet
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Track your account deposits to monitor your trading capital.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddCircleOutline />}
              >
                Add Your First Deposit
              </Button>
            </Paper>
          ) : (
            <List>
              {deposits.map((deposit) => (
                <ListItem key={deposit.id} divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="bold">
                        {new Intl.NumberFormat('en-US', { 
                          style: 'currency', 
                          currency: account.currency 
                        }).format(deposit.amount)}
                      </Typography>
                    }
                    secondary={new Date(deposit.date).toLocaleDateString()}
                  />
                  {deposit.notes && (
                    <Typography variant="body2" color="textSecondary">
                      {deposit.notes}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography color="textSecondary">
              Performance analytics are coming soon...
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AccountDetails; 