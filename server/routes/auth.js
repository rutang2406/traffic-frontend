import { addUser, verifyUser } from '../utils/userManager.js';

// Signup endpoint
export async function handleSignup(req, res) {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email and password are required' 
      });
    }
    
    const user = await addUser(email, password, name);
    
    res.json({
      success: true,
      message: 'User created successfully',
      user: {
        name: user.name,
        email: user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=000&color=fff`
      }
    });
    
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Login endpoint
export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await verifyUser(email, password);
    
    if (user) {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          name: user.name,
          email: user.email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=000&color=fff`
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
