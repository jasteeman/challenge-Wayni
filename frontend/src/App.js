import React, { Component, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes, useOutlet, Outlet } from 'react-router-dom'
import ProtectedRoutes from './hooks/useLocalStorage'
import './scss/style.scss'


const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))


class App extends React.Component {
  render() {
    return (
      <HashRouter>
        <Suspense fallback={loading}>
          <Routes>
            <Route exact path="/login" name="Login Page" element={<Login />} />
            
            <Route exact path='*' element={<ProtectedRoutes />}>
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    )
  }
  
}

export default App
