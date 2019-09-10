const config = require('./config');

const Sequelize = require('sequelize');

const sequelize = new Sequelize('mysql://root:' + config.mdp + '@127.0.0.1:3306/' + config.db);
sequelize.authenticate();

const Op = Sequelize.Op
const Game = sequelize.define('games', {
    name: {type: Sequelize.STRING},
    preview: {type: Sequelize.TEXT},
    rules: {type: Sequelize.TEXT},
    images: {type: Sequelize.TEXT},
    visible: {type: Sequelize.BOOLEAN},
    multiplayer: {type: Sequelize.INTEGER},
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
    alcohol: {type: Sequelize.DOUBLE},
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
    location: {type: Sequelize.STRING},
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
const Quote = sequelize.define('quotes', {
    date: {type: Sequelize.DATE},
    quote: {type: Sequelize.TEXT},
    link: {type: Sequelize.STRING},
    rate: {type: Sequelize.INTEGER},
    visible: {type: Sequelize.BOOLEAN},
});


Game.belongsTo(Category);
Category.hasMany(Game);
Game.belongsTo(User);
Cocktail.belongsTo(User);
Beer.belongsTo(User);
Comment.belongsTo(User);
Comment.belongsTo(Game);
Game.hasMany(Comment);
Quote.belongsTo(User);
Party.belongsTo(User);
User.belongsToMany(Party, {as: 'Parties',through: UserParty});
Party.belongsToMany(User, {as: 'Guests',through: UserParty});


module.exports = {Op, User, Category, Game, Comment, Cocktail, Beer, Party, UserParty, Quote, sequelize};
