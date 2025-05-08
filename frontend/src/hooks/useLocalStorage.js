import React, { Fragment, useEffect, useState } from 'react'


import { Navigate } from 'react-router-dom'
import DefaultLayout from 'src/layout/DefaultLayout'
import authService from 'src/services/auth.service'
import { toast, ToastContainer } from 'react-toastify';
 
const notifyError = (data) => {
    toast.error(data, {
      position: 'top-right',
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
  }


const ProtectedRoutes = (props) => {
	const [loggedIn, setLoggedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	const [user,setUser] = useState();

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const user = await authService.getCurrentUser();
				setUser(user)
				setLoggedIn(!!user);
			} catch (error) {
				console.log(error);
				localStorage.removeItem('token');
				setLoggedIn(false);
				notifyError(error)
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading) return <h1>Cargando...</h1>;

	return (
		<Fragment>
			{loggedIn ? <DefaultLayout /> : <Navigate to="/login" />}
			<div>
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
			</div>
		</Fragment>
	)
}

export default ProtectedRoutes;


