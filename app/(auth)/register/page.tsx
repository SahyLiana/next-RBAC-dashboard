"use client";
import { apiClient } from "@/app/lib/apiClient";
import Link from "next/link";
import { useActionState } from "react";

export type RegisterState = {
  error?: string;
  success?: boolean;
};
function RegisterPage() {
  const [state, registerAction, isPending] = useActionState(
    async (
      prevState: RegisterState,
      formData: FormData,
    ): Promise<RegisterState> => {
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const teamCode = formData.get("teamCode") as string;
      console.log(name, email, password, teamCode);
      try {
        await apiClient.register({
          name,
          email,
          password,
          teamCode: teamCode || undefined,
        });
        window.location.href = "/dashboard";
        //USE router.push('/dashboard')/NO RELOADING PAGE HERE
        return { success: true };
      } catch (e) {
        return {
          error: e instanceof Error ? e.message : "Registration failed",
        };
      }
    },
    { error: undefined, success: undefined },
  );
  return (
    <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 w-full max-w-md">
      <form action={registerAction}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Create new account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Or{" "}
            <Link
              href={"/login"}
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in to existing account
            </Link>
          </p>
        </div>
        {state?.error && (
          <div
            className="bg-red-900/50 border border-b-red-700 text-red-300 px-4 py-3 rounded mb-4'
            "
          >
            {state.error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="text-sm block font-medium text-slate-300 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              autoComplete="name"
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="text-sm block font-medium text-slate-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              autoComplete="email"
              required
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm block font-medium text-slate-300 mb-1"
            >
              Password
            </label>
            <input
              id="name"
              name="password"
              type="password"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              autoComplete="new-password"
              required
              placeholder="Create your password"
            />
          </div>
          <div>
            <label
              htmlFor="teamCode"
              className="text-sm block font-medium text-slate-300 mb-1"
            >
              Team Code (optional)
            </label>
            <input
              id="teamCode"
              name="teamCode"
              type="text"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
              placeholder="Enter your Team Code if you have one"
            />
            <p className="text-xs text-slate-500 mt-1">
              Leave empty if you dont have one
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={isPending}
        >
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
