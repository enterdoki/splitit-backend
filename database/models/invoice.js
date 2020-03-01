const Sequelize = require('sequelize');
const db = require('../db');

const Invoice = db.define('invoice', {
    amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        required: true
    },
    note: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
    },
    senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        required: true,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        required: false,
        defaultValue: Sequelize.NOW
    }
},{
    timestamps:false
});

module.exports = Invoice;