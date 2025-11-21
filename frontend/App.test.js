import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Signin from "./Components/Signin";
import Signup from "./Components/Signup";
import { authAPI } from "./api/client";

// Mock the API client
jest.mock("./api/client", () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

// Mock Firebase
jest.mock("./Firebase", () => ({
  setAuthUser: jest.fn(),
}));

describe("Authentication Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Signin Component", () => {
    test("renders login form", () => {
      render(
        <BrowserRouter>
          <Signin />
        </BrowserRouter>
      );
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    test("validates email format", async () => {
      render(
        <BrowserRouter>
          <Signin />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.blur(emailInput, { target: { value: "invalid-email" } });
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    test("validates password presence", async () => {
      render(
        <BrowserRouter>
          <Signin />
        </BrowserRouter>
      );
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.blur(passwordInput, { target: { value: "" } });
      
      await waitFor(() => {
        expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
      });
    });

    test("calls login API on form submit", async () => {
      const mockToken = "mock-jwt-token";
      const mockUser = { id: "123", name: "Test User", email: "test@example.com" };
      
      authAPI.login.mockResolvedValue({
        data: { token: mockToken, user: mockUser },
      });

      render(
        <BrowserRouter>
          <Signin />
        </BrowserRouter>
      );
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith("test@example.com", "password123");
      });
    });
  });

  describe("Signup Component", () => {
    test("renders registration form", () => {
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    });

    test("validates all required fields", async () => {
      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.blur(nameInput, { target: { value: "" } });
      fireEvent.blur(emailInput, { target: { value: "" } });
      fireEvent.blur(passwordInput, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText(/please enter your name/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
        expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
      });
    });

    test("calls register API on form submit", async () => {
      const mockToken = "mock-jwt-token";
      const mockUser = { id: "123", name: "Test User", email: "test@example.com" };
      
      authAPI.register.mockResolvedValue({
        data: { token: mockToken, user: mockUser },
      });

      render(
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      );
      
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: "Test User" } });
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith("Test User", "test@example.com", "password123");
      });
    });
  });
});

