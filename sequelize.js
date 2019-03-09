const config = require('./config');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:' + config.mdp + '@127.0.0.1:3306/' + config.db);
sequelize.authenticate();


const Game = sequelize.define('games', {
    name: {type: Sequelize.STRING},
    preview: {type: Sequelize.TEXT},
    rules: {type: Sequelize.TEXT},
    images: {type: Sequelize.TEXT},
    visible: {type: Sequelize.BOOLEAN},
});
const User = sequelize.define('users', {
    pseudo: {type: Sequelize.STRING},
    firstname: {type: Sequelize.STRING},
    lastname: {type: Sequelize.STRING},
    mail: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    admin: {type: Sequelize.BOOLEAN},
});
const Category = sequelize.define('categories', {
    name: {type: Sequelize.STRING},
});
const Comment = sequelize.define('comments', {
    rate: {type: Sequelize.INTEGER},
    review: {type: Sequelize.TEXT},
});

Game.belongsTo(Category);
Game.belongsTo(User);
Comment.belongsTo(User);
Game.hasMany(Comment, {as: 'coms'});

module.exports = {User, Category, Game, Comment, sequelize};
