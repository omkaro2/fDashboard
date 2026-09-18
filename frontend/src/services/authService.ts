import { apiRequest } from "./api";

export interface LoggedInUser {
  id?: string;
  _id?: string;
  email: string;
  name: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: LoggedInUser;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  token?: string;
  user?: LoggedInUser;
  message?: string;
}

export interface CurrentUserResponse {
  success: boolean;
  user?: LoggedInUser;
  message?: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authService = {
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): LoggedInUser | null {
    const user = localStorage.getItem(USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as LoggedInUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setAuth(token: string, user: LoggedInUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    try {
      const data = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.success && data.token && data.user) {
        this.setAuth(data.token, data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login failed. Please try again.",
      };
    }
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<RegisterResponse> {
    try {
      const data = await apiRequest<RegisterResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (data.success && data.token && data.user) {
        this.setAuth(data.token, data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Registration failed. Please try again.",
      };
    }
  },

  async getCurrentUser(): Promise<CurrentUserResponse> {
    const token = this.getToken();

    if (!token) {
      return {
        success: false,
        message: "No authentication token found.",
      };
    }

    try {
      const data = await apiRequest<CurrentUserResponse>("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success && data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message.includes("401") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("token")
        )
      ) {
        this.logout();
      }

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to get current user.",
      };
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};