// Validates that the string exists
export const validateParamString = (input: string | string[] | undefined): input is string =>
    input !== undefined && input !== null && !Array.isArray(input);

// Validates that the inputted data is a string
export const validateRequiredString = (input: unknown): input is string =>
    typeof input === "string" && input.trim().length > 0;

// Validates that the inputted email is in the correct format
export const validateEmail = (input: unknown): input is string => {
    if (typeof input !== "string") {
        return false;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

// Validates date of birth and prevents future dates
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

// Validates that the username is 3-15 chars long and can contain uppercase, lowercase, and numbers
export const validateUsername = (input: unknown): input is string => {
    if (typeof input !== "string") {
        return false;
    }

    return /^[a-zA-Z0-9_]{3,15}$/.test(input);
};

// Validates that the password is more than 8 chars long and contains one uppercase, one lowercase, and one number
export const validatePassword = (input: unknown): input is string => {
    if (typeof input !== "string") {
        return false;
    }

    return input.length >= 8 && /[A-Z]/.test(input) && /[a-z]/.test(input) && /[0-9]/.test(input);
};
