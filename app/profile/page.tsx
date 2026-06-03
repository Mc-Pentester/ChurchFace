"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!session) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.bio) setBio(data.user.bio);
      })
      .catch(console.error);
  }, [session]);

  if (!session) return null;

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-xl shadow w-96">

        <img
          src={session.user?.image || "/avatar.png"}
          alt={session.user?.name || "Avatar utilisateur"}
          className="w-20 h-20 rounded-full"
        />

        <h2 className="text-xl font-bold mt-3">
          {session.user?.name}
        </h2>

        <p className="text-gray-500">
          {session.user?.email}
        </p>

        {bio && (
          <p className="mt-3 text-gray-700 text-sm">
            {bio}
          </p>
        )}

        <Link
          href="/profile/edit"
          className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Modifier mon profil →
        </Link>

      </div>
    </div>
  );
}
