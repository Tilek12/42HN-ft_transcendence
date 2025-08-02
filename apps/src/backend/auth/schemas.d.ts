export declare const loginSchema: {
    body: {
        type: string;
        required: string[];
        properties: {
            username: {
                type: string;
            };
            password: {
                type: string;
            };
        };
    };
};
export declare const registerSchema: {
    body: {
        type: string;
        required: string[];
        properties: {
            username: {
                type: string;
            };
            email: {
                type: string;
                format: string;
            };
            password: {
                type: string;
                minLength: number;
            };
        };
    };
};
//# sourceMappingURL=schemas.d.ts.map