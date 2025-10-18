/**
 * Authentication utility functions
 */

/**
 * Refreshes the authentication token by calling validate-token API
 * @returns Promise<boolean> - true if token was successfully refreshed, false otherwise
 */
export const refreshToken = async (): Promise<boolean> => {
    try {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            console.log("No token found to refresh");
            return false;
        }

        // Import PostSimple dynamically to avoid circular dependency
        const { PostSimple } = await import("../service/data");

        const response: any = await PostSimple("validate-token", {});

        if (response?.jwt) {
            // Update the token in localStorage
            localStorage.setItem("token", response.jwt);
            console.log("Token successfully refreshed");
            return true;
        } else {
            console.log("No new token received from validate-token API");
            return false;
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
};

/**
 * Handles authentication errors (401 Unauthorized)
 * Attempts to refresh the token, if that fails, clears storage and reloads
 * @param error - The error object from axios
 * @returns Promise<boolean> - true if it was a 401 error and was handled, false otherwise
 */
export const handleAuthError = async (error: any): Promise<boolean> => {
    // Check if it's a 401 Unauthorized error
    if (error?.response?.status === 401 || error?.status === 401) {
        console.log(
            "401 Unauthorized error detected. Attempting to refresh token..."
        );

        // Try to refresh the token
        const tokenRefreshed = await refreshToken();

        if (tokenRefreshed) {
            console.log(
                "Token refreshed successfully. Retrying the original request..."
            );
            return true; // Token was refreshed, original request can be retried
        } else {
            console.log(
                "Token refresh failed. Clearing local storage and reloading page..."
            );

            // Clear all data from local storage
            localStorage.clear();

            // Also clear session storage if it exists
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.clear();
            }

            // Show a brief message to the user
            if (typeof window !== "undefined") {
                console.log("Session expired. Redirecting to login page...");
            }

            // Reload the page after a short delay to ensure storage is cleared
            setTimeout(() => {
                window.location.reload();
            }, 100);

            return true; // Error was handled
        }
    }

    return false; // Not a 401 error
};

/**
 * Clears all authentication data from storage
 * Useful for logout functionality
 */
export const clearAuthData = (): void => {
    localStorage.clear();
    if (typeof sessionStorage !== "undefined") {
        sessionStorage.clear();
    }
    console.log("Authentication data cleared");
};

/**
 * Checks if user is authenticated by verifying token exists
 * @returns true if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("token");
    return !!token;
};

/**
 * Gets the current authentication token
 * @returns token string or null if not found
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
};

/**
 * Gets the current user role
 * @returns role string or null if not found
 */
export const getUserRole = (): string | null => {
    return localStorage.getItem("role");
};
