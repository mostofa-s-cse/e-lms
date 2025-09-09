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
    value_a: string;
    value_b: string;
    value_c: string;
    value_d: string;
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
declare class SSLCommerzService {
    private config;
    private baseUrl;
    constructor();
    private generateHash;
    createPaymentSession(paymentData: PaymentRequest): Promise<PaymentResponse>;
    validatePayment(tran_id: string, val_id: string, amount: string, currency: string): Promise<PaymentResponse>;
    generateTransactionId(): string;
}
export declare const sslCommerzService: SSLCommerzService;
export type { PaymentRequest, PaymentResponse };
//# sourceMappingURL=sslcommerz.d.ts.map