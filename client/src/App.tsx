import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import TopBar from './components/Header'
import RegisterForm from './components/RegisterForm'
import Dokument from './components/Dokument'
import HomePage from './components/HomePage'
import ViewDok from './components/ViewDok'

import { AuthProvider } from './components/AuthContext'
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material'

function App() {

  const [lightDarkTheme, setLightDarkTheme] = useState<'light' | 'dark'>('light');

  const theme = createTheme({
    palette: {
      mode: lightDarkTheme
    }
  })


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        
        <BrowserRouter>
          <TopBar lightdarkmode={lightDarkTheme} setlightdarkmode={setLightDarkTheme}></TopBar>
          <Routes>
            <Route path="/" element={
              <HomePage></HomePage>
            }/>
            <Route path='/register' element={
              <>
                <RegisterForm></RegisterForm>
              </>
            }/>
            <Route path='/Document/:id' element={
              <>
                <Dokument></Dokument>
              </>
            }/>
            <Route path='/documentview/:code' element={
              <>
                <ViewDok></ViewDok>
              </>
            }/> 
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
