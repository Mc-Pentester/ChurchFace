"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReportButton from "@/components/moderation/ReportButton";

export default function StoryViewer() {

  const params = useParams();
  const router = useRouter();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";


  const [story, setStory] = useState<any>(null);


  useEffect(() => {

    if (!id) return;

    loadStory();

  }, [id]);


  async function loadStory() {

    const res = await fetch(`/api/stories/${id}`);

    const data = await res.json();

    setStory(data);


    await fetch(`/api/stories/${id}/view`, {
      method: "POST",
    });


    setTimeout(() => {

      if (data.nextStoryId) {

        router.push(
          `/stories/${data.nextStoryId}`
        );

      }

    }, 5000);

  }


  if (!story) {

    return (
      <div className="h-screen bg-black" />
    );

  }


  return (

    <div className="fixed inset-0 bg-black z-50">


      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">


        <div className="flex-1">

          <div className="h-1 bg-white/20 rounded">

            <div
              className="h-1 bg-white animate-[grow_5s_linear]"
            />

          </div>

        </div>



        <div className="ml-4">

          <ReportButton
            targetId={id}
            targetType="story"
          />

        </div>


      </div>



      <div className="h-full flex items-center justify-center">


        {story.imageUrl && (

          <img
            src={story.imageUrl}
            alt=""
            className="max-h-full object-contain"
          />

        )}



        {story.videoUrl && (

          <video
            src={story.videoUrl}
            autoPlay
            controls
            className="max-h-full"
          />

        )}


      </div>


    </div>

  );

}