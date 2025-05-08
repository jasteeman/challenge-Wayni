import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../pages/special-pages/ErrorPage";
import MainLayout from "../components/MainLayout";
import NotFound from "../pages/special-pages/NotFound";
import Callback from "../auth/Callback";
import PrivateRoute from "../components/PrivateRoute";
import Login from "../pages/Login"; 

export const router = createBrowserRouter([
    {
        path: "callback",
        element: <Callback />,
    },
    {
        path: "login",
        element: <Login />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
    {
        path: "/",
        element: (
            <PrivateRoute>
                <MainLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                path: "home",
                lazy: async () => { 
                    let  {HomePage}= await import("../pages/Home");
                    return { Component: HomePage };
                }
            },
            {
                path: "entidades",
                lazy: async () => { 
                    let  {GestionEntidades}= await import("../pages/Entidad");
                    return { Component: GestionEntidades };
                }
            },
            {
                path: "/entidades/deudores/:id",
                lazy: async () => { 
                    let  {DeudorPage}= await import("../pages/Deudor");
                    return { Component: DeudorPage };
                }
              },
            {
                path: "users",
                lazy: async () => {
                    let { User } = await import("../pages/User");
                    return { Component: User };
                }
            }
        ],
    },
], { basename: "/" });