import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

ReactDOM.render(
    <App />,
    document.getElementById('app')
)

if (process.env.NODE_ENV !== 'production') {
    console.log('Looks like we are in development mode!');
} else {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('//@SW_PATH@').then(registration => {
            console.log('SW registered: ', registration);
          }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
        });
      }
}