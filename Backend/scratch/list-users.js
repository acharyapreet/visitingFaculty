// list-users.js – simple script to list all users in the DB

const path = require('path');
const { sequelize, User } = require(path.join(__dirname, '..', 'src', 'Schema'));

(async () => {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({ order: [['user_id', 'ASC']] });
    console.log('=== Users ===');
    users.forEach(u => {
      console.log(`id: ${u.user_id}, uvfin: ${u.uvfin}, role: ${u.role}, email: ${u.email}`);
    });
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to list users:', err);
    process.exit(1);
  }
})();
