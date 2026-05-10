"use client";

import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/context";

type LoginValues = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
  email: "",
  password: "",
};

type LoginResponse = {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    avatar?: string;
    photo?: string;
    profilePhoto?: string;
  };
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppContext();
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

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
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/auth/login`,
        {
          email: values.email.trim(),
          password: values.password,
        },
        {
          withCredentials: true,
        },
      );

      const responseUser = response.data.user;

      if (!response.data.success || !responseUser) {
        setStatusMessage(response.data.message || "Login failed");
        setStatusType("error");
        return;
      }

      const fullName =
        responseUser.name ||
        `${responseUser.firstName ?? ""} ${responseUser.lastName ?? ""}`.trim() ||
        responseUser.email;

      setCurrentUser({
        id: responseUser.id,
        email: responseUser.email,
        name: fullName,
        avatar:
          responseUser.avatar || responseUser.photo || responseUser.profilePhoto,
      });

      setStatusMessage(response.data.message || "Login successful");
      setStatusType("success");
      router.push("/");
    } catch (error) {
      const message = axios.isAxiosError<LoginResponse>(error)
        ? error.response?.data?.message || "Unable to login right now"
        : "Something went wrong while logging in";

      setStatusMessage(message);
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-130">
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
              type="email"
              value={values.email}
              onChange={(value) => updateField("email", value)}
              error={errors.email}
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
          <div
            className={`w-full rounded-xl px-4 py-3 text-sm ${
              statusType === "error"
                ? "bg-red-50 text-red-600"
                : "bg-emerald-50 text-[#10b981]"
            }`}
          >
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
  type?: "text" | "password" | "email";
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

  if (!values.email.trim()) {
    errors.email = "Required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Enter a valid email";
  }
  if (!values.password.trim()) errors.password = "Required";

  return errors;
}
