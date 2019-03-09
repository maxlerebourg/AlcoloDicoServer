const Jwt = require('jsonwebtoken');
const uuid = require("uuid/v1");

const {User, Category, Game, Comment, sequelize} = require('./sequelize');

const login = async function (request, reply) {
    let payload = request.payload;
    return User.findOne({where: {mail: payload.mail, password: payload.password}}).then((user)=>{
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
    }).catch(() =>{
        return reply.response({
        status: 'bad credentials'
    })})
};

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
            return sequelize.query('SELECT g.*, avg(c.rate) as rate FROM `games` as g LEFT JOIN `comments` AS c ON g.id = c.gameId where g.visible group by g.id');
        }
    },
    {
        method: 'GET',
        path: '/comments/{id}',
        config: {auth: false},
        handler: (request) => {
            return Comment.findAll({
                where: {gameId: request.params.id},
                include: [{model: User, attributes: { exclude: ['password', 'mail', 'firstname', 'lastname'] }}],
                order: [['updatedAt', 'DESC']],
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
