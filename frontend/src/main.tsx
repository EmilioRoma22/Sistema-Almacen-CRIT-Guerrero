import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RutaProtegida from './components/RutaProtegida'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import { Usuarios } from './components/usuarios/Usuarios'
import { Entradas } from './components/entradas/Entradas'
import LayoutPrivado from './components/LayoutPrivado'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<LayoutPrivado />}>
            <Route element={<RutaProtegida permitidoPara={[1]} />}>
              <Route path="/usuarios" element={<Usuarios />} />
            </Route>

            <Route element={<RutaProtegida permitidoPara={[1, 2]} />}>
              <Route path="/entradas" element={<Entradas />} />
            </Route>



          </Route>

        </Routes>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);

