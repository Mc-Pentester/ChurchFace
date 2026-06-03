"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const login = async () => {
    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });
  };

  const register = async () => {
    await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });

    await login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow w-96 space-y-3">

        <input
          placeholder="Nom"
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={register}
          className="w-full bg-emerald-600 text-white py-2 rounded"
        >
          S&apos;inscrire
        </button>

        <button
          onClick={login}
          className="w-full bg-gray-900 text-white py-2 rounded"
        >
          Se connecter
        </button>

      </div>
    </div>
  );
}