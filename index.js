const Jwt = require('jsonwebtoken');
const uuid = require("uuid/v1");
const config = require('./config');
const requester = require("request-promise");


const {Op, User, Category, Game, Comment, Cocktail, Beer, Party, UserParty, Quote, sequelize} = require('./sequelize');


var meteo = {date: '', json: []};
var beer = {date: '', id: 0};

const login = async function (request, reply) {
    let payload = request.payload;
    return User.findOne({where: {mail: payload.mail, password: payload.password}}).then((user) => {
        const jwtToken = Jwt.sign(user.id, 'NeverShareYourSecret',
            {
                algorithm: 'HS256',
                //expiresIn: 3600,
                //jwtid: uuid(),
                //issuer: 'AlcoloDico',
            });
        return reply.response({
            id: user.id,
            pseudo: user.pseudo,
            tokenType: 'JWT',
            token: 'Bearer ' + jwtToken,
        });
    }).catch(() => {
        return reply.response({
            status: 'bad credentials'
        })
    })
};
const notify_admin = function (text) {
    User.findOne({where: {admin: true}}).then((admin) => {
        let message = {
            notification: {
                title: 'Notif Admin',
                body: text
            },
            to: admin.notification_id
        };
        let fcm_send = {
            method: 'POST',
            url: 'https://fcm.googleapis.com/fcm/send',
            headers: {
                'Content-Type':'application/json',
                Authorization: 'key='+config.fcm_notif,
            },
            body: JSON.stringify(message)
        };
        requester(fcm_send);
    });
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
        path: '/notification_id/{token}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            return user.update({notification_id: request.params.token})
                .then(() => {return reply.response({status: 'ok'});})
                .catch(() => {return reply.response({status: 'failure'});
            })
        }
    },
    {
        method: 'GET',
        path: '/list/game/{cat}',
        config: {auth: false},
        handler: (request) => {
            return Game.findAll({
                where: {visible: true, categoryId: request.params.cat},
                order: [['name', 'ASC']],
                include: [{
                    required: false,
                    model: Comment,
                    attributes: [
                        [Comment.sequelize.fn('AVG', Comment.sequelize.col('rate')), 'rate'],
                        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('rate')), 'comments'],
                    ],

                }],
                group: ['gameId', 'id'],
            })
        }
    },
    {
        method: 'GET',
        path: '/list/game/new',
        config: {auth: false},
        handler: (request) => {
            let date = new Date().getTime() - 86400000 * 7;
            return Game.findAll({
                where: {[Op.or]: [{visible: false}, {updatedAt: {[Op.gte]:date}}]},
                order: [['createdAt', 'DESC']],
                include: [{
                    required: false,
                    model: Comment,
                    attributes: [
                        [Comment.sequelize.fn('AVG', Comment.sequelize.col('rate')), 'rate'],
                        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('rate')), 'comments'],
                    ],

                }],
                group: ['gameId', 'id'],
            })
        }
    },
    {
        method: 'GET',
        path: '/list/game',
        config: {auth: false},
        handler: (request) => {
            return sequelize.query('SELECT g.*, avg(c.rate) as rate FROM `games` as g LEFT JOIN `comments` AS c ON g.id = c.gameId where g.visible group by g.id order by g.name');
        }
    },
    {
        method: 'GET',
        path: '/list/games',
        config: {auth: false},
        handler: (request) => {
            return Game.findAll({
                where: {visible: true, categoryId: {[Op.lte]: 5},},
                include: [{
                    required: false,
                    model: Comment,
                    attributes: [
                        [Comment.sequelize.fn('AVG', Comment.sequelize.col('rate')), 'rate'],
                        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('rate')), 'comments'],
                    ],

                }],
                group: ['gameId', 'id'],
                order: ['name']
            });
        }
    },
    {
        method: 'GET',
        path: '/list/video_games',
        config: {auth: false},
        handler: (request) => {
            return Game.findAll({
                where: {visible: true, categoryId: {[Op.gte]: 5}},
                include: [{
                    required: false,
                    model: Comment,
                    attributes: [
                        [Comment.sequelize.fn('AVG', Comment.sequelize.col('rate')), 'rate'],
                        [Comment.sequelize.fn('COUNT', Comment.sequelize.col('rate')), 'comments'],
                    ],

                }],
                group: ['gameId', 'id'],
                order: ['name']
            });
        }
    },
    {
        method: 'GET',
        path: '/list/quote/{filter}/{limit}/{offset}',
        config: {auth: false},
        handler: (request) => {
            switch (request.params.filter) {
                case 'new' :
                    return Quote.findAll({
                        where: {visible: true},
                        order: [['date','DESC']],
                        limit: Number(request.params.limit),
                        offset: Number(request.params.offset),
                        include: [{model: User, attributes: ['pseudo']}]
                    });
                case 'random' :
                    return Quote.findAll({
                        where: {visible: true},
                        order: [[sequelize.literal('RAND()')]],
                        limit: Number(request.params.limit),
                        offset: Number(request.params.offset),
                        include: [{model: User, attributes: ['pseudo']}]
                    });
                case 'rate' :
                    let date = new Date() - 86400000 * 31;
                    return Quote.findAll({
                        where: {date: {[Op.gte]: date}, visible: true},
                        order: [['rate','DESC']],
                        limit: Number(request.params.limit),
                        offset: Number(request.params.offset),
                        include: [{model: User, attributes: ['pseudo']}]
                    });
            }
        }
    },
    {
        method: 'POST',
        path: '/add/quote',
        config: {auth: 'jwt'},
        handler: async (request) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            let quote = request.payload;
            return Quote.findOrCreate({
                where: {quote: quote.quote},
                defaults:{
                    link: quote.link,
                    date: quote.date,
                    rate: 0,
                    visible: true,
                    userId: Number(user.id),
                }})
        }
    },
    {
        method: 'GET',
        path: '/quote/{id}/plus',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            let quote = await Quote.findByPk(request.params.id);
            if (!quote)
                return reply.response({status: 'This quote does not exist'});
            return quote.update({rate: quote.rate + 1});
        }
    },
    {
        method: 'GET',
        path: '/list/cocktail',
        config: {auth: false},
        handler: (request) => {
            return Cocktail.findAll({
                where: {visible: true},
                order: [['name', 'ASC']],
            })
        }
    },
    {
        method: 'GET',
        path: '/beer',
        config: {auth: false},
        handler: (request) => {
            let today = new Date().toISOString().substring(0, 10);
            if (beer.date === today) {
                return Beer.findOne({
                    where: {id: beer.id},
                })
            } else {
                return Beer.findOne({
                    order: [[sequelize.literal('RAND()')]],
                }).then((data) => {
                    beer = {date: today, id: data.id};
                    return data;
                })
            }


        }
    },
    {
        method: 'GET',
        path: '/search/user/{name}',
        config: {auth: false},
        handler: (request) => {
            return User.findAll({
                limit: 10,
                where: {
                    [Op.or]: [
                        {firstname: sequelize.where(sequelize.fn('LOWER', sequelize.col('firstname')), 'LIKE', '%' + request.params.name + '%')},
                        {pseudo: sequelize.where(sequelize.fn('LOWER', sequelize.col('pseudo')), 'LIKE', '%' + request.params.name + '%')}
                    ]},
                attributes: ['id', 'pseudo', 'firstname'],
                order: [[sequelize.literal('RAND()')]]
            });
        }
    },
    {
        method: 'GET',
        path: '/party',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            return user.getParties({
                where: {visible: true},
                include: [{model: User,
                    attributes: {exclude: ['password', 'mail', 'notification_id']}
                }],

            })
        }
    },
    {
        method: 'GET',
        path: '/party/month/{month}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            let date = new Date(request.params.month);
            let startMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            let endMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            return user.getParties({
                where: {visible: true, [Op.and] : [{date : {[Op.gte]: startMonth}},{date :  {[Op.lt]: endMonth}}]},
                include: [{model: User,
                    attributes: {exclude: ['password', 'mail', 'notification_id']}
                }],

            })
        }
    },
    {
        method: 'GET',
        path: '/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            let party = await Party.findByPk(request.params.id);
            if (!party)
                return reply.response({status: 'This party does not exist.'});
            let ok = await Party.findByPk(request.params.id);
            if (!ok)
                return reply.response({status: 'You are not in the party team.'});
            return party.getGuests({
                attributes: ['id', 'pseudo', 'firstname'],
            })
        }
    },
    {
        method: 'POST',
        path: '/update/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let payload = request.payload;
            let user = await User.findByPk(request.auth.credentials);
            if (!user) return reply.response({status: 'You are not log in'});
            let party = await Party.findByPk(Number(request.params.id));
            if (!party) return reply.response({status: 'This party does not exist'});
            if (party.userId === Number(request.auth.credentials)) {
                return party.update({
                    location: (payload.location ? payload.location : party.location),
                    date: (payload.date ? payload.date : party.date),
                    note: (payload.note ? payload.note : party.note),
                })
            } else return reply.response({status: 'You are not the owner of this party'});
        }
    },
    {
        method: 'POST',
        path: '/create/party',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            return Party.findOrCreate({
                where: {
                    date: new Date(request.payload.date),
                    userId: request.auth.credentials,
                    visible: true
                },
                defaults: {visible: true}
            }).then((party) => {
                UserParty.findOrCreate({where: {partyId: party[0].id, userId: user.id}});
                return party;
            });
        }
    },
    {
        method: 'GET',
        path: '/cancel/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            return Party.findByPk(request.params.id)
                .then((party) => {
                    if (party.visible === false) {
                        return reply.response({status: 'This party is already canceled'});
                    } else if (party.userId === Number(request.auth.credentials)) {
                        return party.update({visible: false});
                    } else {
                        return reply.response({status: 'This is not your party'});
                    }
                }).catch(() => {
                    return reply.response({status: 'WTF'});
                });
        }
    },
    {
        method: 'POST',
        path: '/note/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            return user.getParties().then(async (parties) => {
                    let party = await parties.find((i) => {return i.id === Number(request.params.id)});
                    return party.update({note: (party.note ? party.note + (party.note.length < 1000 ?
                            request.payload.note + '\n' : '') : request.payload.note + '\n')});
                }
            ).catch(() => {
                return reply.response({status: 'You are not in this party'});
            });
        }
    },
    {
        method: 'POST',
        path: '/add/user/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            let invited = await User.findByPk(request.payload.id);
            if (!invited)
                return reply.response({
                    name: 'He does not exist'
                });
            return Party.findByPk(request.params.id)
                .then(async (party) => {
                    let bool = await party.hasGuest(invited);
                    if (party.userId === Number(request.auth.credentials) && !bool) {
                        return party.addGuest(invited).then(() => {
                                if (invited.notification_id){
                                    let message = {
                                        notification: {
                                            title: 'Invitation',
                                            body: user.pseudo + ' vous a invité à sa soirée du ' +
                                                party.date.getDate()+'/'+party.date.getMonth()+'/'+party.date.getFullYear(),
                                        },
                                        to: invited.notification_id
                                    };
                                    let fcm_send = {
                                        method: 'POST',
                                        url: 'https://fcm.googleapis.com/fcm/send',
                                        headers: {
                                            'Content-Type':'application/json',
                                            Authorization: 'key='+config.fcm_notif,
                                        },
                                        body: JSON.stringify(message)
                                    };
                                    console.log(fcm_send);
                                    requester(fcm_send);
                                }
                                return reply.response({
                                    status: invited.pseudo + ' is invited'
                                })
                            }
                        );

                    } else {
                        return reply.response({
                            status: 'This is not your party or guest is already in your team party.'
                        });
                    }
                });
        }
    },
    {
        method: 'POST',
        path: '/remove/user/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    name: 'You are not log in'
                });
            let invited = await User.findByPk(request.payload.id);
            if (!invited)
                return reply.response({
                    name: 'He does not exist'
                });
            return Party.findByPk(request.params.id)
                .then((party) => {
                    if (party.userId === Number(request.auth.credentials)) {
                        UserParty.destroy({where: {partyId: party.id, userId: invited.id}});
                        return reply.response({
                            status: invited.pseudo + ' is not invited anymore'
                        });
                    } else {
                        return reply.response({
                            status: 'This is not your party'
                        });
                    }
                });
        }
    },
    {
        method: 'GET',
        path: '/comments/game/{id}',
        config: {auth: false},
        handler: (request) => {
            return Comment.findAll({
                where: {gameId: request.params.id},
                include: [{model: User, attributes: {exclude: ['password', 'mail', 'firstname', 'lastname']}}],
                order: [['updatedAt', 'DESC']],
                limit: 3
            })
        }
    },
    {
        method: 'POST',
        path: '/comment/game/{id}',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    status: 'You are not log in'
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
                        updatedAt: new Date(),
                    });
                } else { // insert
                    return Comment.create({
                        review: request.payload.review,
                        rate: Number(request.payload.rate),
                        gameId: Number(request.params.id),
                        userId: Number(request.auth.credentials),
                    });
                }
            })
        }
    },
    {
        method: 'POST',
        path: '/add/game',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    status: 'You are not log in'
                });
            var game = request.payload;
            console.log(game);
            notify_admin('nouveau jeu disponible : ' + game.name);

            return Game.findOrCreate({
                where: {name: game.name},
                defaults: {
                    rules: game.rules,
                    preview: game.preview,
                    images: game.images,
                    categoryId: Number(game.category),
                    visible: false,
                    multiplayer: game.multiplayer,
                    userId: request.auth.credentials
                }
            });
        }
    },
    {
        method: 'GET',
        path: '/meteo',
        config: {auth: false},
        handler: async (request, reply) => {
            let today = new Date().toISOString().substring(0, 10);
            if (meteo.date === today) {
                return {new: false, temp: meteo.json[today + ' 20:00:00'].temperature['2m'] - 273}
            } else {
                return requester('https://www.infoclimat.fr/public-api/gfs/json?_ll=48.85341,2.3488&_auth=Bx1UQwF%2FByUCL1NkDnhQeVQ8BDFZL1dwUS0BYg1oXiMAa1c2AmIBZwVrBntUe1BmVXgAYwswUmIEb1UtAXNTMgdtVDgBagdgAm1TNg4hUHtUegRlWXlXcFE6AWANfl4%2FAGBXOwJ%2FAWUFawZ6VGVQbFV5AH8LNVJvBGJVMAFlUzMHYVQ1AWUHZwJyUy4OO1A3VG8EMlkzVz5ROwFiDTVeaABiVzYCaQFiBXQGZlRgUGxVZABmCzVSbQRvVS0Bc1NJBxdULQEiBycCOFN3DiNQMVQ5BDA%3D&_c=01b214b2b9f89dc8498f35bfb06ea7bb')
                    .then((data) => {
                        data = JSON.parse(data);
                        if (data['request_state'] === 200) {
                            meteo = {date: today, json: data};
                            return {new: true, temp: data[today + ' 20:00:00'].temperature['2m'] - 273};
                        } else return {temp: false};
                    });
            }
        }
    },
    {
        method: 'GET',
        path: '/party/stat',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    status: 'You are not log in'
                });
            let users = [];
            let peopleById = {};
            await user.getParties({where: {visible: true}}).then(
                async (parties) => {
                    for (let party of parties){
                        let usrs = await party.getGuests({attributes: ['pseudo', 'firstname', 'id']});
                        for (let usr of usrs) {
                            users.push({
                                pseudo: usr.pseudo,
                                firstname: usr.firstname,
                                id: usr.id,
                                date: party.date,
                                location: party.location ? party.location : party.userId,
                            })
                        }
                    }
                });
            let stat = [];
            for (let guest of users) {
                let item = await stat.find((item) => {
                    return item.id === guest.id
                });
                if (item) {
                    item.counter = item.counter + 1;
                    item.dataPoints.push({x: guest.date.toISOString().substring(0,10), y: item.counter, z: guest.location});
                } else {
                    let usr = {
                        pseudo: guest.pseudo,
                        firstname: guest.firstname,
                        id: guest.id,
                        counter: 1,
                        dataPoints: [{x:guest.date.toISOString().substring(0,10), y: 1, z: guest.location}],
                    };
                    stat.push(usr);
                }
            }
            return stat;
        }
    },
    {
        method: 'GET',
        path: '/party/stats',
        config: {auth: 'jwt'},
        handler: async (request, reply) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({
                    status: 'You are not log in'
                });
            return User.findAll({
                attributes: ['pseudo', 'firstname', 'id'],
                include: [{
                    model: Party,
                }]
            });
        }
    },
    {
        method: 'GET',
        path: '/rendement',
        config: {auth: false},
        handler: async (request, reply) => {
            let rep = [];
            let auchan = {
                method: 'GET',
                url: 'https://www.auchandirect.fr/rayons/9',
                headers: {
                    Host: 'www.auchandirect.fr',
                    Accept: 'application/json',
                    'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                    'X-Requested-With': 'XMLHttpRequest',
                    Connection: 'keep-alive',
                    TE: 'Trailers',
                    CacheControl: 'no-cache'
                }
            };
            await requester(auchan)
                .then(async (body) => {
                    console.log(body);
                });



            /*let carrouf = {
                method: 'GET',
                url: 'https://www.carrefour.fr/r/boissons-et-cave-a-vins/cave-a-bieres-et-cidres?sort=productSimpleView.pricePerUnitCents&noRedirect=0&page=1',
                headers: {
                    Host: 'www.carrefour.fr',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
                    Accept: 'application/json',
                    'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                    Referer: 'https://www.carrefour.fr/r/boissons-et-cave-a-vins/cave-a-bieres-et-cidres',
                    'X-Requested-With': 'XMLHttpRequest',
                    Connection: 'keep-alive',
                    TE: 'Trailers',
                    CacheControl: 'no-cache'
                }
            };

            await requester(carrouf)
                .then(async (body) => {
                    let data = JSON.parse(body).data;
                    for (let i of data) {
                        if (i.attributes.price.perUnit < 1 && i.attributes.title.indexOf('sans alcool') < 0
                            && i.attributes.title.indexOf('cidre') < 0 && i.attributes.title.indexOf('Cidre') < 0
                            && i.attributes.title.indexOf('panaché') < 0 && i.attributes.title.indexOf('Panaché') < 0
                            && i.attributes.title.indexOf('0,0%') < 0
                        ) {
                            let product = {
                                method: 'GET',
                                url: 'https://www.carrefour.fr/p/' + i.attributes.slug + '-' + i.id,
                            };
                            console.log(product.url);
                            let degree = await requester(product)
                                .then((body) => {
                                    let match = body.match(/[1-9]?[0-9][.,]?[1-9]?% vol/);
                                    return Number(match[0].replace(',', '.')
                                        .replace('%', '')
                                        .replace('vol', '')
                                        .trim());
                                }).catch((error) => {
                                    return error;
                                });
                            if (degree)
                                rep.push({
                                    item: i,
                                    store: 'Carrefour',
                                    perUnit: i.attributes.price.perUnit,
                                    price: i.attributes.price.price,
                                    title: i.attributes.title,
                                    brand: i.attributes.brand,
                                    degree: degree,
                                    rendement: Number(degree) / Number(i.attributes.price.perUnit)
                                });
                        }
                    }
                }).catch(() => {
                    return reply.response({
                        status: 'error'
                    })
                });

            let monop = {
                method: 'POST',
                url: 'https://www.monoprix.fr/api/graphql?cache',
                headers: {
                    Host: 'www.monoprix.fr',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
                    Accept: 'application/json',
                    'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
                    Referer: 'https://www.monoprix.fr/courses/search/biere/biere/fbc/Boissons',
                    'content-type': 'application/json',
                    Connection: 'keep-alive',
                },
                body: {
                    "operationName": "queryProducts",
                    "variables": {
                        "from": 0,
                        "brandName": [],
                        "price": [],
                        "promotions": [],
                        "productName": "biere",
                        "categoryName": "",
                        "baseCategoryName": ["Boissons"],
                        "sort": ["unit_price,asc"]
                    },
                    "query": "query queryProducts($filterCategory: [String], $brandName: [String], $promotions: [String], $price: [String], $sort: [String], $from: Int, $productName: String, $stores: [Int], $matter: [String], $colors: [String], $sizes: [String], $withPromotion: Boolean, $categoryName: String, $baseCategoryName: [String], $tokenSpa: String) {\n  viewer {\n    filters: productsES(category_id: $filterCategory, category_name: $categoryName, promotions: $promotions, price: $price, sort: $sort, from: $from, product_name: $productName, matter: $matter, colors: $colors, sizes: $sizes, size: 24, stores: $stores, withPromotion: $withPromotion) {\n      aggregations {\n        baseCategoriesGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        categoriesGroup {\n          buckets {\n            name\n            total\n            seo_url\n            __typename\n          }\n          __typename\n        }\n        brandsGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        priceRange {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        promotionsGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        compositionGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        colorsGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        sizesGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    productsES(category_id: $filterCategory, category_name: $categoryName, brand_name: $brandName, promotions: $promotions, price: $price, sort: $sort, from: $from, product_name: $productName, matter: $matter, colors: $colors, sizes: $sizes, size: 24, stores: $stores, withPromotion: $withPromotion, base_category_name: $baseCategoryName, tokenSpa: $tokenSpa) {\n      total\n      aggregations {\n        baseCategoriesGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        categoriesGroup {\n          buckets {\n            name\n            total\n            seo_url\n            __typename\n          }\n          __typename\n        }\n        brandsGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        priceRange {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        promotionsGroup {\n          buckets {\n            name\n            total\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      results {\n        ...ProductFragment\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ProductFragment on ProductESItemType {\n  product_id\n  promotions {\n    promotion_id\n    label\n    discount_price\n    cardTypes\n    beginUsable\n    endUsable\n    minimumAmount\n    discount_type\n    itemDescriptor\n    freeShippingValue\n    profil\n    __typename\n  }\n  type\n  universe\n  range\n  brand_name\n  product_name\n  category_name\n  price\n  originalPrice\n  conditioning\n  max_quantity\n  unit\n  unit_price\n  has_image\n  is_web\n  isSpa\n  landing_page_url_spa\n  add_to_cart_page_url_spa\n  image_url_spa\n  image {\n    small\n    medium\n    big\n    __typename\n  }\n  colors {\n    images {\n      medium\n      big\n      __typename\n    }\n    __typename\n  }\n  ean\n  __typename\n}\n"
                }
                , json: true
            };
            await requester(monop)
                .then(async (body) => {
                    console.log('succes');
                    for (let i of body.data.viewer.productsES.results) {
                        //console.log(i);
                        if (i.product_name.search(/[1-9]?[0-9][.,]?[1-9]?/) > 0) {
                            let match = i.product_name.match(/[1-9]?[0-9][.,]?[1-9]?/);
                            rep.push({
                                item: i,
                                store: 'Monoprix',
                                perUnit: i.unit_price,
                                price: i.price,
                                title: i.product_name,
                                brand: i.brand_name,
                                degree: Number(match[0].replace(',', '.')),
                                rendement: Number(match[0].replace(',', '.')) / Number(i.unit_price),
                            });
                        }
                    }
                }).catch(() => {
                    return reply.response({
                        status: 'error'
                    })
                });*/
            return rep;
        }
    }
];
