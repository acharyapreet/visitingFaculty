// require('dotenv').config();
// const sequelize = require('./src/config/database');

// async function cleanupDatabase() {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connected');

//     // Drop all tables
//     await sequelize.drop({ cascade: true });
//     console.log('All tables dropped');

//     // Recreate tables
//     await sequelize.sync({ force: true });
//     console.log('Database recreated successfully');

//     process.exit(0);
//   } catch (error) {
//     console.error('Error cleaning up database:', error);
//     process.exit(1);
//   }
// }

// cleanupDatabase();
