/**
 * Headscale API client utility
 * Provides authenticated fetch wrapper for Headscale API requests
 */

export async function headscaleFetch(
    endpoint: string,
    options?: RequestInit
): Promise<Response> {
    const baseUrl = process.env.HEADSCALE_URL || "http://localhost:8080";
    const apiKey = process.env.HEADSCALE_API_KEY || "";

    if (!apiKey) {
        throw new Error("HEADSCALE_API_KEY environment variable is not set");
    }

    const url = `${baseUrl}/api/v1${endpoint}`;

    const headers = new Headers(options?.headers || {});
    headers.set("Authorization", `Bearer ${apiKey}`);
    headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
        ...options,
        headers,
    });

    return response;
}
