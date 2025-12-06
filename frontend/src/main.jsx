import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Import context providers
import { AuthProvider } from './context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { NotesProvider } from './context/DocContext.jsx'
import { WebRTCProvider } from './context/WebRTCContext.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>

      <NotesProvider>
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <WebRTCProvider>
                <App />
              </WebRTCProvider>

            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </NotesProvider>



    </BrowserRouter>
  </React.StrictMode>,
)