"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

type Props = {
  onLoginClick: () => void;
};

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1920&q=80",
    title: "Une génération transformée par la Parole",
    subtitle:
      "Messages, lives, communauté et foi dans une expérience sociale moderne.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1920&q=80",
    title: "Adoration • Foi • Impact",
    subtitle:
      "Connecte-toi avec des croyants du monde entier à travers Church Face.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=1920&q=80",
    title: "Church Face",
    subtitle:
      "Le réseau social chrétien nouvelle génération 🔥",
  },
];

export default function HeroSlider({
  onLoginClick,
}: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  return (
    <section className="relative h-[92vh] w-full overflow-hidden">

      {/* SLIDES */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            current === index
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ))}

      {/* CONTENT */}
      <div className="relative z-20 flex items-center justify-center h-full px-6">

        <div className="max-w-5xl text-center text-white">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-8">

            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-sm font-medium tracking-wide">
              Réseau Social Chrétien Moderne
            </span>

          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl xl:text-6xl font-extrabold leading-tight max-w-4xl mx-auto">
            {slides[current].title}
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {slides[current].subtitle}
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">

            <button
              onClick={onLoginClick}
              className="bg-emerald-600 hover:bg-emerald-700 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Commencer maintenant
            </button>

            <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl text-lg font-medium transition-all duration-300">

              <Play className="w-5 h-5" />

              Explorer la plateforme

            </button>

          </div>

        </div>

      </div>

      {/* LEFT ARROW */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-3 rounded-full transition"
      >
        <ChevronLeft className="text-white w-6 h-6" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-3 rounded-full transition"
      >
        <ChevronRight className="text-white w-6 h-6" />
      </button>

      {/* INDICATORS */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">

        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-300 rounded-full ${
              current === index
                ? "w-10 h-3 bg-white"
                : "w-3 h-3 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}

      </div>

      {/* FADE BOTTOM */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-100 to-transparent z-10" />

    </section>
  );
}