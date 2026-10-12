import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerOrganization } from "../api/authApi";

export default function RegisterOrganization() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerOrganization({
        organizationName: form.organizationName.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/login", {
        state: {
          message:
            "Organization registered successfully. Please log in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Organization registration failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl font-bold text-indigo-700">
            W
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Create your workspace
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Register your organization and create its administrator account.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="space-y-5">
          <div>
            <label htmlFor="organizationName" className={labelClass}>
              Organization name
            </label>
            <input
              id="organizationName"
              name="organizationName"
              type="text"
              placeholder="e.g. Acme Technologies"
              value={form.organizationName}
              onChange={handleChange}
              required
              maxLength={150}
              autoComplete="organization"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className={labelClass}>
                Administrator's first name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="lastName" className={labelClass}>
                Administrator's last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className={`${inputClass} pr-16`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 mt-1 px-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating workspace..." : "Create organization"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Log in
          </Link>
        </p>

        <p className="mt-3 text-center text-sm text-gray-600">
          Joining an existing organization?{" "}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            Register as a user
          </Link>
        </p>
      </form>
    </div>
  );
}