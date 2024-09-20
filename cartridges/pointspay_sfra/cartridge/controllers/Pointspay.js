/* eslint-disable no-restricted-syntax */
/* eslint-disable array-callback-return */

'use strict';

const STATUS = {
    SUCCESS: 'SUCCESS',
    CANCELED: 'CANCELED',
    FAILED: 'FAILED'
};

/**
 * @namespace Pointspay
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Pointspay-IPN : The Pointspay-IPN endpoint is where Pointspay sends the IPN (Instant Payment Notification)
 * @param {returns} - json
 * @param {serverfunction} - use
 */
server.use(
    'IPN',
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var Logger = require('dw/system/Logger');
        if(req.httpMethod !== "PUT") {
            res.setStatusCode(405);
            res.json({ error: Resource.msg('Invalid HTTP method for an IPN request', 'pointspay', null) });
        } else {
            try {
                var validationService = require('*/cartridge/scripts/services/validationService');
                if (!validationService.verifyIPNRequest(req)) {
                    res.setStatusCode(400);
                    res.json({ error: Resource.msg('Validation failed', 'pointspay', null) });
                } else {
                    var OrderMgr = require('dw/order/OrderMgr');
                    var Transaction = require('dw/system/Transaction');
                    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
                    var parameters = req.httpParameterMap;
                    var parameterList = JSON.parse(parameters.requestBodyAsString);
                    var orderNumber = parameterList['order_id'];
                    var order = OrderMgr.getOrder(orderNumber);
                    
                    Transaction.wrap(function () {
                        order.setPaymentStatus(dw.order.Order.PAYMENT_STATUS_PAID);
                        order.setExportStatus(dw.order.Order.EXPORT_STATUS_READY);
                    });
                    COHelpers.sendConfirmationEmail(order, req.locale.id);
        
                    res.setStatusCode(200);
                    res.json({ success: true });
                }
            } catch (e) { 
                Logger.getLogger('Pointspay', 'pointspay').error(e.message);

                if (e.name === 'OrderNotFoundException') {
                    res.setStatusCode(404);
                    res.json({ error: e.message });
                } else {
                    res.setStatusCode(400);
                    res.json({ error: Resource.msg('Invalid request', 'pointspay', null) });
                }
            }
        }

        this.emit('route:Complete', req, res);
    }
);

/**
 * Pointspay success handler.
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken.
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'success',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res) {
        var OrderMgr = require('dw/order/OrderMgr');
        var URLUtils = require('dw/web/URLUtils');
        var parameters = req.httpParameterMap;
        var orderNo = parameters.get('order_id').value;
        var orderToken = '';
        var pointspayUrl =  pointspayUrl = dw.web.URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', dw.web.Resource.msg('error.technical', 'checkout', null));

        if (orderNo) {
            var order = OrderMgr.getOrder(orderNo);
            if (order) {
                var validationService = require('*/cartridge/scripts/services/validationService');
                if (validationService.verifyRedirectRequest(parameters, STATUS.SUCCESS)) {
                    pointspayUrl = dw.web.URLUtils.url('Order-Confirm', 'ID', order.orderNo, 'token', order.orderToken).toString();
                    orderToken = order.orderToken;

                    res.render('/checkout/pointspayform', {
                        pointspayUrl: pointspayUrl,
                        orderID: orderNo,
                        orderToken: orderToken
                    });

                    this.emit('route:Complete', req, res);
        
                    return;
                } else {
                    Logger.getLogger('Pointspay', 'pointspay').error('Success redirect validation failed');
                }
            }
        } else {
            Logger.getLogger('Pointspay', 'pointspay').error('Order ID missing in the Pointspay redirect request');
        }

        res.redirect(pointspayUrl);
        this.emit('route:Complete', req, res);
        
        return;
    }
);

/**
 * Pointspay cancellation handler.
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken.
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'cancel',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res) {
        var OrderMgr = require('dw/order/OrderMgr');
        var URLUtils = require('dw/web/URLUtils');
        var Logger = require('dw/system/Logger');
        var parameters = req.httpParameterMap;
        var orderNo = parameters.get('order_id').value;
        var orderToken = '';
        var pointspayUrl =  pointspayUrl = dw.web.URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', dw.web.Resource.msg('error.technical', 'checkout', null));

        if (orderNo) {
            var order = OrderMgr.getOrder(orderNo);
            if (order) {
                var validationService = require('*/cartridge/scripts/services/validationService');
                if (validationService.verifyRedirectRequest(parameters, STATUS.CANCELED)) {    
                    var URLUtils = require('dw/web/URLUtils');
                    var Transaction = require('dw/system/Transaction');

                    Transaction.wrap(function () {
                        var basketFromOrder = dw.order.BasketMgr.createBasketFromOrder(order);
                        var status = dw.order.OrderMgr.cancelOrder(order);
                        if (status.code === 'ERROR') {
                            dw.system.Logger.getLogger('Pointspay', 'pointspay').error(`Error while cancelling order with ID ${orderNo}`);
                        } else {
                            order.setCancelCode('POINTSPAY_CANCELLED');
                            order.setCancelDescription('Order has been cancelled on Pointspay');
                            
                            var currentBasket = dw.order.BasketMgr.getCurrentOrNewBasket();

                            if (order.customerEmail) {
                                currentBasket.setCustomerEmail(order.customerEmail);
                            }
        
                            var productLineItems = basketFromOrder.getAllProductLineItems();
                            
                            productLineItems.toArray().forEach(function (item) {
                                currentBasket.createProductLineItem(item.productID, currentBasket.defaultShipment)
                                    .setQuantityValue(item.quantityValue);
                            });

                            var originalShipment = basketFromOrder.defaultShipment;
                            var currentShipment = currentBasket.defaultShipment;

                            if (originalShipment.shippingMethod) {
                                currentShipment.setShippingMethod(originalShipment.shippingMethod);
                            }

                            var originalShippingAddress = originalShipment.shippingAddress;
                            if (originalShippingAddress) {
                                var shippingAddress = currentShipment.createShippingAddress();
                                shippingAddress.setFirstName(originalShippingAddress.firstName);
                                shippingAddress.setLastName(originalShippingAddress.lastName);
                                shippingAddress.setAddress1(originalShippingAddress.address1);
                                shippingAddress.setAddress2(originalShippingAddress.address2);
                                shippingAddress.setCity(originalShippingAddress.city);
                                shippingAddress.setPostalCode(originalShippingAddress.postalCode);
                                shippingAddress.setStateCode(originalShippingAddress.stateCode);
                                shippingAddress.setCountryCode(originalShippingAddress.countryCode.value);
                                shippingAddress.setPhone(originalShippingAddress.phone);
                            }

                            var originalBillingAddress = order.billingAddress;
                            if (originalBillingAddress) {
                                var billingAddress = currentBasket.createBillingAddress();
                                billingAddress.setFirstName(originalBillingAddress.firstName);
                                billingAddress.setLastName(originalBillingAddress.lastName);
                                billingAddress.setAddress1(originalBillingAddress.address1);
                                billingAddress.setAddress2(originalBillingAddress.address2);
                                billingAddress.setCity(originalBillingAddress.city);
                                billingAddress.setPostalCode(originalBillingAddress.postalCode);
                                billingAddress.setStateCode(originalBillingAddress.stateCode);
                                billingAddress.setCountryCode(originalBillingAddress.countryCode.value);
                                billingAddress.setPhone(originalBillingAddress.phone);
                            }
                        }
                    });

                    res.redirect(pointspayUrl);

                    this.emit('route:Complete', req, res);
                    
                    return;
                }
            } else {
                Logger.getLogger('Pointspay', 'pointspay').error('Cancellation redirect validation failed');
            }
        } else {
            Logger.getLogger('Pointspay', 'pointspay').error('Order ID missing in the Pointspay redirect request');
        }

        var URLUtils = require('dw/web/URLUtils');
        var pointspayUrl = dw.web.URLUtils.url('Cart-Show').toString()

        res.redirect(pointspayUrl);

        this.emit('route:Complete', req, res);
        
        return;
    }
);


/**
 * Pointspay failure handler.
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken.
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'failure',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res) {
        var OrderMgr = require('dw/order/OrderMgr');
        var URLUtils = require('dw/web/URLUtils');
        var Logger = require('dw/system/Logger');
        var parameters = req.httpParameterMap;
        var orderNo = parameters.get('order_id').value;
        var orderToken = '';
        var pointspayUrl =  pointspayUrl = dw.web.URLUtils.url('Checkout-Begin', 'stage', 'payment', 'paymentError', dw.web.Resource.msg('error.technical', 'checkout', null));

        if (orderNo) {
            var order = OrderMgr.getOrder(orderNo);
            if (order) {
                var validationService = require('*/cartridge/scripts/services/validationService');
                if (validationService.verifyRedirectRequest(parameters, STATUS.FAILED)) {    
                    var URLUtils = require('dw/web/URLUtils');
                    var Transaction = require('dw/system/Transaction');

                    Transaction.wrap(function () {
                        var basketFromOrder = dw.order.BasketMgr.createBasketFromOrder(order);
                        var status = dw.order.OrderMgr.cancelOrder(order);
                        if (status.code === 'ERROR') {
                            dw.system.Logger.getLogger('Pointspay', 'pointspay').error(`Error while cancelling order with ID ${orderNo}`);
                        } else {
                            order.setCancelCode('POINTSPAY_FAILED');
                            order.setCancelDescription('Order has been failed on Pointspay');
                            
                            var currentBasket = dw.order.BasketMgr.getCurrentOrNewBasket();

                            if (order.customerEmail) {
                                currentBasket.setCustomerEmail(order.customerEmail);
                            }
        
                            var productLineItems = basketFromOrder.getAllProductLineItems();
                            
                            productLineItems.toArray().forEach(function (item) {
                                currentBasket.createProductLineItem(item.productID, currentBasket.defaultShipment)
                                    .setQuantityValue(item.quantityValue);
                            });

                            var originalShipment = basketFromOrder.defaultShipment;
                            var currentShipment = currentBasket.defaultShipment;

                            if (originalShipment.shippingMethod) {
                                currentShipment.setShippingMethod(originalShipment.shippingMethod);
                            }

                            var originalShippingAddress = originalShipment.shippingAddress;
                            if (originalShippingAddress) {
                                var shippingAddress = currentShipment.createShippingAddress();
                                shippingAddress.setFirstName(originalShippingAddress.firstName);
                                shippingAddress.setLastName(originalShippingAddress.lastName);
                                shippingAddress.setAddress1(originalShippingAddress.address1);
                                shippingAddress.setAddress2(originalShippingAddress.address2);
                                shippingAddress.setCity(originalShippingAddress.city);
                                shippingAddress.setPostalCode(originalShippingAddress.postalCode);
                                shippingAddress.setStateCode(originalShippingAddress.stateCode);
                                shippingAddress.setCountryCode(originalShippingAddress.countryCode.value);
                                shippingAddress.setPhone(originalShippingAddress.phone);
                            }

                            var originalBillingAddress = order.billingAddress;
                            if (originalBillingAddress) {
                                var billingAddress = currentBasket.createBillingAddress();
                                billingAddress.setFirstName(originalBillingAddress.firstName);
                                billingAddress.setLastName(originalBillingAddress.lastName);
                                billingAddress.setAddress1(originalBillingAddress.address1);
                                billingAddress.setAddress2(originalBillingAddress.address2);
                                billingAddress.setCity(originalBillingAddress.city);
                                billingAddress.setPostalCode(originalBillingAddress.postalCode);
                                billingAddress.setStateCode(originalBillingAddress.stateCode);
                                billingAddress.setCountryCode(originalBillingAddress.countryCode.value);
                                billingAddress.setPhone(originalBillingAddress.phone);
                            }
                        }
                    });

                    res.redirect(pointspayUrl);

                    this.emit('route:Complete', req, res);
                    
                    return;
                } else {
                    Logger.getLogger('Pointspay', 'pointspay').error('Failure redirect validation failed');
                }
            }
        } else {
            Logger.getLogger('Pointspay', 'pointspay').error('Order ID missing in the Pointspay redirect request');
        }

        var URLUtils = require('dw/web/URLUtils');
        var pointspayUrl = dw.web.URLUtils.url('Cart-Show').toString();

        res.redirect(pointspayUrl);

        this.emit('route:Complete', req, res);
        
        return;
    }
);

module.exports = server.exports();