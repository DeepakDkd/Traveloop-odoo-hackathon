"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, HTMLInputTypeAttribute } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useAppContext } from "@/lib/context";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  city: string;
  country: string;
  additionalInformation: string;
};

type RegisterErrors = Partial<Record<keyof RegisterFormValues, string>>;

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  city: "",
  country: "",
  additionalInformation: "",
};

export function RegisterForm() {
  const router = useRouter();
  const { refreshUser } = useAppContext();
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

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
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setStatusMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("email", values.email);
      formData.append("phoneNumber", values.phoneNumber);
      formData.append("password", values.password);
      formData.append("city", values.city);
      formData.append("country", values.country);
      formData.append("additionalInfo", values.additionalInformation);
      if (photo) formData.append("photo", photo);

      await apiRequest("/api/auth/register", {
        method: "POST",
        body: formData,
      });
      await refreshUser();
      toast.success("Account created");
      setStatusMessage("Account created. Taking you to your dashboard...");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      setStatusMessage(message);
      toast.error(message);
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
        <label className="cursor-pointer overflow-hidden rounded-full border-2 border-black/10 bg-white">
          <Image
            src={photo ? URL.createObjectURL(photo) : "/dummy-profile.svg"}
            alt="Dummy profile"
            width={112}
            height={112}
            className="h-28 w-28"
            priority
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => setPhoto(event.target.files?.[0] || null)}
          />
        </label>

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
              label="Password"
              type="password"
              value={values.password}
              onChange={(value) => updateField("password", value)}
              error={errors.password}
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
          </div>

          <div className="mt-4">
            <TextAreaField
              label="Additional Information ...."
              value={values.additionalInformation}
              onChange={(value) =>
                updateField("additionalInformation", value)
              }
              error={errors.additionalInformation}
            />
          </div>
        </div>

        {statusMessage ? <StatusMessage>{statusMessage}</StatusMessage> : null}

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

function StatusMessage({ children }: { children: string }) {
  return (
    <div className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-[#10b981]">
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
  if (!values.password.trim()) {
    errors.password = "Required";
  } else if (values.password.length < 8) {
    errors.password = "Use at least 8 characters";
  }
  if (!values.city.trim()) errors.city = "Required";
  if (!values.country.trim()) errors.country = "Required";

  return errors;
}
