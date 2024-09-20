var ValidationService = {
    verifyIPNRequest: function (req) {
        var Logger = require('dw/system/Logger');
        var OrderNotFoundException = require('*/cartridge/scripts/exceptions/OrderNotFoundException');
        var parameters = req.httpParameterMap;
        if (!parameters || !parameters.hasOwnProperty('requestBodyAsString') || parameters.requestBodyAsString.length === 0) {
            Logger.getLogger('Pointspay', 'pointspay').error('Invalid IPN request body');

            return false;
        }

        var parameterList = JSON.parse(parameters.requestBodyAsString);
        var authorization = req.httpHeaders.get('authorization');
        var signatureMatch = authorization.match(/oauth_signature="([^"]+)"/);

        if (!signatureMatch) {
            Logger.getLogger('Pointspay', 'pointspay').error('Signature not found');

            return false;
        }

        var oauthSignature = signatureMatch[1];
        var Encoding = require('dw/crypto/Encoding');
        var decodedSignature = Encoding.fromBase64(oauthSignature);
        var verificationMessage = this.getBodyVerificationMessage(parameterList) + this.getOAuthVerificationString(authorization);

        var OrderMgr = require('dw/order/OrderMgr');
        var PaymentManager = require('dw/order/PaymentMgr');
        var orderNumber = parameterList['order_id'];
        var order = OrderMgr.getOrder(orderNumber);

        if (order === null) {
            throw new OrderNotFoundException(`Order with number ${orderNumber} not found`);
        }
        
        var paymentMethod = PaymentManager.getPaymentMethod(order.paymentInstrument.paymentMethod);
        var environment = paymentMethod.getCustom().pointspayEnvironment;
        var publicKey = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestPublicKey : paymentMethod.getCustom().pointspayLivePublicKey;
        var sslService = require('*/cartridge/scripts/services/sslService');

        return sslService.verifyByteSignature(verificationMessage, decodedSignature, publicKey);
    },
    verifyRedirectRequest: function(parameters, expectedStatus) {
        var orderId = parameters.get('order_id').value;
        var OrderMgr = require('dw/order/OrderMgr');

        var order = OrderMgr.getOrder(orderId);
        if (!order) {
            return false;
        }

        var paymentId = parameters.get('payment_id').value;
        var status = parameters.get('status').value;
        var authorization = parameters.get('authorization').value;
        var oauthSignature = parameters.get('oauth_signature').value;

        if (!paymentId || !status || !authorization || !oauthSignature && status !== expectedStatus) {
            return false;
        }
                    
        var verificationMessage = orderId + paymentId + status + authorization;
                    
        var PaymentManager = require('dw/order/PaymentMgr');
        var paymentMethod = PaymentManager.getPaymentMethod(order.paymentInstrument.paymentMethod);
        var environment = paymentMethod.getCustom().pointspayEnvironment;
        var publicKey = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestPublicKey : paymentMethod.getCustom().pointspayLivePublicKey;
        var sslService = require('*/cartridge/scripts/services/sslService');

        return sslService.verifySignature(verificationMessage, oauthSignature, publicKey);
    },
    getBodyVerificationMessage: function (body) {
        const sortedKeys = Object.keys(body).sort();
        const sortedMessage = {};

        sortedKeys.forEach(key => {
            sortedMessage[key] = body[key];
        });
        const filteredMessage = {};
        for (let key in sortedMessage) {
            if (sortedMessage[key] !== null && sortedMessage[key] !== '') {
                filteredMessage[key] = sortedMessage[key];
            }
        }

        return JSON.stringify(filteredMessage).replace(/\s+/g, '');
    },
    getOAuthVerificationString: function(authorizationString) {
        authorizationString = authorizationString.replace("Oauth ", "");

        let keyValuePairs = authorizationString.split(", ");

        let concatenatedValues = keyValuePairs
            .filter(pair => !pair.startsWith("oauth_signature="))
            .map(pair => {
                let value = pair.split("=")[1].replace(/"/g, "");
                return value;
            })
            .join("");

        return concatenatedValues;
    }
}

module.exports = ValidationService;