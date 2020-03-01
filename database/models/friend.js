const Sequelize = require('sequelize');
const db = require('../db');

const Friend = db.define('friend', {
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    }
},{
    timestamps:false
});

module.exports = Friend;