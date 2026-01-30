import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // This links to your main logic file
import './index.css'     // Default Vite styles (you can leave this)
import './App.css'       // Your custom styles for the table and forms

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)