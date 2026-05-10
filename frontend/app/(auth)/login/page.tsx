"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useAppContext } from "@/lib/context";

type LoginValues = {
  username: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
  username: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAppContext();
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function updateField<Key extends keyof LoginValues>(
    field: Key,
    value: LoginValues[Key],
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
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: values.username,
          password: values.password,
        },
      });
      await refreshUser();
      toast.success("Welcome back");
      router.push("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[520px]">
      <form
        className="register-card flex w-full flex-col items-center gap-8 rounded-[1.5rem] px-6 py-10 sm:px-10 sm:py-12"
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

        <div className="register-inner w-full rounded-[1.25rem] p-5 sm:p-6">
          <div className="space-y-6">
            <Field
              label="Email"
              value={values.username}
              onChange={(value) => updateField("username", value)}
              error={errors.username}
            />

            <Field
              label="Password"
              type="password"
              value={values.password}
              onChange={(value) => updateField("password", value)}
              error={errors.password}
            />
          </div>
        </div>

        {statusMessage ? (
          <div className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-[#10b981]">
            {statusMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="app-primary-button rounded-xl px-6 py-3 text-sm font-medium shadow-[0_4px_16px_rgba(13,110,110,0.22)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Login Button"}
        </button>

        <div className="text-center text-sm text-[#6b7280]">
          <p>
            If not a user then{" "}
            <Link
              href="/register"
              className="font-medium text-[#0d6e6e] underline underline-offset-4"
            >
              register
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: "text" | "password";
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        className={`register-input w-full rounded-[0.9rem] px-5 py-4 text-base text-[#1a1a2e] outline-none ${
          error ? "border-[#ef4444]" : ""
        }`}
      />
      {error ? <p className="mt-1 text-xs text-[#ef4444]">{error}</p> : null}
    </div>
  );
}

function validate(values: LoginValues) {
  const errors: LoginErrors = {};

  if (!values.username.trim()) errors.username = "Required";
  if (!values.password.trim()) errors.password = "Required";

  return errors;
}
