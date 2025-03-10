import express from 'express';
import routes from './routes/routes';
import sequelize from './config/database';
import cors from 'cors';

const app = express()
const port = 3000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.json());
app.use('/api', routes)

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synced');

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error syncing the database:', error);
  }
};

startServer();