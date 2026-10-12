import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

export default function Register() {
const navigate = useNavigate();

const [form, setForm] = useState({
firstName: "",
lastName: "",
email: "",
password: "",
organizationId: "",
});

const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
e.preventDefault();
setError("");
setLoading(true);


try {
  await registerUser({
    ...form,
    organizationId: Number(form.organizationId),
  });

  navigate("/login", {
    state: {
      message:
        "Registration submitted successfully. Please wait for your organization admin to approve your account.",
    },
  });
} catch (err) {
  setError(
    err.response?.data?.message ||
      err.response?.data ||
      "Registration failed. Please check your details."
  );
} finally {
  setLoading(false);
}


};
return (

  <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-slate-900">
        Join your organization
      </h1>


  <p className="mt-2 text-sm text-slate-500">
    Create an account to request access to your workplace.
  </p>

  {error && (
    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
      {typeof error === "string"
        ? error
        : "Registration failed. Please check your details."}
    </div>
  )}

  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <input
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        placeholder="First name"
        required
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />

      <input
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        placeholder="Last name"
        required
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>

    <input
      type="email"
      name="email"
      value={form.email}
      onChange={handleChange}
      placeholder="Work email"
      required
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />

    <input
      type="password"
      name="password"
      value={form.password}
      onChange={handleChange}
      placeholder="Password"
      minLength={8}
      required
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />

    <input
      type="number"
      name="organizationId"
      value={form.organizationId}
      onChange={handleChange}
      placeholder="Organization ID"
      min="1"
      required
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />

    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Submitting..." : "Request to join"}
    </button>
  </form>

  <p className="mt-6 text-center text-sm text-slate-500">
    Already registered?{" "}
    <Link
      to="/login"
      className="font-semibold text-indigo-600 hover:text-indigo-700"
    >
      Sign in
    </Link>
  </p>

  <div className="mt-5 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
    Creating a new organization?{" "}
    <Link
      to="/register-organization"
      className="font-semibold text-indigo-600 hover:text-indigo-700"
    >
      Register organization
    </Link>
  </div>
</div>


  </div>
);
}
