export declare function findUserByUsername(username: string): Promise<any>;
export declare function findUserByEmail(email: string): Promise<any>;
export declare function findUserById(id: string): Promise<any>;
export declare function createUser(username: string, email: string, hashedPassword: string): Promise<void>;
export declare function getUsernameById(id: string): Promise<string | null>;
//# sourceMappingURL=user.d.ts.map