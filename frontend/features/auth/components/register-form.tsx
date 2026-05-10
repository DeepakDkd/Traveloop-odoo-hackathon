"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { FormEvent, HTMLInputTypeAttribute } from "react";
import { useRouter } from "next/navigation";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  password: string;
  confirmPassword: string;
  additionalInformation: string;
};

type RegisterErrors = Partial<Record<keyof RegisterFormValues, string>>;

type RegisterResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  city: "",
  country: "",
  password: "",
  confirmPassword: "",
  additionalInformation: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  function updateField<Key extends keyof RegisterFormValues>(
    field: Key,
    value: RegisterFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setStatusMessage("");
    setStatusType("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setStatusMessage("");
    setStatusType("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post<RegisterResponse>(
        `${API_BASE_URL}/api/auth/register`,
        {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phoneNumber: values.phoneNumber.trim(),
          city: values.city.trim(),
          country: values.country.trim(),
          password: values.password,
          additionalInfo: values.additionalInformation.trim(),
        },
        {
          withCredentials: true,
        },
      );

      setValues(initialValues);
      setStatusMessage(
        response.data.message || "Registration successful. Please log in.",
      );
      setStatusType("success");

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } catch (error) {
      const message = axios.isAxiosError<RegisterResponse>(error)
        ? error.response?.data?.message || "Unable to register right now"
        : "Something went wrong while registering";

      setStatusMessage(message);
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-5">
      <form
        className="register-card flex w-full flex-col items-center gap-8 rounded-[1.5rem] px-6 py-8 sm:px-10 sm:py-10"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="overflow-hidden rounded-full border-2 border-black/10 bg-white">
          <Image
            src="/dummy-profile.svg"
            alt="Dummy profile"
            width={112}
            height={112}
            className="h-28 w-28"
            priority
          />
        </div>

        <div className="register-inner w-full rounded-[1.25rem] p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="First Name"
              value={values.firstName}
              onChange={(value) => updateField("firstName", value)}
              error={errors.firstName}
            />
            <FormField
              label="Last Name"
              value={values.lastName}
              onChange={(value) => updateField("lastName", value)}
              error={errors.lastName}
            />
            <FormField
              label="Email Address"
              type="email"
              value={values.email}
              onChange={(value) => updateField("email", value)}
              error={errors.email}
            />
            <FormField
              label="Phone Number"
              type="tel"
              value={values.phoneNumber}
              onChange={(value) => updateField("phoneNumber", value)}
              error={errors.phoneNumber}
            />
            <FormField
              label="City"
              value={values.city}
              onChange={(value) => updateField("city", value)}
              error={errors.city}
            />
            <FormField
              label="Country"
              value={values.country}
              onChange={(value) => updateField("country", value)}
              error={errors.country}
            />
            <FormField
              label="Password"
              type="password"
              value={values.password}
              onChange={(value) => updateField("password", value)}
              error={errors.password}
            />
            <FormField
              label="Confirm Password"
              type="password"
              value={values.confirmPassword}
              onChange={(value) => updateField("confirmPassword", value)}
              error={errors.confirmPassword}
            />
          </div>

          <div className="mt-4">
            <TextAreaField
              label="Additional Information ...."
              value={values.additionalInformation}
              onChange={(value) => updateField("additionalInformation", value)}
              error={errors.additionalInformation}
            />
          </div>
        </div>

        {statusMessage ? (
          <StatusMessage type={statusType || "success"}>
            {statusMessage}
          </StatusMessage>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="app-primary-button rounded-xl px-6 py-3 text-sm font-medium shadow-[0_4px_16px_rgba(13,110,110,0.22)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Registering..." : "Register Users"}
        </button>

        <div className="text-center text-sm text-[#6b7280]">
          <p>
            If you already have an account{" "}
            <Link
              href="/login"
              className="font-medium text-[#0d6e6e] underline underline-offset-4"
            >
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: HTMLInputTypeAttribute;
};

function FormField({
  label,
  value,
  onChange,
  error,
  type = "text",
}: FormFieldProps) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className={`register-input w-full rounded-[0.9rem] px-4 py-3 text-base text-[#1a1a2e] outline-none ${
          error ? "border-[#ef4444]" : ""
        }`}
      />
      {error ? <p className="mt-1 text-xs text-[#ef4444]">{error}</p> : null}
    </div>
  );
}

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function TextAreaField({
  label,
  value,
  onChange,
  error,
}: TextAreaFieldProps) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        placeholder={label}
        className={`register-input min-h-40 w-full rounded-[1rem] px-4 py-4 text-base text-[#1a1a2e] outline-none ${
          error ? "border-[#ef4444]" : ""
        }`}
      />
      {error ? <p className="mt-1 text-xs text-[#ef4444]">{error}</p> : null}
    </div>
  );
}

function StatusMessage({
  children,
  type,
}: {
  children: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`w-full rounded-xl px-4 py-3 text-sm ${
        type === "error"
          ? "bg-red-50 text-red-600"
          : "bg-emerald-50 text-[#10b981]"
      }`}
    >
      {children}
    </div>
  );
}

function validate(values: RegisterFormValues) {
  const errors: RegisterErrors = {};

  if (!values.firstName.trim()) errors.firstName = "Required";
  if (!values.lastName.trim()) errors.lastName = "Required";

  if (!values.email.trim()) {
    errors.email = "Required";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Invalid email";
  }

  if (!values.phoneNumber.trim()) errors.phoneNumber = "Required";
  if (!values.city.trim()) errors.city = "Required";
  if (!values.country.trim()) errors.country = "Required";

  if (!values.password.trim()) {
    errors.password = "Required";
  } else if (values.password.length < 6) {
    errors.password = "Minimum 6 characters";
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = "Required";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return errors;
}
