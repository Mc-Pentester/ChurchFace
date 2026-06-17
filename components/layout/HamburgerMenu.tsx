"use client";

import { useState } from "react";
import { Menu, X, User, Users, LogOut, LogIn, Church, HeartHandshake } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    setIsOpen(false);
  };

  const handleLogin = () => {
    router.push("/login");
    setIsOpen(false);
  };

  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition"
      >
        {isOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
              {session?.user && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {session.user.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{session.user.name}</p>
                    <p className="text-white/70 text-sm">{session.user.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {/* Profile - First element */}
              <button
                onClick={() => navigate(session?.user ? `/profile/${session.user.id}` : "/profile")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 transition text-left"
              >
                <User size={20} className="text-emerald-600" />
                <span className="font-medium text-gray-700">Mon Profil</span>
              </button>

              {/* Friends */}
              <button
                onClick={() => navigate("/friends")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 transition text-left"
              >
                <Users size={20} className="text-emerald-600" />
                <span className="font-medium text-gray-700">Amis</span>
              </button>

              {/* Prayer */}
              <button
                onClick={() => navigate("/prayer-space")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 transition text-left"
              >
                <HeartHandshake size={20} className="text-emerald-600" />
                <span className="font-medium text-gray-700">Prière</span>
              </button>

              {/* Create Church */}
              <button
                onClick={() => navigate("/church/create")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-purple-50 transition text-left"
              >
                <Church size={20} className="text-emerald-600" />
                <span className="font-medium text-gray-700">Créer une église</span>
              </button>

              <div className="border-t border-gray-200 my-4" />

              {/* Login/Logout */}
              {session ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition text-left"
                >
                  <LogOut size={20} className="text-red-600" />
                  <span className="font-medium text-red-600">Se déconnecter</span>
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-purple-600 text-white hover:shadow-lg transition text-left"
                >
                  <LogIn size={20} className="text-white" />
                  <span className="font-medium">Se connecter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
