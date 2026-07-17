
console.log("===== THIS IS SRC/INDEX.JS =====");
require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");
const { User } = require("./Schema");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    // Use sequelize.sync() instead of { alter: true } to avoid MySQL duplicate index bug (ER_TOO_MANY_KEYS)
    await sequelize.sync({ alter: true });
    console.log("Database models synced");

    // Seed super admin
    const superAdminId = process.env.SUPER_ADMIN_USER_ID || "abc";
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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
})();
