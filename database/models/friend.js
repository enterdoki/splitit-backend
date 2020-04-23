const Sequelize = require('sequelize');
const db = require('../db');

const Friend = db.define('friend', {
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    balance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        required: false,
        defaultValue: 0.00
    }
},{
    timestamps:false
});

module.exports = Friend;