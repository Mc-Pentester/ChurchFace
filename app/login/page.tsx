"use client";

import LoginModal from "@/components/LoginModal";
import { useState } from "react";

export default function LoginPage() {
  const [openLogin, setOpenLogin] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      <LoginModal
        isOpen={openLogin}
        onClose={() => window.location.href = "/"}
      />
    </main>
  );
}
