import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  MenuItem, 
  TextField, 
  FormControl,
  CircularProgress,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { 
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import tradeService from '../../services/tradeService';
import accountService from '../../services/accountService';
import { testEndpoint } from '../../utils/debugTools';

// Parse query params to get account ID if provided
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const NewTrade = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const accountIdFromQuery = query.get('accountId');
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch accounts for the dropdown
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const accountsData = await accountService.getAccounts();
        console.log('Fetched accounts:', accountsData);
        setAccounts(accountsData);
        
        if (accountsData.length === 0) {
          setError('No accounts found. Please create an account first.');
        }
        
        // Test endpoints to diagnose the issue
        console.log('=== Testing API Endpoints ===');
        if (accountsData.length > 0) {
          const accountId = accountsData[0].id;
          console.log(`Testing with first account ID: ${accountId}`);
          await testEndpoint(`http://localhost:8000/api/accounts/${accountId}/trades`, 'GET');
          await testEndpoint(`http://localhost:8000/api/trades/accounts/${accountId}/trades`, 'GET');
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to fetch accounts. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);

  const initialValues = {
    account_id: accountIdFromQuery || '',
    currency_pair: '',
    position_size: '',
    direction: 'LONG',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    date_open: new Date().toISOString().slice(0, 16), // Format as YYYY-MM-DDTHH:MM
  };

  const validationSchema = Yup.object({
    account_id: Yup.string().required('Account is required'),
    currency_pair: Yup.string()
      .required('Currency pair is required')
      .min(2, 'Currency pair must be at least 2 characters')
      .max(20, 'Currency pair must be at most 20 characters'),
    position_size: Yup.number()
      .required('Position size is required')
      .positive('Position size must be positive'),
    direction: Yup.string().required('Direction is required'),
    entry_price: Yup.number()
      .required('Entry price is required')
      .positive('Entry price must be positive'),
    stop_loss: Yup.number()
      .nullable()
      .test('is-less-than-entry-for-long', 'Stop loss must be less than entry price for LONG positions', 
        function(value) {
          const { entry_price, direction } = this.parent;
          if (!value || !entry_price || direction !== 'LONG') return true;
          return value < entry_price;
        })
      .test('is-greater-than-entry-for-short', 'Stop loss must be greater than entry price for SHORT positions', 
        function(value) {
          const { entry_price, direction } = this.parent;
          if (!value || !entry_price || direction !== 'SHORT') return true;
          return value > entry_price;
        }),
    take_profit: Yup.number()
      .nullable()
      .test('is-greater-than-entry-for-long', 'Take profit must be greater than entry price for LONG positions', 
        function(value) {
          const { entry_price, direction } = this.parent;
          if (!value || !entry_price || direction !== 'LONG') return true;
          return value > entry_price;
        })
      .test('is-less-than-entry-for-short', 'Take profit must be less than entry price for SHORT positions', 
        function(value) {
          const { entry_price, direction } = this.parent;
          if (!value || !entry_price || direction !== 'SHORT') return true;
          return value < entry_price;
        }),
    date_open: Yup.string().required('Open date is required'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      console.log('Submitting trade:', values);
      
      const payload = {
        ...values,
        account_id: parseInt(values.account_id),
        position_size: parseFloat(values.position_size),
        entry_price: parseFloat(values.entry_price),
        stop_loss: values.stop_loss ? parseFloat(values.stop_loss) : null,
        take_profit: values.take_profit ? parseFloat(values.take_profit) : null,
      };
      
      console.log('Creating trade with formatted payload:', payload);
      console.log('Account ID being used:', payload.account_id);
      
      // Use trade service to create a new trade
      const result = await tradeService.createTrade(payload.account_id, payload);
      
      console.log('Trade created successfully:', result);
      setSuccess(true);
      
      // Wait a moment before navigating away
      setTimeout(() => {
        // If coming from account details page, navigate back there
        if (accountIdFromQuery) {
          navigate(`/accounts/${accountIdFromQuery}`);
        } else {
          navigate('/trades');
        }
      }, 1500);
      
      resetForm();
    } catch (err) {
      console.error('Error creating trade:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        console.error('Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      setError(err.response?.data?.detail || err.message || 'Failed to create trade. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Calculate Risk-Reward Ratio
  const calculateRiskReward = (values) => {
    const { direction, entry_price, stop_loss, take_profit } = values;
    
    if (!entry_price || !stop_loss || !take_profit) {
      return null;
    }
    
    const entryPrice = parseFloat(entry_price);
    const stopLoss = parseFloat(stop_loss);
    const takeProfit = parseFloat(take_profit);
    
    if (direction === 'LONG') {
      const risk = entryPrice - stopLoss;
      const reward = takeProfit - entryPrice;
      if (risk <= 0) return null;
      return (reward / risk).toFixed(2);
    } else { // SHORT
      const risk = stopLoss - entryPrice;
      const reward = entryPrice - takeProfit;
      if (risk <= 0) return null;
      return (reward / risk).toFixed(2);
    }
  };

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => {
          if (accountIdFromQuery) {
            navigate(`/accounts/${accountIdFromQuery}`);
          } else {
            navigate('/trades');
          }
        }}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Typography variant="h4" component="h1" gutterBottom display="flex" alignItems="center">
        <TrendingUpIcon sx={{ mr: 1 }} /> New Trade Entry
      </Typography>
      
      {loading && !accounts.length && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Trade created successfully! Redirecting...
        </Alert>
      )}
      
      {accounts.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Trading Accounts Found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You need to create at least one trading account before adding trades.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/accounts')}
          >
            Create Your First Account
          </Button>
        </Paper>
      )}
      
      {accounts.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => {
              const riskRewardRatio = calculateRiskReward(values);
              
              return (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        select
                        name="account_id"
                        label="Trading Account"
                        fullWidth
                        margin="normal"
                        value={values.account_id}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.account_id && Boolean(errors.account_id)}
                        helperText={touched.account_id && errors.account_id}
                        disabled={loading || isSubmitting}
                      >
                        {accounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.name} ({account.currency})
                          </MenuItem>
                        ))}
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="currency_pair"
                        label="Currency Pair / Symbol"
                        fullWidth
                        margin="normal"
                        placeholder="e.g., EURUSD, BTCUSDT"
                        value={values.currency_pair}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.currency_pair && Boolean(errors.currency_pair)}
                        helperText={touched.currency_pair && errors.currency_pair}
                        disabled={loading || isSubmitting}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        select
                        name="direction"
                        label="Direction"
                        fullWidth
                        margin="normal"
                        value={values.direction}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.direction && Boolean(errors.direction)}
                        helperText={touched.direction && errors.direction}
                        disabled={loading || isSubmitting}
                      >
                        <MenuItem value="LONG">LONG</MenuItem>
                        <MenuItem value="SHORT">SHORT</MenuItem>
                      </Field>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="position_size"
                        label="Position Size"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={values.position_size}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.position_size && Boolean(errors.position_size)}
                        helperText={touched.position_size && errors.position_size}
                        disabled={loading || isSubmitting}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {accounts.find(a => a.id == values.account_id)?.currency || '$'}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Field
                        as={TextField}
                        name="entry_price"
                        label="Entry Price"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={values.entry_price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.entry_price && Boolean(errors.entry_price)}
                        helperText={touched.entry_price && errors.entry_price}
                        disabled={loading || isSubmitting}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Field
                        as={TextField}
                        name="stop_loss"
                        label="Stop Loss"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={values.stop_loss}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.stop_loss && Boolean(errors.stop_loss)}
                        helperText={touched.stop_loss && errors.stop_loss}
                        disabled={loading || isSubmitting}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Field
                        as={TextField}
                        name="take_profit"
                        label="Take Profit"
                        fullWidth
                        margin="normal"
                        type="number"
                        value={values.take_profit}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.take_profit && Boolean(errors.take_profit)}
                        helperText={touched.take_profit && errors.take_profit}
                        disabled={loading || isSubmitting}
                      />
                    </Grid>
                    
                    {riskRewardRatio && (
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Risk-Reward Ratio: 1:{riskRewardRatio}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="date_open"
                        label="Entry Date"
                        type="datetime-local"
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        value={values.date_open}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.date_open && Boolean(errors.date_open)}
                        helperText={touched.date_open && errors.date_open}
                        disabled={loading || isSubmitting}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box mt={4} display="flex" justifyContent="space-between">
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (accountIdFromQuery) {
                          navigate(`/accounts/${accountIdFromQuery}`);
                        } else {
                          navigate('/trades');
                        }
                      }}
                      disabled={loading || isSubmitting}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <ShowChartIcon />}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Trade'}
                    </Button>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </Paper>
      )}
    </Box>
  );
};

export default NewTrade; 