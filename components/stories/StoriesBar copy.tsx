"use client";

export default function StoriesBar() {
  const stories = [
    { name: "Samuel", img: "https://i.pravatar.cc/100?img=1" },
    { name: "Jeunesse", img: "https://i.pravatar.cc/100?img=2" },
    { name: "Louange", img: "https://i.pravatar.cc/100?img=3" },
    { name: "Prière", img: "https://i.pravatar.cc/100?img=4" },
  ];

  const userProfile = "https://i.pravatar.cc/100?img=12"; // ta photo

  return (
    <div className="bg-white rounded-xl p-3">

      <div className="flex gap-4 overflow-x-auto w-full">

        {/* CREATE STORY BUTTON (PROFILE BACKGROUND) */}
        <button className="flex flex-col items-center flex-shrink-0 w-20 group">

          <div
            className="w-16 h-16 rounded-full relative overflow-hidden border-2 border-gray-300"
          >

            {/* background image */}
            <img
              src={userProfile}
              alt="Créer une story"
              className="w-full h-full object-cover"
            />

            {/* dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />

            {/* plus button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center font-bold">
                +
              </div>
            </div>

          </div>

          <span className="text-xs mt-1 text-gray-600">
            Créer story
          </span>

        </button>

        {/* STORIES */}
        {stories.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center flex-shrink-0 w-20"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500">
              <img
                src={s.img}
                alt={s.name}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>

            <span className="text-xs mt-1 truncate w-full text-center">
              {s.name}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}
