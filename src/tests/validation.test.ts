import {
    validateRequiredString,
    validateEmail,
    validateUsername,
    validatePassword,
    validateDob,
} from "../helpers/validation.helpers";

describe("validateRequiredString", () => {
    test("accepts a valid string", () => {
        expect(validateRequiredString("chloe")).toBe(true);
    });

    test("rejects an empty string", () => {
        expect(validateRequiredString("")).toBe(false);
    });

    test("rejects whitespace", () => {
        expect(validateRequiredString("   ")).toBe(false);
    });

    test("rejects undefined", () => {
        expect(validateRequiredString(undefined)).toBe(false);
    });

    test("rejects null", () => {
        expect(validateRequiredString(null)).toBe(false);
    });
});

describe("validateEmail", () => {
    test("accepts a valid email", () => {
        expect(validateEmail("chloe@gmail.com")).toBe(true);
    });

    test("rejects an invalid email", () => {
        expect(validateEmail("chloe-gmail")).toBe(false);
    });

    test("rejects an email without a domain", () => {
        expect(validateEmail("chloe@")).toBe(false);
    });

    test("rejects a non-string value", () => {
        expect(validateEmail(123)).toBe(false);
    });
});

describe("validateUsername", () => {
    test("accepts a valid username", () => {
        expect(validateUsername("chloe611")).toBe(true);
    });

    test("rejects a username that is too short", () => {
        expect(validateUsername("cc")).toBe(false);
    });

    test("rejects a username that is too long", () => {
        expect(validateUsername("c".repeat(31))).toBe(false);
    });

    test("rejects a username containing invalid characters", () => {
        expect(validateUsername("chloe!#")).toBe(false);
    });

    test("rejects a non-string value", () => {
        expect(validateUsername(123)).toBe(false);
    });
});

describe("validatePassword", () => {
    test("accepts a valid password", () => {
        expect(validatePassword("Password123")).toBe(true);
    });

    test("rejects a password that is too short", () => {
        expect(validatePassword("Pass")).toBe(false);
    });

    test("rejects a password without an uppercase letter", () => {
        expect(validatePassword("password123")).toBe(false);
    });

    test("rejects a password without a lowercase letter", () => {
        expect(validatePassword("PASSWORD123")).toBe(false);
    });

    test("rejects a password without a number", () => {
        expect(validatePassword("Password")).toBe(false);
    });

    test("rejects a non-string value", () => {
        expect(validatePassword(12345678)).toBe(false);
    });
});

describe("validateDob", () => {
    test("accepts a valid date of birth", () => {
        expect(validateDob("1999-11-06")).toBe(true);
    });

    test("rejects an empty string", () => {
        expect(validateDob("")).toBe(false);
    });

    test("rejects a whitespace-only string", () => {
        expect(validateDob("   ")).toBe(false);
    });

    test("rejects undefined", () => {
        expect(validateDob(undefined)).toBe(false);
    });

    test("rejects null", () => {
        expect(validateDob(null)).toBe(false);
    });

    test("rejects a non-string value", () => {
        expect(validateDob(19991106)).toBe(false);
    });

    test("rejects an invalid date", () => {
        expect(validateDob("not-date")).toBe(false);
    });

    test("rejects a future date", () => {
        expect(validateDob("2099-01-01")).toBe(false);
    });

    test("accepts today's date", () => {
        const today = new Date().toISOString().split("T")[0];

        expect(validateDob(today)).toBe(true);
    });
});
