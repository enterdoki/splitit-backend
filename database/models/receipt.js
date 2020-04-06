const Sequelize = require('sequelize');
const db = require('../db');

const Receipt = db.define('receipt', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        required: false,
        defaultValue: 'default'
    },
    imageURL: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    uploadDate: {
        type: Sequelize.DATE,
        allowNull: false,
        required:true
    }
},{
    timestamps:false
});

module.exports = Receipt;