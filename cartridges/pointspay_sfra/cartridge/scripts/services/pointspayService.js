/**
 * POINTSPAY SERVICE Logic
 */
var dwsvc = require('dw/svc');
var dwsystem = require('dw/system');

var PointspayService = {
    SERVICE: {
        LIVE: 'Pointspay.LiveEndpoint',
        TEST: 'Pointspay.TestEndpoint'
    },

    getService: function (service, paymentMethodID) {
        var PaymentManager = require('dw/order/PaymentMgr');
        var paymentMethod = PaymentManager.getPaymentMethod(paymentMethodID);
        var environment = paymentMethod.getCustom().pointspayEnvironment;
        var consumerKey = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestConsumerKey : paymentMethod.getCustom().pointspayLiveConsumerKey;
        var privateKey = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestPrivateKey : paymentMethod.getCustom().pointspayLivePrivateKey;
        var certificate = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestCertificate : paymentMethod.getCustom().pointspayLiveCertificate;
        var debugMode = paymentMethod.getCustom().pointspayDebugMode;

        var oAuthHeaders = {
            'oauth_consumer_key': consumerKey,
            'oauth_signature_method': 'SHA256withRSA',
            'oauth_nonce': this.generateUniqueId(),
            'oauth_timestamp': this.generateTimestamp()
        };

        var pointspayService = null;
        try {
            pointspayService = dwsvc.LocalServiceRegistry.createService(service, {
                createRequest: function (svc, args) {
                    oAuthHeaders['oauth_signature'] = PointspayService.signRequest(args, oAuthHeaders, privateKey);
                    
                    var headerParts = [];
                    for (var key in oAuthHeaders) {
                        if (oAuthHeaders.hasOwnProperty(key)) {
                            var value = oAuthHeaders[key];
                            headerParts.push(key + '="' + value + '"');
                        }
                    }
                    
                    var authorizationHeader = headerParts.join(', ');

                    svc.addHeader('Content-Type', 'application/json');
                    svc.addHeader('Accept', 'application/json');
                    svc.addHeader('charset', 'UTF-8');
                    svc.addHeader('Authorization', 'Oauth ' + authorizationHeader);
                    if (args) {
                        return JSON.stringify(args);
                    }
                    return null;
                },
                parseResponse: function (svc, client) {
                    return client;
                },
                filterLogMessage: function filterLogMessage(msg) {
                    return msg;
                }
            });

            if (debugMode) {
                dwsystem.Logger.getLogger('Pointspay', 'pointspay').debug('Successfully retrieved service with name {0}', service);
            }
        } catch (e) {
            dwsystem.Logger.getLogger('Pointspay', 'pointspay').error("Cannot retrieve service instance with name {0}", service);
        }

        return pointspayService;
    },
    generateUniqueId: function() {
        const pid = Date.now(); 
        const prefix = pid + '_';
        const uniqueId = prefix + Math.random().toString(16).substr(2) + (new Date()).getTime().toString(16);
        
        return uniqueId;
    },
    generateTimestamp: function() {
        const timestamp = Date.now();

        return timestamp.toString();
    },
    signRequest: function(requestBody, oAuthHeaders, privateKey) {
        var message = this.getBodyVerificationMessage(requestBody);
        var sslService = require('*/cartridge/scripts/services/sslService');

        for (let [key, header] of Object.entries(oAuthHeaders)) {
            message += header;
        }

        return sslService.signData(message, privateKey);
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
    }
};

module.exports = PointspayService;