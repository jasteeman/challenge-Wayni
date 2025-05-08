import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUserLogger } from "../auth/AuthService";
import Loader from "./Loader";
import { useDispatch } from "react-redux";
import { userLoggedIn, userLoggedOut } from "../redux/slices/authSlices";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [loadingF, setLoadingF] = useState(true);  
  const [isAuth, setIsAuth] = useState<boolean | null>(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const checkUser = async () => {
      setLoadingF(true); 
      try {
        const token = getToken();
        if (!token) {
          navigate("/login");
          return;
        }

        const authenticated = await getUserLogger();

        if (authenticated) {  
          dispatch(userLoggedIn(authenticated.user)); 
          setIsAuth(true);
        } else {
          dispatch(userLoggedOut()); 
          navigate("/login");
        }
      } catch (error) {
        dispatch(userLoggedOut()); 
        console.error("Error checking authentication:", error);
        navigate("/login");
      } finally {
        dispatch(userLoggedOut()); 
        setLoadingF(false);
      }
    };

    checkUser();
  }, [navigate,dispatch]);

  if (loadingF) {
    return <Loader />;
  }

  return isAuth ? <>{children}</> : null;
};

export default PrivateRoute;
