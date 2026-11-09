import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Ensure the page always starts at the top on initial load / refresh
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
