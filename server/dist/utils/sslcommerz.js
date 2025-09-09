"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslCommerzService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class SSLCommerzService {
    constructor() {
        this.config = {
            store_id: process.env.SSLCOMMERZ_STORE_ID || 'testbox',
            store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty',
            is_live: process.env.NODE_ENV === 'production'
        };
        this.baseUrl = this.config.is_live
            ? 'https://securepay.sslcommerz.com'
            : 'https://sandbox.sslcommerz.com';
        console.log('SSLCommerz ENV:', {
            store_id: process.env.SSLCOMMERZ_STORE_ID,
            store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
            NODE_ENV: process.env.NODE_ENV
        });
        console.log('SSLCommerz CONFIG:', this.config);
    }
    generateHash(data) {
        return crypto_1.default.createHash('md5').update(data).digest('hex');
    }
    async createPaymentSession(paymentData) {
        try {
            const { tran_id, total_amount, currency, product_category, product_name, product_profile, cus_name, cus_email, cus_add1, cus_city, cus_postcode, cus_country, cus_phone, ship_name, ship_add1, ship_city, ship_postcode, ship_country, multi_card_name, value_a, value_b, value_c, value_d } = paymentData;
            const postData = {
                store_id: this.config.store_id,
                store_passwd: this.config.store_passwd,
                total_amount,
                currency,
                tran_id,
                product_category,
                product_name,
                product_profile,
                cus_name,
                cus_email,
                cus_add1,
                cus_city,
                cus_postcode,
                cus_country,
                cus_phone,
                ship_name,
                ship_add1,
                ship_city,
                ship_postcode,
                ship_country,
                multi_card_name,
                value_a,
                value_b,
                value_c,
                value_d,
                success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success`,
                fail_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/fail`,
                cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
                ipn_url: `${process.env.SERVER_URL || 'http://localhost:4000'}/api/payments/sslcommerz/ipn`,
            };
            const hashString = `${this.config.store_id}${tran_id}${total_amount}${currency}${cus_name}${cus_email}${value_a}${value_b}${value_c}${value_d}${cus_add1}${cus_city}${cus_postcode}${cus_country}${cus_phone}${ship_name}${ship_add1}${ship_city}${ship_postcode}${ship_country}${product_category}${product_name}${product_profile}${multi_card_name}${this.config.store_passwd}`;
            const hash = this.generateHash(hashString);
            const requestData = {
                ...postData,
                hash
            };
            const response = await fetch(`${this.baseUrl}/gwprocess/v4/api.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            const result = await response.json();
            if (result.status === 'VALID' || result.status === 'VALIDATED') {
                return {
                    status: 'SUCCESS',
                    sessionkey: result.sessionkey,
                    gatewayPageURL: result.GatewayPageURL,
                    tran_id: result.tran_id
                };
            }
            else {
                return {
                    status: 'FAILED',
                    failedreason: result.failedreason || 'Payment session creation failed',
                    error: result.error
                };
            }
        }
        catch (error) {
            console.error('SSLCommerz payment session creation error:', error);
            return {
                status: 'FAILED',
                failedreason: 'Internal server error'
            };
        }
    }
    async validatePayment(tran_id, val_id, amount, currency) {
        try {
            const hashString = `${this.config.store_id}${val_id}${this.config.store_passwd}`;
            const hash = this.generateHash(hashString);
            const response = await fetch(`${this.baseUrl}/validator/api/validationserverAPI.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    val_id,
                    store_id: this.config.store_id,
                    store_passwd: this.config.store_passwd,
                    format: 'json'
                })
            });
            const result = await response.json();
            if (result.status === 'VALID' || result.status === 'VALIDATED') {
                return {
                    status: 'SUCCESS',
                    tran_id: result.tran_id,
                    bank_tran_id: result.bank_tran_id,
                    amount: result.amount,
                    currency: result.currency,
                    store_amount: result.store_amount,
                    val_id: result.val_id,
                    tran_date: result.tran_date
                };
            }
            else {
                return {
                    status: 'FAILED',
                    failedreason: result.failedreason || 'Payment validation failed'
                };
            }
        }
        catch (error) {
            console.error('SSLCommerz payment validation error:', error);
            return {
                status: 'FAILED',
                failedreason: 'Internal server error during validation'
            };
        }
    }
    generateTransactionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `TXN_${timestamp}_${random}`.toUpperCase();
    }
}
exports.sslCommerzService = new SSLCommerzService();
//# sourceMappingURL=sslcommerz.js.map