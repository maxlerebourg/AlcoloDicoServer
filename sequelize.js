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
const Cocktail = sequelize.define('cocktails', {
    name: {type: Sequelize.STRING},
    preview: {type: Sequelize.TEXT},
    ingredients: {type: Sequelize.TEXT},
    recipe: {type: Sequelize.TEXT},
    images: {type: Sequelize.TEXT},
    visible: {type: Sequelize.BOOLEAN},
});
const Beer = sequelize.define('beers', {
    name: {type: Sequelize.STRING},
    alcool: {type: Sequelize.DOUBLE},
    price: {type: Sequelize.DOUBLE},
    origin: {type: Sequelize.TEXT},
    images: {type: Sequelize.TEXT},
    brand: {type: Sequelize.TEXT},
});
const User = sequelize.define('users', {
    pseudo: {type: Sequelize.STRING},
    firstname: {type: Sequelize.STRING},
    lastname: {type: Sequelize.STRING},
    mail: {type: Sequelize.STRING},
    password: {type: Sequelize.STRING},
    admin: {type: Sequelize.BOOLEAN},
    notification_id: {type: Sequelize.STRING},
});
const Party = sequelize.define('parties', {
    date: {type: Sequelize.DATE},
    note: {type: Sequelize.TEXT},
    visible: {type: Sequelize.BOOLEAN},
});
const UserParty = sequelize.define('users_parties');

const Category = sequelize.define('categories', {
    name: {type: Sequelize.STRING},
});
const Comment = sequelize.define('comments', {
    rate: {type: Sequelize.INTEGER},
    review: {type: Sequelize.TEXT},
});


Game.belongsTo(Category);
Game.belongsTo(User);
Cocktail.belongsTo(User);
Beer.belongsTo(User);
Comment.belongsTo(User);
Comment.belongsTo(Game);
Party.belongsTo(User);
User.belongsToMany(Party, {as: 'Parties',through: UserParty});
Party.belongsToMany(User, {as: 'Guests',through: UserParty});


module.exports = {User, Category, Game, Comment, Cocktail, Beer, Party, UserParty, sequelize};
