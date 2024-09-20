'use strict';

const pointspayPaymentFlavors = {
  'POINTSPAY': 'Pointspay',
  'POINTSPAY_FBP': 'Flying Blue+',
  'POINTSPAY_EBP': 'EuroBonus Checkout'
};

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */

function processForm(req, paymentForm, viewFormData) {
  var PaymentManager = require('dw/order/PaymentMgr');
  var paymentMethodID = paymentForm.paymentMethod.value;
  var error = false;
  if (paymentMethodID.includes('POINTSPAY')) {
    if (!PaymentManager.getPaymentMethod(paymentMethodID)) {
        throw new Error(Resource.msg(
            'error.payment.processor.missing',
            'checkout',
            null
        ));
    }
  
    var paymentMethod = PaymentManager.getPaymentMethod(paymentMethodID);
    var environment = paymentMethod.getCustom().pointspayEnvironment;
    var shopCode = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestShopCode : paymentMethod.getCustom().pointspayLiveShopCode;
    var consumerKey = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestConsumerKey : paymentMethod.getCustom().pointspayLiveConsumerKey;
    var privateKey = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestPrivateKey : paymentMethod.getCustom().pointspayLivePrivateKey;
    var certificate = environment.value === 'TEST' ? paymentMethod.getCustom().pointspayTestCertificate : paymentMethod.getCustom().pointspayLiveCertificate;


    if (!shopCode || !consumerKey || !privateKey || !certificate) {
      error = true;
    }
  }

  viewFormData.paymentMethod = {
    value: paymentForm.paymentMethod.value,
    htmlName: pointspayPaymentFlavors[paymentForm.paymentMethod.value]
  };
      
  return {
    error: true,
    viewData: viewFormData
  };
}

exports.processForm = processForm;