var SSLService = {
    signData: function (data, privateKey) {
        var Encoding = require('dw/crypto/Encoding');
        var Bytes = require('dw/util/Bytes');
        var Signature = require('dw/crypto/Signature');

        var contentToSignInBytes = new Bytes(data);

        var apiSig = new Signature();
        privateKey = this.stripKeyHeaders(privateKey);
        var signedBytes = apiSig.signBytes(contentToSignInBytes, new Bytes(privateKey), 'SHA256withRSA');

        return Encoding.toBase64(signedBytes);
    },
    verifySignature: function (data, signature, publicKey) {
        var Signature = require('dw/crypto/Signature');
        var Encoding = require('dw/crypto/Encoding');
        var Bytes = require('dw/util/Bytes');
        var byteData = new Bytes(data);
        var encodedData =  Encoding.toBase64(byteData);
        publicKey = this.stripKeyHeaders(publicKey);

        var signatureInstance = new Signature();

        return signatureInstance.verifySignature(signature, encodedData, publicKey, 'SHA256withRSA');
    },
    verifyByteSignature: function (data, signature, publicKey) {
        var Signature = require('dw/crypto/Signature');
        var Encoding = require('dw/crypto/Encoding');
        var Bytes = require('dw/util/Bytes');
        var byteData = new Bytes(data);
        publicKey = this.stripKeyHeaders(publicKey);

        var signatureInstance = new Signature();

        return signatureInstance.verifyBytesSignature(signature, byteData, publicKey, 'SHA256withRSA');
    },
    stripKeyHeaders: function(key) {
        return key
            .replace(/-----BEGIN (?:PUBLIC|PRIVATE) KEY-----/g, '')
            .replace(/-----END (?:PUBLIC|PRIVATE) KEY-----/g, '')
            .replace(/\r?\n|\r/g, '')
            .trim();
    }
}

module.exports = SSLService;
