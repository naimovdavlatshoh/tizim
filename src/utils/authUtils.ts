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

        // Use fetch to avoid circular dependency with axios interceptors
        const response = await fetch(
            "https://apitizim.argon.uz/validate-token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                },
                body: JSON.stringify({}),
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data?.jwt) {
                localStorage.setItem("token", data.jwt);
                console.log("Token successfully refreshed");
                return true;
            }
        }

        console.log("Token refresh failed");
        return false;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
};

export const handleAuthError = (error: any): boolean => {
    // Check if it's a 401 Unauthorized error
    if (error?.response?.status === 401 || error?.status === 401) {
        console.log(
            "401 Unauthorized error detected. Clearing local storage and reloading page..."
        );

        // Clear all data from local storage
        localStorage.clear();

        // Also clear session storage if it exists
        if (typeof sessionStorage !== "undefined") {
            sessionStorage.clear();
        }

        // Show a brief message to the user
        if (typeof window !== "undefined") {
            // You can customize this message
            console.log("Session expired. Redirecting to login page...");
        }

        // Reload the page after a short delay to ensure storage is cleared
        setTimeout(() => {
            window.location.reload();
        }, 100);

        return true; // Error was handled
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
