import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Properties from './pages/Properties'
import Sell from './pages/Sell'
import Details from './pages/Details'
import Prediction from './pages/Prediction'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <>
      <Header />
      <main style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/details" element={<Details />} />
          <Route path="/prediction" element={<Prediction />} />
        </Routes>
      </main>
    </>
  )
}

export default App
