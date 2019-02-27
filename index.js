const Jwt = require('jsonwebtoken');
const uuid = require("uuid/v1");
const config = require('./config');

const Sequelize = require('sequelize');
const sequelize = new Sequelize('mysql://root:'+config.mdp+'@127.0.0.1:3306/'+config.db);
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


const login = async function (request, reply) {
    let payload = request.payload;
    let user = await User.findOne({where: {mail: payload.mail, password: payload.password}});
    if (user.id) {
        const jwtToken = Jwt.sign(user.id, 'NeverShareYourSecret',
            {
                algorithm: 'HS256',
                //expiresIn: 3600,
                //jwtid: uuid(),
                //issuer: 'AlcoloDico',
            });

        return reply.response({
            pseudo: user.pseudo,
            tokenType: 'JWT',
            token: 'Bearer ' + jwtToken,
        });
    } else return reply.response({
        status: 'bad credentials'
    })
};
const getUser = async function(request){

}

module.exports = [
    {
        method: 'POST',
        path: '/login',
        config: {auth: false},
        handler: async (request, reply) => {
            return login(request, reply);
        }
    },
    {
        method: 'POST',
        path: '/register',
        config: {auth: false},
        handler: async (request, reply) => {
            let payload = request.payload;
            console.log(payload);
            let user1 = await User.findOne({where: {mail: payload.mail}});
            let user2 = await User.findOne({where: {pseudo: payload.pseudo}});
            if (user1 || user2) return reply.response({status: 'Pseudo or mail already taken'});
            await User.create({
                mail: payload.mail,
                password: payload.password,
                firstname: payload.firstname,
                lastname: payload.lastname,
                pseudo: payload.pseudo,
                admin: false,
            });
            return login(request, reply)
        }
    },
    {
        method: 'GET',
        path: '/list/{cat}',
        config: {auth: false},
        handler: (request) => {
            return Game.findAll({
                where: {visible: true},
                include: [{model: Category, where: {id: request.params.cat}}],
                order: [['name', 'ASC']],
            })
        }
    },
    {
        method: 'GET',
        path: '/list/new',
        config: {auth: false},
        handler: (request) => {
            return Game.findAll({
                where: {visible: false},
                order: [['createdAt', 'DESC']],
            })
        }
    },
    {
        method: 'GET',
        path: '/list',
        config: {auth: false},
        handler: (request) => {
            return Game.findAll({
                where: {visible: true},
                include: [{model: Category}],
                order: [['name', 'ASC']],
            })
        }
    },
    {
        method: 'GET',
        path: '/comments/{id}',
        config: {auth: false},
        handler: (request) => {
            return Comment.findAll({
                where: {gameId: request.params.id},
                include: [{model: User}],
                order: [['createdAt', 'DESC']],
                limit: 3
            })
        }
    },
    {
        method: 'POST',
        path: '/comment/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            return Comment.findOne({
                where: {
                    gameId: Number(request.params.id),
                    userId: Number(request.auth.credentials)
                }
            }).then((comment) => {
                if (comment) { // update
                    return comment.update({
                        review: request.payload.review,
                        rate: Number(request.payload.rate),
                    });
                } else { // insert
                    return Comment.create({
                        gameId: Number(request.params.id),
                        userId: Number(request.auth.credentials),
                        review: request.payload.review,
                        rate: Number(request.payload.rate),
                        updatedAt: new Date(),
                    });
                }
            })
        }
    },
    {
        method: 'POST',
        path:
            '/add',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            var game = request.payload;
            console.log(game);
            return Game.findOrCreate({
                where: {name: game.name},
                defaults: {
                    rules: game.rules,
                    preview: game.preview,
                    images: game.images,
                    categoryId: Number(game.category),
                    visible: false,
                    userId: request.auth.credentials
                }
            });
        }
    }
]
;


/*const init = async () => {
    await
        server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
})

init();*/
