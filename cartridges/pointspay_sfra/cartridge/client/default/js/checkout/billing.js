
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
const base = require('base/checkout/billing');

const pointspayPaymentFlavors = {
    'POINTSPAY': 'Pointspay',
    'POINTSPAY_FBP': 'Flying Blue+',
    'POINTSPAY_EBP': 'EuroBonus Checkout'
};

/**
 * Updates the payment information in checkout, based on the supplied order model
 * @param {Object} order - checkout model to use as basis of new truth
 */
const updatePaymentInformation = (order) => {
    // update payment details
    const $paymentSummary = $('.payment-details');
    const { selectedPaymentInstruments } = order.billing.payment;

    let htmlToAppend = '';

    if (order.billing.payment && selectedPaymentInstruments
        && selectedPaymentInstruments.length > 0) {
        if (selectedPaymentInstruments[0].paymentMethod === 'CREDIT_CARD') {
            htmlToAppend += `<span>${order.resources.cardType} ${
                order.billing.payment.selectedPaymentInstruments[0].type
            }</span><div>${
                order.billing.payment.selectedPaymentInstruments[0].maskedCreditCardNumber
            }</div><div><span>${
                order.resources.cardEnding} ${
                order.billing.payment.selectedPaymentInstruments[0].expirationMonth
            }/${order.billing.payment.selectedPaymentInstruments[0].expirationYear
            }</span></div>`;
        } else if (selectedPaymentInstruments[0].paymentMethod.includes('POINTSPAY')) {
            htmlToAppend += `<span>${pointspayPaymentFlavors[selectedPaymentInstruments[0].paymentMethod]}</span>`;
        }
    }
    $paymentSummary.empty().append(htmlToAppend);
};

base.methods.updatePaymentInformation = updatePaymentInformation;

module.exports = {
    ...base,


};
