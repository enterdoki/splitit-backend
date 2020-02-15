const User = require("./user");
const Receipt = require('./receipt');
const History = require('./history');

User.hasMany(Receipt);
Receipt.belongsTo(User);

User.hasMany(History);
History.belongsTo(User);

module.exports = {
    User,
    Receipt,
    History
};