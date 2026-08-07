export const validateParamString = (input: string | string[] | undefined): input is string =>
    input !== undefined && input !== null && !Array.isArray(input);
