import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './app/App.tsx';
import { configureSchoolData } from './application/schoolData';
import { dbService } from './infrastructure/database/databaseService';
import './index.css';

configureSchoolData(dbService);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
