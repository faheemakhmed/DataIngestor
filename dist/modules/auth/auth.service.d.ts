export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
}
export declare function createUser(data: CreateUserDto): Promise<{
    id: string;
    email: string;
    password: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function validateUser(email: string, password: string): Promise<{
    id: string;
    email: string;
    name: string | null;
} | null>;
export declare function getUserById(id: string): Promise<{
    id: string;
    email: string;
    password: string;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
} | null>;
//# sourceMappingURL=auth.service.d.ts.map