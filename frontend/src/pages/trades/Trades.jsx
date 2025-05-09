import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon,
  ShowChart as ShowChartIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import tradeService from '../../services/tradeService';

const Trades = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const data = await tradeService.getAllTrades();
      console.log('Fetched trades:', data);
      setTrades(data);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to load trades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status) {
      case 'WIN': return 'success';
      case 'LOSS': return 'error';
      case 'OPEN': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Trades
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/trades/new')}
        >
          New Trade
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : trades.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Trades Added Yet
          </Typography>
          <Typography variant="body1" paragraph>
            Start tracking your trading performance by adding your first trade.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/trades/new')}
          >
            Add First Trade
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Date Opened</TableCell>
                <TableCell>Pair</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell align="right">Entry Price</TableCell>
                <TableCell align="right">Position Size</TableCell>
                <TableCell align="right">Stop Loss</TableCell>
                <TableCell align="right">Take Profit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id} hover>
                  <TableCell>{trade.id}</TableCell>
                  <TableCell>{formatDate(trade.date_open)}</TableCell>
                  <TableCell>{trade.currency_pair}</TableCell>
                  <TableCell>
                    {trade.direction === 'LONG' ? (
                      <Chip 
                        icon={<ArrowUpwardIcon />} 
                        label="LONG" 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    ) : (
                      <Chip 
                        icon={<ArrowDownwardIcon />} 
                        label="SHORT" 
                        size="small" 
                        color="error" 
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">{trade.entry_price}</TableCell>
                  <TableCell align="right">{trade.position_size}</TableCell>
                  <TableCell align="right">{trade.stop_loss || '-'}</TableCell>
                  <TableCell align="right">{trade.take_profit || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={trade.win_loss || 'OPEN'} 
                      size="small" 
                      color={getStatusColor(trade.win_loss)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/trades/${trade.id}`)}
                      title="View Trade Details"
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Trades; 