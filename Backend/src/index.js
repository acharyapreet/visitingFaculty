
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
const SuperAdminApprovalRouter = require('./routes/superAdminApprovalRoutes');
const AdminApprovalRouter = require('./routes/adminApprovalRoutes');

const { User } = require('./Schema');

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
app.use('/api/super_admin', SuperAdminApprovalRouter);
app.use('/api/admin', AdminApprovalRouter);



(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
     
    // console.log("Loaded Models:", Object.keys(sequelize.models));

    if (process.env.NODE_ENV === 'development') {
      // Use sequelize.sync() instead of { alter: true } to avoid MySQL duplicate index bug (ER_TOO_MANY_KEYS)
      await sequelize.sync();
      console.log('Database models synced');
    }

    // Seed super admin
    const superAdminId = process.env.SUPER_ADMIN_USER_ID || 'abc';
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'abc@gmail.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ADMIN';

    await User.findOrCreate({
      where: { user_id: superAdminId },
      defaults: {
        role: 'super_admin',
        email: superAdminEmail,
        password_hash: superAdminPassword, // Auto-hashed by user model beforeCreate hook
        full_name: 'Super Admin',
        phone_number: '0000000000',
        is_approved: true,
        is_active: true
      }
    });
    console.log('Super Admin seeded successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();