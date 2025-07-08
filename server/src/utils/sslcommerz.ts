import crypto from 'crypto';

interface SSLCommerzConfig {
  store_id: string;
  store_passwd: string;
  is_live: boolean;
}

interface PaymentRequest {
  tran_id: string;
  total_amount: number;
  currency: string;
  product_category: string;
  product_name: string;
  product_profile: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
  ship_name: string;
  ship_add1: string;
  ship_city: string;
  ship_postcode: string;
  ship_country: string;
  multi_card_name: string;
  value_a: string; // courseId
  value_b: string; // enrollmentId
  value_c: string; // userId
  value_d: string; // batchId (optional)
}

interface PaymentResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  gatewayPageURL?: string;
  tran_id?: string;
  bank_tran_id?: string;
  amount?: string;
  currency?: string;
  store_amount?: string;
  val_id?: string;
  tran_date?: string;
  error?: string;
}

class SSLCommerzService {
  private config: SSLCommerzConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      store_id: process.env.SSLCOMMERZ_STORE_ID || 'testbox',
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty',
      is_live: process.env.NODE_ENV === 'production'
    };

    this.baseUrl = this.config.is_live 
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';

    // Add this debug log:
    console.log('SSLCommerz ENV:', {
      store_id: process.env.SSLCOMMERZ_STORE_ID,
      store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD,
      NODE_ENV: process.env.NODE_ENV
    });
    console.log('SSLCommerz CONFIG:', this.config);
  }

  private generateHash(data: string): string {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async createPaymentSession(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const {
        tran_id,
        total_amount,
        currency,
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
        value_d
      } = paymentData;

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

      // Create hash
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

      const result = await response.json() as any;

      if (result.status === 'VALID' || result.status === 'VALIDATED') {
        return {
          status: 'SUCCESS',
          sessionkey: result.sessionkey,
          gatewayPageURL: result.GatewayPageURL,
          tran_id: result.tran_id
        };
      } else {
        return {
          status: 'FAILED',
          failedreason: result.failedreason || 'Payment session creation failed',
          error: result.error
        };
      }
    } catch (error) {
      console.error('SSLCommerz payment session creation error:', error);
      return {
        status: 'FAILED',
        failedreason: 'Internal server error'
      };
    }
  }

  async validatePayment(tran_id: string, val_id: string, amount: string, currency: string): Promise<PaymentResponse> {
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

      const result = await response.json() as any;

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
      } else {
        return {
          status: 'FAILED',
          failedreason: result.failedreason || 'Payment validation failed'
        };
      }
    } catch (error) {
      console.error('SSLCommerz payment validation error:', error);
      return {
        status: 'FAILED',
        failedreason: 'Internal server error during validation'
      };
    }
  }

  generateTransactionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }
}

export const sslCommerzService = new SSLCommerzService();
export type { PaymentRequest, PaymentResponse }; 