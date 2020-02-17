const User = require("./user");
const Receipt = require('./receipt');
const History = require('./history');
const Friend = require('./friend');

User.hasMany(Receipt);
Receipt.belongsTo(User);

User.hasMany(History);
History.belongsTo(User);

Friend.belongsTo(User, {as: 'userOne'});
Friend.belongsTo(User, {as: 'userTwo'});

module.exports = {
    User,
    Receipt,
    History,
    Friend
};