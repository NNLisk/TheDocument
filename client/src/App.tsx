import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import TopBar from './components/Header'
import RegisterForm from './components/RegisterForm'
import { AuthProvider } from './components/AuthContext'
import HomePage from './components/HomePage'
import { useAuth } from './components/AuthContext'

function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
        <TopBar></TopBar>
        <Routes>
          <Route path="/" element={
            <HomePage></HomePage>
          }/>
          <Route path='/register' element={
            <>
              <RegisterForm></RegisterForm>
            </>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
