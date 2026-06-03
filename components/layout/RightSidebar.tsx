"use client";

import Link from "next/link";

const news = [
  {
    title: "Grande croisade ce week-end 🔥",
    date: "Samedi • 18h00",
    href: "/events",
  },
  {
    title: "Nouveau live de prière",
    date: "Ce soir • 20h30",
    href: "/events",
  },
  {
    title: "Jeûne et prière communautaire",
    date: "Lundi • 6h00",
    href: "/events",
  },
];

export default function RightSidebar() {
  return (
    <aside className="hidden xl:block w-72 h-screen sticky top-0 bg-white p-4 overflow-y-auto">

      {/* Actualités */}
      <div className="bg-white rounded-2xl shadow-sm p-4">

        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Actualités
        </h3>

        <div className="space-y-4">

          {news.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="block pb-3 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            >
              <p className="font-semibold text-gray-700">
                {item.title}
              </p>

              <span className="text-sm text-gray-500">
                {item.date}
              </span>
            </Link>
          ))}

        </div>
      </div>

      {/* Événement spécial */}
      <div className="mt-6 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-5 shadow-lg">

        <h3 className="text-xl font-bold mb-2">
          Événement spécial ✨
        </h3>

        <p className="text-sm text-emerald-100">
          Conférence jeunesse internationale ce mois-ci.
        </p>

        <Link href="/events">
          <button className="mt-4 bg-white text-emerald-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
            En savoir plus
          </button>
        </Link>

      </div>

    </aside>
  );
}