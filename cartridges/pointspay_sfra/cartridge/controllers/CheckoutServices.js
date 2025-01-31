/**
 * @namespace CheckoutServices
 */

'use strict';

var base = module.superModule;
var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

server.extend(base);

/**
 * CheckoutServices-PlaceOrder : The CheckoutServices-PlaceOrder endpoint places the order
 * @name Base/CheckoutServices-PlaceOrder
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.append('PlaceOrder', server.middleware.https, function (req, res, next) {
    const OrderMgr = require('dw/order/OrderMgr');
    const collections = require('*/cartridge/scripts/util/collections');
    var orderID = res.viewData.orderID;
    var order = OrderMgr.getOrder(orderID);
    var paymentInstruments = order.getPaymentInstruments();
    var isPointspayOrder = true;
    if (paymentInstruments.getLength() > 1) {
      collections.forEach(paymentInstruments, function (instrument) {
        if (!instrument.paymentMethod.includes('POINTSPAY')) {
          isPointspayOrder = false;
        }
      });
    }

    if (!isPointspayOrder) {
        collections.forEach(order.getPaymentInstruments(), function (instrument) {
            if (instrument.paymentMethod.includes('POINTSPAY')) {
              order.removePaymentInstrument(instrument);
            }
        });
    }

    if (order && order.paymentInstrument.paymentMethod.includes('POINTSPAY') && isPointspayOrder) {
        res.json({
            error: false,
            orderID: res.viewData.orderID,
            orderToken: res.viewData.orderToken,
            continueUrl: order.custom.pointspayRedirectUrl
        });
    }

    return next();
});

module.exports = server.exports();