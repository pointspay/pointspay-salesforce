'use strict';

var dwsystem = require('dw/system');
var pointspayServiceObject = require('*/cartridge/scripts/services/pointspayService');

/**
 * Create a payment request on the Pointspay API.
 * @param {dw.order.Order} order Current order
 * @param {string} paymentMethodID ID of the selected payment method
 * @return {Object} Object with boolean indicating if an error exists and the Sequra Location URL.
 */
function createPayment(order, paymentMethodID) {
    var PaymentManager = require('dw/order/PaymentMgr');
    var paymentMethod = PaymentManager.getPaymentMethod(paymentMethodID);
    var environment = paymentMethod.getCustom().pointspayEnvironment;
    var shopCode = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestShopCode : paymentMethod.getCustom().pointspayLiveShopCode;
    try {
        var serviceName = environment.value === 'TEST' ? pointspayServiceObject.SERVICE.TEST : pointspayServiceObject.SERVICE.LIVE;
        var paymentRequest = createPaymentRequest(order, shopCode);
        var service = pointspayServiceObject.getService(serviceName, paymentMethodID);

        service.URL += '/api/v1/payments';
        if (service) {
            service.setRequestMethod('POST');
            var result = service.call(paymentRequest);
            if (result.status === 'ERROR') {
                return {
                    error: true,
                    message: result.errorMessage ? result.errorMessage : result.msg
                };
            }
            
            return {
                error: false,
                result: result
            };
        }
    } catch (e) {
        dwsystem.Logger.getLogger('Pointspay', 'pointspay').error('Error while creating a payment request on Pointspay API - {0}', e.toString());
        
        return {
            error: true,
            result: e.toString()
        };
    }
    
    return {
        error: true,
        message: dw.web.Resource.msg('error.technical', 'checkout', null)
    };
}

function createPaymentRequest(order, shopCode) {
    var URLUtils = require('dw/web/URLUtils');

    var body = {
        'shop_code': shopCode,
        'order_id': order.orderNo,
        'amount': `${parseInt(order.totalGrossPrice.decimalValue * 100)}`,
        'currency': order.totalGrossPrice.currencyCode,
        'language': order.customerLocaleID.split('_')[0],
        'additional_data': {
            'dynamic_urls': {
                'cancel': URLUtils.https('Pointspay-cancel').toString(),
                'failure': URLUtils.https('Pointspay-failure').toString(),
                'ipn': URLUtils.https('Pointspay-IPN').toString(),
                'success': URLUtils.https('Pointspay-success').toString()
            }      
        }
    }

    return body;
}

module.exports = {
    createPayment: createPayment,
    createPaymentRequest: createPaymentRequest
};