import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Typography, TextField, Button, Paper, Box, Alert, CircularProgress } from '@mui/material';

const PinLoginPage: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { validatePin } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const isValid = await validatePin(pin);
    if (!isValid) {
      setError('Invalid PIN or failed to authenticate with backend.');
      setLoading(false);
    }
    // On success, the router will automatically redirect
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} component="form" onSubmit={handleSubmit} sx={{ padding: 4, width: '100%', maxWidth: 360, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Admin Access
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter your PIN to access the dashboard.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}
        
        <TextField
          label="PIN"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          sx={{
          '& .MuiInputBase-input': {
            textAlign: 'center',
            letterSpacing: '0.2em',
          },
        }}
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2, position: 'relative' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Unlock'}
        </Button>
      </Paper>
    </Box>
  );
};

export default PinLoginPage;
