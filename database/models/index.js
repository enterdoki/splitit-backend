const User = require("./user");
const Receipt = require('./receipt');

User.hasMany(Receipt);
Receipt.belongsTo(User);

module.exports = {
    User,
    Receipt
};