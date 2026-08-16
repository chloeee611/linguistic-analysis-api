export const validateParamString = (input: string | string[] | undefined): input is string =>
    input !== undefined && input !== null && !Array.isArray(input);

export const validateRequiredString = (input: unknown): input is string =>
    typeof input === "string" && input.trim().length > 0;

export const validateEmail = (input: unknown): input is string => {
    if (typeof input !== "string") {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

// Validates date and prevents future dates
export const validateDob = (input: unknown): input is string => {
    if (typeof input !== "string" || input.trim() === "") {
        return false;
    }

    const date = new Date(input);

    if (Number.isNaN(date.getTime())) {
        return false;
    }

    return date <= new Date();
};

export const validateUsername = (input: unknown): input is string => {
    if (typeof input !== "string") {
        return false;
    }

    return /^[a-zA-Z0-9_]{3,15}$/.test(input);
};

export const validatePassword = (input: unknown): input is string => {
    if (typeof input !== "string") {
        return false;
    }

    return input.length >= 8 && /[A-Z]/.test(input) && /[a-z]/.test(input) && /[0-9]/.test(input);
};
