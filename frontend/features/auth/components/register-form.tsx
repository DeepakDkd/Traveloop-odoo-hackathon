"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ChangeEvent, FormEvent, HTMLInputTypeAttribute } from "react";

type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  additionalInformation: string;
  photoDataUrl: string;
};

type RegisterErrors = Partial<Record<keyof RegisterFormValues, string>>;

const initialValues: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  city: "",
  country: "",
  additionalInformation: "",
  photoDataUrl: "",
};

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

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

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSelectedFileName(file?.name ?? "");

    if (!file) {
      updateField("photoDataUrl", "");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      updateField("photoDataUrl", dataUrl);
    } catch {
      setStatusMessage("Could not read selected image.");
    }
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
      await wait(500);
      console.log("Registration form data:", values);
      setValues(initialValues);
      setSelectedFileName("");
      setStatusMessage("Form submitted. Check the console for the data.");
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
        <div className="overflow-hidden rounded-full border-2 border-slate-300 bg-slate-50">
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

        {selectedFileName ? (
          <p className="text-sm text-slate-500">{selectedFileName}</p>
        ) : null}

        {statusMessage ? <StatusMessage>{statusMessage}</StatusMessage> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Registering..." : "Register Users"}
        </button>

        <div className="text-center text-sm text-slate-500">
          
          <p>
            If you already have an account{" "}
            <Link
              href="/login"
              className="font-medium text-slate-700 underline underline-offset-4"
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
        className={`register-input w-full rounded-[0.9rem] px-4 py-3 text-base text-slate-700 outline-none ${error ? "border-rose-400" : ""
          }`}
      />
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
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
        className={`register-input min-h-40 w-full rounded-[1rem] px-4 py-4 text-base text-slate-700 outline-none ${error ? "border-rose-400" : ""
          }`}
      />
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
    </div>
  );
}

function StatusMessage({ children }: { children: string }) {
  return (
    <div className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
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

  return errors;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
