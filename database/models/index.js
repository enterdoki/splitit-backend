const User = require("./user");
const Receipt = require('./receipt');
const History = require('./history');
const Friend = require('./friend');
const Invoice = require('./invoice');

User.hasMany(Receipt);
Receipt.belongsTo(User);

User.hasMany(History);
History.belongsTo(User);

Friend.belongsTo(User, {as: 'userOne'});
Friend.belongsTo(User, {as: 'userTwo'});

User.hasMany(Invoice);
Invoice.belongsTo(User);

module.exports = {
    User,
    Receipt,
    History,
    Friend,
    Invoice
};