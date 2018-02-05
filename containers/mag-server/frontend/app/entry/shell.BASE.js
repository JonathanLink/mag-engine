import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

<noscript>
 Hum, we have a problem. Your device should accept javascript.
</noscript>

ReactDOM.render(
    <App />,
    document.getElementById('app')
)

if (process.env.NODE_ENV !== 'production') {
    console.log('Looks like we are in development mode!');
} else {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          //navigator.serviceWorker.register('//@SW_PATH@').then(registration => {
          navigator.serviceWorker.register('./sw.js').then(registration => {
            console.log('SW registered: ', registration);
          }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
        });
      }
}