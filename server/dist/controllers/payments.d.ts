import { Request, Response } from 'express';
export declare const getAllPayments: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPaymentsByUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPaymentsByEnrollment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const markPaymentCompleted: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCustomPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createCartPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createFreeEnrollment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=payments.d.ts.map