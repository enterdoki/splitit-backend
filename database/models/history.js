const Sequelize = require('sequelize');
const db = require('../db');

const History = db.define('history', {
    type: {
        type: Sequelize.STRING,
        allowNull:false,
        require:true
    },
    amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        required: true
    },
    transactionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        required:true
    },
    friendId : {
        type: Sequelize.INTEGER,
        allowNull: false,
        required: true
    },
},{
    timestamps:false
});

module.exports = History;