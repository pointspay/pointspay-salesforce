/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */
const baseCheckout = require('base/checkout/checkout');
const baseSummaryHelpers = require('base/checkout/summary');
const baseShippingHelpers = require('base/checkout/shipping');
const baseCustomerHelpers = require('base/checkout/customer');
const pluginBilling = require('./billing');

baseCheckout.updateCheckoutView = function () {
    $('body').on('checkout:updateCheckoutView', (e, data) => {
        if (data.csrfToken) {
            $("input[name*='csrf_token']").val(data.csrfToken);
        }
        baseCustomerHelpers.methods.updateCustomerInformation(data.customer, data.order);
        baseShippingHelpers.methods.updateMultiShipInformation(data.order);
        baseSummaryHelpers.updateTotals(data.order.totals);
        data.order.shipping.forEach((shipping) => {
            baseShippingHelpers.methods.updateShippingInformation(
                shipping,
                data.order,
                data.customer,
                data.options,
            );
        });
        pluginBilling.methods.updateBillingInformation(
            data.order,
            data.customer,
            data.options,
        );
        pluginBilling.methods.updatePaymentInformation(data.order, data.options);
        baseSummaryHelpers.updateOrderProductSummaryInformation(data.order, data.options);
    });
};

[baseShippingHelpers, pluginBilling].forEach((library) => {
    Object.keys(library).forEach((key) => {
        if (typeof library[key] === 'object') {
            baseCheckout[key] = $.extend({}, baseCheckout[key], library[key]);
        } else {
            baseCheckout[key] = library[key];
        }
    });
});

module.exports = baseCheckout;