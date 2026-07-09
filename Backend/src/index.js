
console.log("===== THIS IS SRC/INDEX.JS =====");
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const authRouter = require('./routes/userRoutes');
const billRoutes = require('./routes/billRoutes');
const sequelize = require('./config/database');

require('./Schema');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

app.use('/api/auth', authRouter);
app.use('/api/bills', billRoutes);



(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
     
    console.log("Loaded Models:", Object.keys(sequelize.models));

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synced');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();