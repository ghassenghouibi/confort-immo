import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listings from './pages/Listings'
import Property from './pages/Property'
import Videos from './pages/Videos'
import { Agences, Conseils, Contact, Deposer } from './pages/Static'

function Layout() {
  const { pathname } = useLocation()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header overlay={pathname === '/'} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/acheter" element={<Listings rubrique="acheter" />} />
          <Route path="/louer" element={<Listings rubrique="louer" />} />
          <Route path="/bureaux-et-commerces" element={<Listings rubrique="bureaux-et-commerces" />} />
          <Route path="/favoris" element={<Listings rubrique="acheter" favoritesOnly />} />
          <Route path="/bien/:id" element={<Property />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/agences" element={<Agences />} />
          <Route path="/conseils" element={<Conseils />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/deposer" element={<Deposer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
