require('dotenv').config();
const sequelize = require('./src/config/database');
const { User } = require('./src/Schema');

async function cleanupDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Disable foreign key checks to allow dropping tables smoothly in MySQL
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('Foreign key checks disabled');

    // Recreate all tables cleanly
    await sequelize.sync({ force: true });
    console.log('Database tables recreated successfully');

    // Enable foreign key checks back
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('Foreign key checks enabled');

    // Seed super admin
    const superAdminId = parseInt(process.env.SUPER_ADMIN_USER_ID || "1", 10);
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "abc@gmail.com";
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "ADMIN";

    await User.findOrCreate({
      where: { user_id: superAdminId },
      defaults: {
        role: "super_admin",
        email: superAdminEmail,
        password_hash: superAdminPassword, // Auto-hashed by user model beforeCreate hook
        full_name: "Super Admin",
        phone_number: "0000000000",
        is_approved: true,
        is_active: true,
      },
    });
    console.log("Super Admin seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning up database:', error);
    process.exit(1);
  }
}

cleanupDatabase();
