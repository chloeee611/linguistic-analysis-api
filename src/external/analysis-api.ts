import axios from "axios";

const baseURL = process.env.ANALYSIS_API_URL;

if (!baseURL) {
    throw new Error("Missing base url for analysis API");
}

export const analysisApi = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});
