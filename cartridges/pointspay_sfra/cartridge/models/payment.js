'use strict';

var PaymentMgr = require('dw/order/PaymentMgr');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var collections = require('*/cartridge/scripts/util/collections');

var base = module.superModule;

/**
 * Creates an array of objects containing applicable payment methods
 * @param {dw.util.ArrayList<dw.order.dw.order.PaymentMethod>} paymentMethods - An ArrayList of
 *      applicable payment methods that the user could use for the current basket.
 * @returns {Array} of object that contain information about the applicable payment methods for the
 *      current cart
 */
function applicablePaymentMethods(paymentMethods) {
    return collections.map(paymentMethods, function (method) {
        let mode = method.getCustom().pointspayEnvironment,
            shopCode = mode.value === 'TEST' ? method.getCustom().pointspayTestShopCode : method.getCustom().pointspayLiveShopCode,
            baseUrl = mode.value === 'TEST' ? 'https://uat-secure.pointspay.com' : 'https://secure.pointspay.com';

        return {
            ID: method.ID,
            name: method.name,
            description: method.description,
            mode: mode,
            baseUrl: baseUrl,
            shopCode: shopCode
        };
    });
}

/**
 * Creates an array of objects containing selected payment information
 * @param {dw.util.ArrayList<dw.order.PaymentInstrument>} selectedPaymentInstruments - ArrayList
 *      of payment instruments that the user is using to pay for the current basket
 * @returns {Array} Array of objects that contain information about the selected payment instruments
 */
function getSelectedPaymentInstruments(selectedPaymentInstruments) {
    return collections.map(selectedPaymentInstruments, function (paymentInstrument) {
        var results = {
            paymentMethod: paymentInstrument.paymentMethod,
            amount: paymentInstrument.paymentTransaction.amount.value
        };
        if (paymentInstrument.paymentMethod === 'CREDIT_CARD') {
            results.lastFour = paymentInstrument.creditCardNumberLastDigits;
            results.owner = paymentInstrument.creditCardHolder;
            results.expirationYear = paymentInstrument.creditCardExpirationYear;
            results.type = paymentInstrument.creditCardType;
            results.maskedCreditCardNumber = paymentInstrument.maskedCreditCardNumber;
            results.expirationMonth = paymentInstrument.creditCardExpirationMonth;
        } else if (paymentInstrument.paymentMethod === 'GIFT_CERTIFICATE') {
            results.giftCertificateCode = paymentInstrument.giftCertificateCode;
            results.maskedGiftCertificateCode = paymentInstrument.maskedGiftCertificateCode;
        } else if (paymentInstrument.paymentMethod.includes('POINTSPAY')) {
            var paymentMethod = dw.order.PaymentMgr.getPaymentMethod(paymentInstrument.paymentMethod);
            results.paymentMethodName = paymentMethod.name;
        }

        return results;
    });
}

function Payment(currentBasket, currentCustomer, countryCode) {
    base.call(this, currentBasket, currentCustomer, countryCode);

    var paymentAmount = currentBasket.totalGrossPrice;
    var paymentMethods = PaymentMgr.getApplicablePaymentMethods(
        currentCustomer,
        countryCode,
        paymentAmount.value
    );

    var paymentInstruments = currentBasket.paymentInstruments;
    
    this.applicablePaymentMethods = paymentMethods ? applicablePaymentMethods(paymentMethods) : null;
    this.getSelectedPaymentInstruments = paymentInstruments ? getSelectedPaymentInstruments(paymentInstruments) : null;
}

module.exports = Payment;