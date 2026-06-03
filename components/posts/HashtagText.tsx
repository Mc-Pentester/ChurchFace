"use client";

type Props = {
  text: string;
};

export default function HashtagText({ text }: Props) {

  const words = text.split(" ");

  return (
    <p className="text-gray-800 leading-relaxed">
      {words.map((word, index) => {

        const isHashtag = word.startsWith("#");

        if (isHashtag) {
          return (
            <span
              key={index}
              className="text-emerald-600 font-semibold hover:underline cursor-pointer mr-1"
            >
              {word}
            </span>
          );
        }

        return (
          <span key={index} className="mr-1">
            {word}
          </span>
        );
      })}
    </p>
  );
}