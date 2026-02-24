import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";
import { api } from "@/lib/api";
import { PENDING_SIGNUP_TOKEN_KEY } from "@/lib/auth";
import { signupFormSchema, type SignupFormValues } from "@/lib/validation";

/** Form data without pendingToken (injected from sessionStorage). */
export type CompleteSignupFormData = Omit<SignupFormValues, "pendingToken">;

interface UseCompleteSignupOptions {
  onSuccess: () => void | Promise<void>;
  getPendingToken: () => string | null;
}

interface CompleteSignupResult {
  success: boolean;
  fieldErrors?: Record<string, string>;
  message?: string;
}

/**
 * Encapsulates the complete-signup mutation: validation, API call, and side effects.
 * Backend is idempotent, so double submission is safe.
 */
export function useCompleteSignup({
  onSuccess,
  getPendingToken,
}: UseCompleteSignupOptions) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(
    async (rawData: CompleteSignupFormData): Promise<CompleteSignupResult> => {
      const pendingToken = getPendingToken();
      if (!pendingToken) {
        return {
          success: false,
          message: "Session expired. Please sign in again.",
        };
      }

      const result = signupFormSchema.safeParse({
        ...rawData,
        pendingToken,
      });

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.flatten().fieldErrors &&
          Object.entries(result.error.flatten().fieldErrors).forEach(
            ([key, msgs]) => {
              if (msgs?.[0]) fieldErrors[key] = msgs[0];
            }
          );
        return { success: false, fieldErrors };
      }

      const parsed = result.data;
      let dateOfBirth: string | null = null;
      if (parsed.dateOfBirth) {
        const date = parseISO(parsed.dateOfBirth);
        dateOfBirth = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        ).toISOString();
      }

      setIsLoading(true);
      try {
        const response = await api.post("/api/auth/complete-signup", {
          pendingToken: parsed.pendingToken,
          alias: parsed.alias,
          name: parsed.name,
          dateOfBirth,
          gender: parsed.gender || null,
        });

        if (
          response.status === 200 &&
          !response?.data?.error &&
          response?.data?.code === "SIGNUP_SUCCESSFUL"
        ) {
          sessionStorage.removeItem(PENDING_SIGNUP_TOKEN_KEY);
          await onSuccess();
          return { success: true };
        }

        return {
          success: false,
          message: response?.data?.message ?? "Sign up failed.",
        };
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const msg =
          err?.response?.data?.message ?? "Sign up failed. Please try again.";
        const isTokenError =
          typeof msg === "string" &&
          (msg.includes("expired") || msg.includes("Invalid"));
        if (isTokenError) {
          sessionStorage.removeItem(PENDING_SIGNUP_TOKEN_KEY);
          navigate("/login", { replace: true });
        }
        return { success: false, message: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [getPendingToken, navigate, onSuccess]
  );

  return { submit, isLoading };
}
