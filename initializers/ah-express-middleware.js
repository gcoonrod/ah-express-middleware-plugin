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
        if(api.config.expressMiddleware && api.config.expressMiddleware.length > 0){
            api.config.expressMiddleware.forEach(function(middlewareConfig){
                try {
                    const expressMiddleware = require(middlewareConfig.name);
                    if(middlewareConfig.initFunction){
                        middlewareConfig.initFunction(expressMiddleware, middlewareConfig.initOptions);
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
