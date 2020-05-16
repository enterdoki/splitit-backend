require('dotenv').config();
const Sequelize = require('sequelize');

const db = new Sequelize(process.env.DATABASE_URL,
    {
        dialectOptions: {
            ssl: true
        },
        logging: false
    });

try {
    db.authenticate();
    db.sync({
        force: false
    });
    console.log("Connection Established.")
} catch (err) {
    console.log('Unable to establish connection', err);
}
module.exports = db;