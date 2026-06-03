"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({
  isOpen,
  onClose,
}: Props) {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  if (!isOpen) return null;

  /**
   * ðŸ”¥ LOGIN
   */
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      onClose();

    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  /**
   * ðŸ”¥ REGISTER
   */
  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur inscription");
        return;
      }

      // âœ… AUTO LOGIN
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      onClose();

    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl"
        >
          Ã—
        </button>

        {/* LOGO */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-emerald-600">
            ChurchFace
          </h1>

          <p className="text-gray-500 mt-2">
            RÃ©seau social chrÃ©tien moderne
          </p>
        </div>

        {/* SWITCH */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">

          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              !isRegister
                ? "bg-white shadow text-emerald-600"
                : "text-gray-500"
            }`}
          >
            Connexion
          </button>

          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              isRegister
                ? "bg-white shadow text-emerald-600"
                : "text-gray-500"
            }`}
          >
            Inscription
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-4 bg-red-100 text-red-600 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* NAME */}
          {isRegister && (
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
          />

          {/* BUTTON */}
          <button
            disabled={loading}
            onClick={
              isRegister
                ? handleRegister
                : handleLogin
            }
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading
              ? "Chargement..."
              : isRegister
              ? "CrÃ©er un compte"
              : "Se connecter"}
          </button>

        </div>

      </div>

    </div>
  );
}

