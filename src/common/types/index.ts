import { Request } from "express";

export type AuthCookie = {
    accessToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        role: string;
        sub: string;
        id?: string;
        tenant: string;
    };
}
