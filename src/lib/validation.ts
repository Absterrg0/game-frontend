import { z } from "zod";

/** Schema for the complete signup / user information form */
export const signupFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  alias: z.string().min(1, "Alias is required").trim(),
  name: z.string().min(1, "Name is required").trim(),
  dateOfBirth: z.string().optional(),
  gender: z
    .union([z.enum(["male", "female", "other"]), z.literal("")])
    .optional(),
  appleId: z.string().optional(),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
