"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast, Toaster } from "react-hot-toast";
import { authService } from "@/services/authService";

function LoginContent() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleLogin = async () => {
    try {
      setLoading(true);
      const user = await authService.login(username, password);
      toast.success(`Welcome ${user.name || "User"}!`);
      const nextParam = searchParams.get("next") || "";
      const nextPath = nextParam.startsWith("/") ? nextParam : "";
      if (nextPath && user.role !== "admin") {
        router.replace(nextPath);
      } else {
        router.replace(user.role === "admin" ? "/admin" : "/student-portal");
      }
    } catch (error) {
      toast.error(error?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-br from-indigo-900 via-gray-900 to-indigo-700">
      <Toaster position="top-right" />
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">LKD Portal Login</h1>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Phone / Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-500 font-semibold"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginContent />
    </Suspense>
  );
}
