import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const app = googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}><App googleEnabled /></GoogleOAuthProvider>
) : <App googleEnabled={false} />;

createRoot(document.getElementById('root')).render(<StrictMode>{app}</StrictMode>);

