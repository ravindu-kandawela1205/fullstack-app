import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true
};

export default cors(corsOptions);