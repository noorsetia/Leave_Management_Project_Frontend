import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login', { 
          state: { error: 'Authentication failed. Please try again.' } 
        });
        return;
      }

      if (!token) {
        navigate('/login', { 
          state: { error: 'No authentication token received.' } 
        });
        return;
      }

      try {
        // Fetch user data with the token
        const response = await authAPI.getCurrentUser(token);
        const user = response.data.user;

        // Check if we need to update the role from localStorage
        const pendingRole = localStorage.getItem('pendingOAuthRole');
        if (pendingRole && user.role !== pendingRole) {
          // Update user role if needed
          // This can be implemented later if role selection during OAuth is required
        }
        
        // Clean up
        localStorage.removeItem('pendingOAuthRole');

        // Log the user in
        login(user, token);
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        navigate('/login', { 
          state: { error: 'Failed to complete authentication.' } 
        });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Completing Sign In</h2>
        <p className="text-blue-100">Please wait while we set up your account...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
