import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import TopBar from './components/Header'

function App() {

  return (
    <>

      <BrowserRouter>
        <TopBar></TopBar>
        <Routes>
          <Route path="/" element={
            <>
              <h1>Hello</h1>
            </>
          }/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
