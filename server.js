const Hapi = require('hapi');
const routes = require('./index');

const validate = async function (decoded, request) {
    return { isValid: true };
    /*if (!people[decoded.id]) {
        return { isValid: false };
    }
    else {
        return { isValid: true }; 
    }*/
};

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '192.168.1.16'
    });
    // include our module here ↓↓
    await server.register(require('hapi-auth-jwt2'));

    server.auth.strategy('jwt', 'jwt',
        {
            key: 'NeverShareYourSecret',          // Never Share your secret key
            validate: validate,            // validate function defined above
            verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
        });

    server.auth.default('jwt');

    server.route(   routes    );
    await server.start();
    return server;
};


init().then(server => {
    console.log('Server running at:', server.info.uri);
}).catch(error => {
    console.log(error);
});