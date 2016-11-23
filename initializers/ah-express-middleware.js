function isWebRequest(data){
    return data && data.connection && data.connection.rawConnection && data.connection.rawConnection.req;
}

function template(middleware, options){
    return {
        name: options.name,
        priority: options.priorty,
        global: options.global,
        preProcessor: function(data, next){
            if(isWebRequest(data)){
                middleware(data.connection.rawConnection.req, data.connection.rawConnection.res, next);
            } else {
                next();
            }
        }
    }
}

module.exports = {
    loadPriority: 1000,
    initialize: function(api, next){
        'use strict';
        if(api.config.expressMiddleware && api.config.expressMiddleware.length > 0){
            api.config.expressMiddleware.forEach(function(middlewareConfig){
                try {
                    let expressMiddleware;

                    try {
                        expressMiddleware = require(middlewareConfig.name);
                    } catch (error){
                        if(error.code === 'MODULE_NOT_FOUND'){
                            const prequire = require('parent-require');
                            expressMiddleware = prequire(middlewareConfig.name);
                        }
                    }

                    if(middlewareConfig.initFunction){
                        expressMiddleware = middlewareConfig.initFunction(expressMiddleware, middlewareConfig.initOptions);
                    }

                    const middleware = template(expressMiddleware, middlewareConfig);

                    api.actions.addMiddleware(middleware);

                } catch (error) {
                    api.log('Unable to load express middleware!', 'error', error);
                }

            })
        }

        next();
    }
};
