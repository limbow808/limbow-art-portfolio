/**
 * General middleware.
 */
"use strict";

/**
 * Log incoming requests to console to see who accesses the server
 * on what route.
 *
 * @param {Request}  req  The incoming request.
 * @param {Response} res  The outgoing response.
 * @param {Function} next Next to call in chain of middleware.
 *
 * @returns {void}
 */
function logIncomingToConsole(req, res, next) {
    const userAgent = req.get('User-Agent') || 'Unknown User-Agent';
    const method = req.method;
    const url = req.originalUrl;
    /*
    console.log("-----------------------------------------------------");
    console.info(`User-Agent: ${userAgent}`);
    console.info(`Method: ${method}, URL: ${url}`);
    console.info(`Got request on ${req.path} (${req.method}).`);
    console.log("-----------------------------------------------------");
    */
    console.info(`Got request on ${req.path} (${req.method}).`);
    next();
}

module.exports = {
    logIncomingToConsole: logIncomingToConsole
};
