var convertToOrderNotFoundExceptionStackTrace = function (error) {
    return ('' + error.stack).replace(/^Error/, 'OrderNotFoundException');
};

/**
 *
 * @class OrderNotFoundException
 * @param {string} message - Error message
 * @param {string|Object} [errorDetail] - Detail on an error (string or object)
 */
function OrderNotFoundException(message, errorDetail) {
    var error = new Error();
    this.message = message;
    this.errorDetail = errorDetail || null;
    this.name = 'OrderNotFoundException';
    this.stack = convertToOrderNotFoundExceptionStackTrace(error);
}

OrderNotFoundException.prototype = Object.create(Error.prototype);

OrderNotFoundException.from = function (error) {
    var exception = new OrderNotFoundException(error.message, error.errorDetail);
    if (error.stack) {
        exception.stack = convertToOrderNotFoundExceptionStackTrace(error);
    }
    return exception;
};

module.exports = OrderNotFoundException;