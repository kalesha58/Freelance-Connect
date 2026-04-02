export const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone: string) => {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
};

export const isValidEmailOrPhone = (value: string) => {
    return isValidEmail(value) || isValidPhone(value);
};

export const isValidPassword = (password: string) => {
    return password.length >= 6;
};

export const passwordsMatch = (p1: string, p2: string) => {
    return p1 === p2;
};

export interface LoginErrors {
    emailOrPhone?: string;
    password?: string;
}

export const validateLogin = (emailOrPhone: string, password: string): LoginErrors => {
    const errors: LoginErrors = {};

    if (!emailOrPhone.trim()) {
        errors.emailOrPhone = 'Email or phone is required';
    } else if (!isValidEmailOrPhone(emailOrPhone)) {
        errors.emailOrPhone = 'Invalid email or phone format';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    return errors;
};

export interface SignupErrors {
    name?: string;
    emailOrPhone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
}

export const validateSignup = (
    name: string,
    emailOrPhone: string,
    password: string,
    confirmPassword: string,
    termsAccepted: boolean
): SignupErrors => {
    const errors: SignupErrors = {};

    if (!name.trim()) {
        errors.name = 'Full name is required';
    } else if (name.trim().length < 3) {
        errors.name = 'Name must be at least 3 characters';
    }

    if (!emailOrPhone.trim()) {
        errors.emailOrPhone = 'Email or phone is required';
    } else if (!isValidEmailOrPhone(emailOrPhone)) {
        errors.emailOrPhone = 'Invalid email or phone format';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
        errors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
        errors.terms = 'You must accept the terms and conditions';
    }

    return errors;
};
