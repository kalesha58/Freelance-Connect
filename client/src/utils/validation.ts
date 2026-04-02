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
    const minLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    return minLength && hasUpper && hasNumber && hasSpecial;
};

export const passwordsMatch = (p1: string, p2: string) => {
    return p1 === p2;
};

export interface LoginErrors {
    emailOrPhone?: string;
    password?: string;
}

export const validateLogin = (email: string, password: string): LoginErrors => {
    const errors: LoginErrors = {};

    if (!email.trim()) {
        errors.emailOrPhone = 'Email is required';
    } else if (!isValidEmail(email)) {
        errors.emailOrPhone = 'Invalid email format';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
        errors.password = 'Invalid password format';
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
        errors.emailOrPhone = 'Email is required';
    } else if (!isValidEmail(emailOrPhone)) {
        errors.emailOrPhone = 'Invalid email format';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (!isValidPassword(password)) {
        errors.password = 'Password must be 6+ chars with Uppercase, Number, & Special';
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
