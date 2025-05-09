import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  FormHelperText,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import accountService, { Account } from '../../services/accountService';

interface NewAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAccountCreated: (account: Account) => void;
}

interface FormValues {
  name: string;
  balance: string;
  currency: string;
  accountType: string;
  broker: string;
  description: string;
}

const accountTypes = [
  'Spot',
  'Futures',
  'Margin',
  'Options',
  'Savings',
  'Demo',
  'Other'
];

const currencies = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'BTC',
  'ETH',
  'USDT'
];

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Account name is required')
    .max(100, 'Account name cannot exceed 100 characters'),
  balance: Yup.number()
    .required('Initial balance is required')
    .positive('Initial balance must be positive'),
  currency: Yup.string()
    .required('Currency is required'),
  accountType: Yup.string()
    .required('Account type is required'),
  broker: Yup.string()
    .max(100, 'Broker name cannot exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description cannot exceed 500 characters')
});

const NewAccountDialog: React.FC<NewAccountDialogProps> = ({ 
  open, 
  onClose, 
  onAccountCreated 
}) => {
  const [error, setError] = useState<string | null>(null);

  const initialValues: FormValues = {
    name: '',
    balance: '',
    currency: 'USD',
    accountType: 'Spot',
    broker: '',
    description: ''
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      setError(null);

      // Format data to match backend expectations
      const accountData = {
        name: values.name,
        initial_balance: parseFloat(values.balance),
        balance: parseFloat(values.balance), // Include both for compatibility
        currency: values.currency,
        // These fields won't be sent to the backend but stored for frontend UI
        accountType: values.accountType,
        broker: values.broker || undefined,
        description: values.description || undefined,
      };

      console.log('Creating account with data:', accountData);
      const newAccount = await accountService.createAccount(accountData);
      
      console.log('Account created:', newAccount);
      onAccountCreated(newAccount);
    } catch (err: any) {
      console.error('Error creating account:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create account';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Create New Trading Account</DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="name"
                    label="Account Name"
                    fullWidth
                    required
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="broker"
                    label="Broker / Exchange"
                    fullWidth
                    error={touched.broker && Boolean(errors.broker)}
                    helperText={touched.broker && errors.broker}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select
                    name="accountType"
                    label="Account Type"
                    fullWidth
                    required
                    error={touched.accountType && Boolean(errors.accountType)}
                    helperText={touched.accountType && errors.accountType}
                  >
                    {accountTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="balance"
                    label="Initial Balance"
                    type="number"
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                    error={touched.balance && Boolean(errors.balance)}
                    helperText={touched.balance && errors.balance}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select
                    name="currency"
                    label="Currency"
                    fullWidth
                    required
                    error={touched.currency && Boolean(errors.currency)}
                    helperText={touched.currency && errors.currency}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency} value={currency}>
                        {currency}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="description"
                    label="Description (optional)"
                    fullWidth
                    multiline
                    rows={2}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={onClose} color="inherit">
                Cancel
              </Button>
              <Button 
                type="submit" 
                color="primary" 
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                Create Account
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default NewAccountDialog; 