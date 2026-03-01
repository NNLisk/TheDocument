import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import TopBar from './components/Header'
import RegisterForm from './components/RegisterForm'
import Dokument from './components/Dokument'
import HomePage from './components/HomePage'
import ViewDok from './components/ViewDok'

import { AuthProvider } from './components/AuthContext'

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
  )
}

export default App
