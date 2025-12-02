import cors from 'cors';
import { application } from './application.js';

const corsOptions = {
  origin: application.CLIENT_URL,
  credentials: true
};

export default cors(corsOptions);