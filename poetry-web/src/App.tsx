import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ThreeHundred from './pages/ThreeHundred'
import Poets from './pages/Poets'
import MyCollection from './pages/MyCollection'
import Auth from './pages/Auth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/three-hundred" element={<ThreeHundred />} />
          <Route path="/poets" element={<Poets />} />
          <Route path="/my-collection" element={<MyCollection />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
