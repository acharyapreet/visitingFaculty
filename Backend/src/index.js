
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const authRouter = require('./routes/userRoutes');
const sequelize = require('./config/database');

const PORT = process.env.PORT;

const app = express();

app.use(express.json({limit: '10mb' }));
app.use(express.urlencoded({extended: true, limit: '10mb'}));
app.use(cors({ origin: true, credentials: true }));

app.use('/api/auth', authRouter);

try{
app.listen(PORT, async () =>{
    await sequelize.authenticate();
console.log('database connection done');

if(process.env.NODE_ENV ==='development'){
    await sequelize.sync({alter: true});
    console.log('database model synced');
}
    console.log('server running on prot ', PORT);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
}catch(error){
    console.log('failed to start server ', error);
}
