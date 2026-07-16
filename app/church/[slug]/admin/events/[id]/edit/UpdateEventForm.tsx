"use client";

interface Props {
  churchId:string;
  slug:string;
  event:any;
}

export default function UpdateEventForm({
  churchId,
  slug,
  event
}:Props){

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p>
        Formulaire édition événement : {event.title}
      </p>
    </div>
  );
}