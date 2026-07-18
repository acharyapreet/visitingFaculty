console.log("===== THIS IS SRC/INDEX.JS =====");
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const authRouter = require('./routes/userRoutes');
const billRoutes = require('./routes/billRoutes');
const SuperAdminApprovalRouter = require('./routes/superAdminApprovalRoutes');
const AdminApprovalRouter = require('./routes/adminApprovalRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const accountStatusRoutes = require('./routes/accountStatusRoutes');

// Load schemas to register relationships
require('./Schema');

const app = express();

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

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
app.use('/api/attendance', attendanceRoutes);
app.use('/api/account-status', accountStatusRoutes);

const sequelize = require('./config/database');
const { User } = require('./Schema');
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('Database models synced');

    // Seed super admin
    const superAdminId = parseInt(process.env.SUPER_ADMIN_USER_ID || '1', 10);
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'abc@gmail.com';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ADMIN';

    await User.findOrCreate({
      where: { user_id: superAdminId },
      defaults: {
        role: 'super_admin',
        email: superAdminEmail,
        password_hash: superAdminPassword,
        full_name: 'Super Admin',
        phone_number: '0000000000',
        is_approved: true,
        is_active: true,
      },
    });
    console.log('Super Admin seeded successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();
