var request = require('request-promise');
var assert = require('assert');
const config = require('../config');

describe('Pointspay JSON controller tests', () => {
    context('Pointspay-IPN', () => {
        it('Should reject a GET request', () => {
            return request({
                url: config.baseUrl + 'Pointspay-IPN',
                method: 'GET',
                rejectUnauthorized: false,
                resolveWithFullResponse: true
            }).catch(function (err) {
                assert.equal(err.statusCode, 405, 'Should return a 405 Method Not Allowed Response');
            });
        });

        it('Should return a 400 response when request is missing required body parameters', () => {
            return request({
                url: config.baseUrl + 'Pointspay-IPN',
                method: 'PUT',
                json: true
            }).catch(function (err) {
                assert.equal(err.statusCode, 400, 'Should return a 400 Bad Request response');
            });
        });

        it('Should return a error response when validation fails', () => {
            return request({
                url: config.baseUrl + 'Pointspay-IPN',
                method: 'PUT',
                json: true,
                headers: {
                    'authorization': 'Oauth oauth_consumer_key="test", oauth_signature_method="SHA256withRSA", oauth_nonce="a8876bd7-b63c-4bdb-aa67-9083c51fa3b7", oauth_timestamp="1726484228021", oauth_signature="O48zkrcE8YC58kP+6iyD4JNaXwASxTJIsOhpfFFAKdrF/yVFXlCqQQDktFN7YcPM8h0g8plHLOUxjiDS1kib4uUiC4hRJ8vfkOzQfW4Egqy4NRRHxhVBiVhV08YZzpnraK187Q5CKbhOMTfAdwFVP3JLifDJpL0b52w6Cyy7InAQqbJGXVKTirOmkOH+Pjic0hx9amkSVDO6CJIK/HkjvrsMzJyW3aMpHkcqJY0CM/OpobuUY7G7RORjs6Bmm4ayrf/jPWrHi+ezdGsNbfDVTFNcXm1d5zwF2aNl92ZZooFtbadE4LKTfLmSvmSN6Qgn/4sR43fM/lEV1O8PAwvQM5+aP8LAVYKZAKs0fkpgBT3BpU7xyrutRGvp+ODS1n0yj85f+RtKnxi0yax7a9zhJJpPy1uKsMT3OUltBdgBfrlz6ep2nxzagiHC5w+uILOpjnVtwUCMEsfvQYIE2SF43fy8ZiByaj0cDgkeJZONA5Rf/Omrnu2GKZYQTV+3OAvjWziaDuMM8FOwboySZmdzOc8h8fsM9ppM7uj8gzI4spUR6ZaPRxRu7ug0ueOqSCJtWKWi09Kxxh0Y1H3nMde+Ay6NSwoUhSVIQOVGC2rma+uLFqr5shNmxSSINAQNX5NPf0cbBBKgFGCtiwbLO5YYPqjE8ReWz2rGBPl3Zgd/U1lJchaieA3jbqmvSox9OBizZHNhVmcKuaFFEzm8Iz/N55GF6azepb2sBjvY8G5d7pGtcS/pRBIMcqVf75Wjd+YmAZp/hW+CVO5UNhzyNv3OsdZe6vDbox+w2idVYg74OUVAAkwOZ2bvcL2YuQfNU+DJgUB+RQpDIsh0CC++A25hTMzaFxcxXn/nA+8WUNynEpkyIFyIfoYtPyW6MfQsvkA5MQM2gVfxU7FNuKai1Z3A108zEIkoJddMr/7n24Xc5cEqoNuZB3phtZWzZhtykf39TDYMpadFtEBL+Ulx5ZPORI7y9CPQ23owUb0FVX5rOaXs1X8azN7iPe9srKMTk86gaWtmLRe0C7lw8VZWpg1HvuKnUzo4UVOBq/T6M+rmvj+eP8vpcezQD/4fNtiVKUV+KoHVcGcZurrdiFmKIIfHUE/yRaq/lFNDJy0A4XRRY4WW6cswDlDHrv4ynTK+b5BR0BN4GC5jZ6LTdGoAvRJ6E6b56S25fPI+xrMacRYU/GvY3PcCZONwagywsKpF7dV5UCVGZGYXvoAtFAvb27AayWIq4HrJ7Wwkuj9WT4LCqHiykvAHMuviPi0jJJbxbbuEvXUVwxY9A+/kMIouPp9d3omkiHGJMsVTtiGTt3U6s75LwNDgc44oqsGLRrkX2AQPRZiJ0/KI/XMdrMVLJtl6hA=="'
                },
                body: {
                    order_id: '00000806',
                    payment_id: '29f2713b9c6b440a8719835f5a536e62',
                    status: 'SUCCESS'
                }
            }).catch(function (err) {
                assert.equal(err.statusCode, 400, 'Should return a 400 Bad Request response');
            });
        });

        it('Should return a 404 response for an invalid order ID', () => {
            return request({
                url: config.baseUrl + 'Pointspay-IPN',
                method: 'PUT',
                json: true,
                headers: {
                    'authorization': 'Oauth oauth_consumer_key="VL1lvbLxXdXLNJDnamxZ2wcEFseURvI7", oauth_signature_method="SHA256withRSA", oauth_nonce="a8876bd7-b63c-4bdb-aa67-9083c51fa3b7", oauth_timestamp="1726484228021", oauth_signature="O48zkrcE8YC58kP+6iyD4JNaXwASxTJIsOhpfFFAKdrF/yVFXlCqQQDktFN7YcPM8h0g8plHLOUxjiDS1kib4uUiC4hRJ8vfkOzQfW4Egqy4NRRHxhVBiVhV08YZzpnraK187Q5CKbhOMTfAdwFVP3JLifDJpL0b52w6Cyy7InAQqbJGXVKTirOmkOH+Pjic0hx9amkSVDO6CJIK/HkjvrsMzJyW3aMpHkcqJY0CM/OpobuUY7G7RORjs6Bmm4ayrf/jPWrHi+ezdGsNbfDVTFNcXm1d5zwF2aNl92ZZooFtbadE4LKTfLmSvmSN6Qgn/4sR43fM/lEV1O8PAwvQM5+aP8LAVYKZAKs0fkpgBT3BpU7xyrutRGvp+ODS1n0yj85f+RtKnxi0yax7a9zhJJpPy1uKsMT3OUltBdgBfrlz6ep2nxzagiHC5w+uILOpjnVtwUCMEsfvQYIE2SF43fy8ZiByaj0cDgkeJZONA5Rf/Omrnu2GKZYQTV+3OAvjWziaDuMM8FOwboySZmdzOc8h8fsM9ppM7uj8gzI4spUR6ZaPRxRu7ug0ueOqSCJtWKWi09Kxxh0Y1H3nMde+Ay6NSwoUhSVIQOVGC2rma+uLFqr5shNmxSSINAQNX5NPf0cbBBKgFGCtiwbLO5YYPqjE8ReWz2rGBPl3Zgd/U1lJchaieA3jbqmvSox9OBizZHNhVmcKuaFFEzm8Iz/N55GF6azepb2sBjvY8G5d7pGtcS/pRBIMcqVf75Wjd+YmAZp/hW+CVO5UNhzyNv3OsdZe6vDbox+w2idVYg74OUVAAkwOZ2bvcL2YuQfNU+DJgUB+RQpDIsh0CC++A25hTMzaFxcxXn/nA+8WUNynEpkyIFyIfoYtPyW6MfQsvkA5MQM2gVfxU7FNuKai1Z3A108zEIkoJddMr/7n24Xc5cEqoNuZB3phtZWzZhtykf39TDYMpadFtEBL+Ulx5ZPORI7y9CPQ23owUb0FVX5rOaXs1X8azN7iPe9srKMTk86gaWtmLRe0C7lw8VZWpg1HvuKnUzo4UVOBq/T6M+rmvj+eP8vpcezQD/4fNtiVKUV+KoHVcGcZurrdiFmKIIfHUE/yRaq/lFNDJy0A4XRRY4WW6cswDlDHrv4ynTK+b5BR0BN4GC5jZ6LTdGoAvRJ6E6b56S25fPI+xrMacRYU/GvY3PcCZONwagywsKpF7dV5UCVGZGYXvoAtFAvb27AayWIq4HrJ7Wwkuj9WT4LCqHiykvAHMuviPi0jJJbxbbuEvXUVwxY9A+/kMIouPp9d3omkiHGJMsVTtiGTt3U6s75LwNDgc44oqsGLRrkX2AQPRZiJ0/KI/XMdrMVLJtl6hA=="'
                },
                body: {
                    order_id: '99999999',
                    payment_id: '29f2713b9c6b440a8719835f5a536e62',
                    status: 'SUCCESS'
                }
            }).catch(function (err) {
                assert.equal(err.statusCode, 404, 'Should return a 404 Not Found response');
            });
        });
    });
});