import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import { setLoadingAuth, userLoggedIn } from '../redux/slices/authSlices';
import { getUserLogger } from './AuthService';
import { useDispatch } from 'react-redux';

const Callback: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        dispatch(setLoadingAuth(true));
        const {user} = await getUserLogger(); 
        dispatch(userLoggedIn(user));
        navigate('/home');
      } catch (error) {
        console.error('Error al obtener la información del usuario:', error);
        dispatch(setLoadingAuth(false));
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [dispatch, navigate]);

  if (loading) {
    return <div>Autenticación en curso...</div>;
  }
};

export default Callback;
