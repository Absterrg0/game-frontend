import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parseISO } from "date-fns";
import { api } from "@/lib/api";
import { signupFormSchema, type SignupFormValues } from "@/lib/validation";

export type CompleteSignupFormData = SignupFormValues;

interface UseCompleteSignupOptions {
  onSuccess: () => void | Promise<void>;
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
}: UseCompleteSignupOptions) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  async function submit(
    rawData: CompleteSignupFormData
  ): Promise<CompleteSignupResult> {
    const result = signupFormSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const flattened = result.error.flatten();
      if (Object.keys(flattened.fieldErrors).length > 0) {
        Object.entries(flattened.fieldErrors).forEach(([key, msgs]) => {
          if (msgs?.[0]) fieldErrors[key] = msgs[0];
        });
      }
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
      const response = await api.post("/api/session/complete-signup", {
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
        await onSuccessRef.current();
        return { success: true };
      }

      return {
        success: false,
        message: response?.data?.message ?? "Sign up failed.",
      };
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; code?: string } };
      };
      const data = err?.response?.data;
      const msg = data?.message ?? "Sign up failed. Please try again.";
      const code = data?.code;
      const isSessionError =
        code === "INVALID_SESSION" ||
        (typeof msg === "string" && /session\s*(expired|invalid)|login again/i.test(msg));
      if (isSessionError) {
        navigate("/login", { replace: true });
      }
      if (code === "EMAIL_ALREADY_EXISTS") {
        return { success: false, message: msg, fieldErrors: { email: msg } };
      }
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading };
}
