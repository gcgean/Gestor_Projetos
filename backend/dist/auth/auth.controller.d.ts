import { AuthService } from './auth.service';
declare class CredentialsDto {
    name: string;
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: CredentialsDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
    login(dto: CredentialsDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: string;
        };
    }>;
}
export {};
