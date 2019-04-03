const Jwt = require('jsonwebtoken');
const uuid = require("uuid/v1");
const config = require('./config');
var requester = require("request-promise");

const {User, Category, Game, Comment, Cocktail, Beer, Party, UserParty, sequelize} = require('./sequelize');


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
        user.update({notification_id: payload.notification_id});
        return reply.response({
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
                notification_id: payload.notification_id,
            });
            return login(request, reply)
        }
    },
    {
        method: 'GET',
        path: '/list/game/{cat}',
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
        path: '/list/game/new',
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
        path: '/list/game',
        config: {auth: false},
        handler: (request) => {
            return sequelize.query('SELECT g.*, avg(c.rate) as rate FROM `games` as g LEFT JOIN `comments` AS c ON g.id = c.gameId where g.visible group by g.id order by g.name');
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
                    $or: [
                        {firstname: sequelize.where(sequelize.fn('LOWER', sequelize.col('firstname')), 'LIKE', '%' + request.params.name + '%')},
                        {lastname: sequelize.where(sequelize.fn('LOWER', sequelize.col('lastname')), 'LIKE', '%' + request.params.name + '%')},
                        {pseudo: sequelize.where(sequelize.fn('LOWER', sequelize.col('pseudo')), 'LIKE', '%' + request.params.name + '%')}
                    ]
                }, attributes: ['id', 'pseudo', 'firstname'],
            });
        }
    },
    {
        method: 'GET',
        path: '/party',
        config: {auth: 'jwt'},
        handler: async (request) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            return user.getParties({
                where: {visible: true},
                include: [{model: User,
                    attributes: {exclude: ['password', 'mail']}
                }],

            })
        }
    },
    {
        method: 'GET',
        path: '/party/{id}',
        config: {auth: 'jwt'},
        handler: async (request) => {
            let user = await User.findByPk(request.auth.credentials);
            if (!user)
                return reply.response({status: 'You are not log in'});
            let party = await Party.findByPk(request.params.id);
            if (!party)
                return reply.response({status: 'This party does not exist'});
            return party.getGuests({
                    attributes: {exclude: ['password', 'mail']}
            })
        }
    },
    {
        method: 'POST',
        path: '/create/party',
        config: {auth: 'jwt'},
        handler: async (request) => {
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
            console.log(request.params.id);
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
                .then((party) => {
                    if (party.userId === Number(request.auth.credentials)) {
                        UserParty.findOrCreate({where: {partyId: party.id, userId: invited.id}});
                        return reply.response({
                            status: invited.pseudo + ' is invited'
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
        path:
            '/add/game',
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
                            return {new: true, temp: data[today + ' 22:00:00'].temperature['2m'] - 273};
                        } else return {temp: false};
                    });
            }
        }
    },
    {
        method: 'GET',
        path: '/rendement',
        config: {auth: false},
        handler: async (request, reply) => {
            let rep = [];

            let carrouf = {
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
                });
            return rep;
        }
    }
];
