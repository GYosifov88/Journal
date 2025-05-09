import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Divider, 
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowBack as ArrowBackIcon, 
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Calendar as CalendarIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import tradeService from '../../services/tradeService';

const TradeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTradeDetails(parseInt(id));
    }
  }, [id]);

  const fetchTradeDetails = async (tradeId) => {
    try {
      setLoading(true);
      const data = await tradeService.getTradeById(tradeId);
      console.log('Fetched trade details:', data);
      setTrade(data);
    } catch (err) {
      console.error('Error fetching trade details:', err);
      setError('Failed to load trade details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/trades')}
        sx={{ mb: 3 }}
      >
        Back to Trades
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom display="flex" alignItems="center">
        <TrendingUpIcon sx={{ mr: 1 }} /> Trade Details
      </Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : trade ? (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="h2">
                      {trade.currency_pair}
                    </Typography>
                    <Chip 
                      icon={trade.direction === 'LONG' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                      label={trade.direction}
                      color={trade.direction === 'LONG' ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Chip 
                    label={trade.win_loss || 'OPEN'} 
                    color={
                      trade.win_loss === 'WIN' ? 'success' : 
                      trade.win_loss === 'LOSS' ? 'error' : 'info'
                    }
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Entry Details
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Entry Price</Typography>
                        <Typography variant="body1">{trade.entry_price}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Position Size</Typography>
                        <Typography variant="body1">{trade.position_size}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Date Opened</Typography>
                        <Typography variant="body1">{formatDate(trade.date_open)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Account ID</Typography>
                        <Typography variant="body1">
                          <Button 
                            size="small" 
                            onClick={() => navigate(`/accounts/${trade.account_id}`)}
                          >
                            {trade.account_id}
                          </Button>
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Risk Management
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Stop Loss</Typography>
                        <Typography variant="body1">{trade.stop_loss || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Take Profit</Typography>
                        <Typography variant="body1">{trade.take_profit || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Risk/Reward</Typography>
                        <Typography variant="body1">{trade.risk_reward ? `1:${trade.risk_reward}` : 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {trade.date_closed && (
                <>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Exit Details
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="textSecondary">Exit Price</Typography>
                            <Typography variant="body1">{trade.exit_price || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="textSecondary">Date Closed</Typography>
                            <Typography variant="body1">{formatDate(trade.date_closed)}</Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="textSecondary">Profit/Loss Amount</Typography>
                            <Typography 
                              variant="body1" 
                              color={trade.profit_amount ? 'success.main' : trade.loss_amount ? 'error.main' : 'inherit'}
                            >
                              {trade.profit_amount ? `+${trade.profit_amount}` : trade.loss_amount ? `-${trade.loss_amount}` : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="textSecondary">Profit/Loss %</Typography>
                            <Typography 
                              variant="body1"
                              color={trade.profit_percentage ? 'success.main' : trade.loss_percentage ? 'error.main' : 'inherit'}
                            >
                              {trade.profit_percentage ? `+${trade.profit_percentage}%` : trade.loss_percentage ? `-${trade.loss_percentage}%` : 'N/A'}
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <Box mt={3} display="flex" justifyContent="space-between">
                  {trade.win_loss === 'OPEN' && (
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={() => navigate(`/trades/${trade.id}/close`)}
                    >
                      Close Trade
                    </Button>
                  )}
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => navigate(`/trades/${trade.id}/edit`)}
                  >
                    Edit Trade
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">
            Trade not found
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/trades')}
            sx={{ mt: 2 }}
          >
            Return to Trades
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default TradeDetails; 