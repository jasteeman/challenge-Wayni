import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import Loader from "./components/Loader";
import { router } from "./routes/router";
import { useSelector, useDispatch } from "react-redux";
import { ConfigProvider, ThemeConfig } from "antd";
import esEs from 'antd/locale/es_ES';
import { getToken, getUserLogger } from "./auth/AuthService"; 
import { setLoadingAuth, userLoggedIn, userLoggedOut } from "./redux/slices/authSlices";

function App() {
  const userLoading = useSelector((state: any) => state.auth.loadingAuth);
  const dispatch = useDispatch(); 

  useEffect(() => {
    const checkAuthOnLoad = async () => {
      dispatch(setLoadingAuth(true));
      try {
        const token = getToken();
        if (token) {
          const authenticatedUser = await getUserLogger();
          if (authenticatedUser) { 
            dispatch(userLoggedIn(authenticatedUser.user)); 
          } else {
            dispatch(userLoggedOut());
          }
        } else {
          dispatch(userLoggedOut());
        }
      } catch (error) {
        console.error("Error checking authentication on load:", error);
        dispatch(userLoggedOut());
      } finally {
        dispatch(setLoadingAuth(false));
      }
    };
    checkAuthOnLoad();
  }, [dispatch]);

  const config: ThemeConfig = {};

  if (userLoading) {
    return <Loader />;
  }

  return (
    <ConfigProvider locale={esEs} theme={config}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;