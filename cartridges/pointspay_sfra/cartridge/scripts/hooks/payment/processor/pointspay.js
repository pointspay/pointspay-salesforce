'use strict';

const Transaction = require('dw/system/Transaction');

/**
 * Creates a token.
 * @returns {string} a token
 */
function createToken() {
  return Math.random().toString(36).substr(2);
}

/**
 * Verifies the payment information. If the information is valid a
 * Pointspay payment instrument is created
 * @param {dw.order.Basket} basket Current users's basket
 * @param {Object} paymentInformation - the payment information
 * @param {string} paymentMethodID - paymentmethodID
 * 
 * @return {Object} returns an error object
 */
function Handle(basket, paymentInformation, paymentMethodID) {
    const collections = require('*/cartridge/scripts/util/collections');
    let currentBasket = basket;
    let serverErrors = [];

  
    Transaction.wrap(function () {
      let paymentInstruments = currentBasket.getPaymentInstruments();
  
      collections.forEach(paymentInstruments, function (item) {
        currentBasket.removePaymentInstrument(item);
      });
  
      let paymentInstrument = currentBasket.createPaymentInstrument(
        paymentMethodID, currentBasket.totalGrossPrice
      );
    });
  
    return { fieldErrors: null, serverErrors: null, error: false };
  }
  
  /**
   * Authorizes a payment.
   * @param {number} orderNumber - The current order's number
   * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
   * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
   *      payment method
   * @return {Object} returns an error object
   */
  function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    const Resource = require('dw/web/Resource');
    const OrderMgr = require('dw/order/OrderMgr');
    const pointspayApi = require('*/cartridge/scripts/pointspay/pointspayApi');
    const collections = require('*/cartridge/scripts/util/collections');
    let serverErrors = [];
    let fieldErrors = {};
    let error = false;

    var order = OrderMgr.getOrder(orderNumber);
    let paymentInstruments = order.getPaymentInstruments();
    var isPointspayOrder = true;
    if (paymentInstruments.getLength() > 1) {
      collections.forEach(paymentInstruments, function (instrument) {
        if (!instrument.paymentMethod.includes('POINTSPAY')) {
          isPointspayOrder = false;
        }
      });
    }

    try {
      if (isPointspayOrder) {
        var response = pointspayApi.createPayment(order, paymentInstrument.paymentMethod);

        if (!response.error) {
          var responseBody = JSON.parse(response.result.object.text);
          var redirectUrl = responseBody.href;

          Transaction.wrap(function () {
            paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
            paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);

            order.custom.pointspayRedirectUrl = redirectUrl;
          });
        } else {
          error = true;
        } 
      }
    } catch (e) {
      error = true;
      serverErrors.push(
        Resource.msg('error.technical', 'checkout', null)
      );
    }
  
    return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
  }
  
  exports.Handle = Handle;
  exports.Authorize = Authorize;
  exports.createToken = createToken;