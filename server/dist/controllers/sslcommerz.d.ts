import { Request, Response } from 'express';
export declare const createPaymentSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const paymentSuccess: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const paymentFail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const paymentCancel: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const paymentIPN: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=sslcommerz.d.ts.map