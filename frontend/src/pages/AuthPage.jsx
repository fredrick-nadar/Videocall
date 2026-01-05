import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#ff8c42',
    },
  },
});

export default function AuthPage() {

    const[userName, setUserName] = React.useState('');
    const[password, setPassword] = React.useState('');
    const[error, setError] = React.useState('');
    const[name,setName] = React.useState('');
    const[formState,setFormState] = React.useState('0');
    const[open,setOpen] = React.useState(false);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh', width: '100%', margin: 0, padding: 0, overflow: 'hidden' }}>
        <CssBaseline />
        <Grid
          item
          xs={12}
          sm={6}
          md={6}
          lg={6}
          sx={{
            width: { xs: '100%', sm: '50%', md: '50%' },
            flexGrow: 0,
            flexShrink: 0,
            flexBasis: { xs: '100%', sm: '50%', md: '50%' },
            maxWidth: { xs: '100%', sm: '50%', md: '50%' },
            backgroundImage: 'url(https://images.unsplash.com/photo-1767562521358-dc8670bdd0c7?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(20, 30, 48, 0.3), rgba(36, 59, 85, 0.2))',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center', p: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Welcome to VideoCall
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              Connect with anyone, anywhere
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={6} component={Paper} elevation={6} square sx={{
          width: { xs: '100%', sm: '50%', md: '50%' },
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: { xs: '100%', sm: '50%', md: '50%' },
          maxWidth: { xs: '100%', sm: '50%', md: '50%' },
          background: 'linear-gradient(135deg, rgba(142, 187, 211, 1), rgba(255, 255, 255, 1))',
        }}>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ 
              m: 1, 
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
              width: 56,
              height: 56,
              boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
            }}>
              <LockOutlinedIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 3, fontWeight: 600, color: '#2c3e50' }}>
              {formState === '0' ? 'Sign In' : 'Create Account'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Button 
                  variant={formState === '0' ? 'contained' : 'outlined'} 
                  onClick={() => setFormState('0')}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(formState === '0' ? {
                      background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff8c42, #ffa500)',
                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                      }
                    } : {
                      borderColor: '#ff6b35',
                      color: '#ff6b35',
                      '&:hover': {
                        borderColor: '#ff8c42',
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      }
                    })
                  }}
                >
                  Sign In
                </Button>
                <Button 
                  variant={formState === '1' ? 'contained' : 'outlined'} 
                  onClick={() => setFormState('1')}
                  sx={{
                    px: 4,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    ...(formState === '1' ? {
                      background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                      boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff8c42, #ffa500)',
                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                      }
                    } : {
                      borderColor: '#ff6b35',
                      color: '#ff6b35',
                      '&:hover': {
                        borderColor: '#ff8c42',
                        backgroundColor: 'rgba(255, 107, 53, 0.05)',
                      }
                    })
                  }}
                >
                  Sign Up
                </Button>
            </Box>
            <Box component="form" noValidate onSubmit sx={{ mt: 1, width: '100%' }}>
                {formState === '1' && (<TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="FullName"
                autoFocus
                onChange={(e)=>setName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#ff6b35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff6b35',
                  },
                }}
              />)}
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoFocus={formState === '0'}
                onChange={(e)=>setUserName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#ff6b35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff6b35',
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                onChange={(e)=>setPassword(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#ff6b35',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff6b35',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#ff6b35',
                  },
                }}
              />
              <FormControlLabel
                control={<Checkbox value="remember" sx={{
                  color: '#ff6b35',
                  '&.Mui-checked': {
                    color: '#ff6b35',
                  },
                }} />}
                label="Remember me"
                sx={{ mt: 1 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #ff6b35, #ff8c42)',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ff8c42, #ffa500)',
                    boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {formState === '0' ? 'Sign In' : 'Sign Up'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}