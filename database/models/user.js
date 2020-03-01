const Sequelize = require('sequelize');
const db = require('../db');

const User = db.define('user', {
    firstName : {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    email : {
        type: Sequelize.STRING,
        allowNull: false,
        required:true,
        unique: {
            args: true,
            msg: "Email already taken."
        }
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        required:true,
        len: [2,20]
    },
    profilePicture: {
        type: Sequelize.STRING,
        allowNull: false,
        required:true
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

module.exports = User;