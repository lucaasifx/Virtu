import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .max(255, 'Email muito longo')
        .email('Email inválido')
        .transform(val => val.trim().toLowerCase()),
    password: z
        .string()
        .min(1, 'Senha é obrigatória')
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .max(72, 'Senha pode ter no máximo 72 caracteres'),
});

// Register schema (with password confirmation)
export const registerSchema = z.object({
    email: z
        .string()
        .min(1, 'Email é obrigatório')
        .max(255, 'Email muito longo')
        .email('Email inválido')
        .transform(val => val.trim().toLowerCase()),
    password: z
        .string()
        .min(1, 'Senha é obrigatória')
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
        .max(72, 'Senha pode ter no máximo 72 caracteres')
        .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
        .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    confirmPassword: z
        .string()
        .min(1, 'Confirmação de senha é obrigatória'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

// Types
export type LoginInput = z.input<typeof loginSchema>;
export type LoginOutput = z.output<typeof loginSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterOutput = z.output<typeof registerSchema>;

// Validation helper
export function validateAuth(
    data: { email: string; password: string; confirmPassword?: string },
    isLogin: boolean
): { success: true; data: LoginOutput | RegisterOutput } | { success: false; errors: Record<string, string> } {
    const schema = isLogin ? loginSchema : registerSchema;
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) {
            errors[field] = issue.message;
        }
    }

    return { success: false, errors };
}
