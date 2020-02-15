const Sequelize = require('sequelize');
const db = require('../db');

const User = db.define('user', {
    firstname : {
        type: Sequelize.STRING,
        allowNull: false,
        required: true
    },
    lastname: {
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
    }
},{
    timestamps:false
});

module.exports = User;