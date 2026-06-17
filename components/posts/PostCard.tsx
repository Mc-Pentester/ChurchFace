import HashtagText from "./HashtagText";
import ReportButton from "../moderation/ReportButton";

type Props = {
  id: string;
  author: string;
  content: string;
};

export default function PostCard({
  id,
  author,
  content,
}: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 mt-4">
      <h3 className="font-bold text-lg">
        {author}
      </h3>

      <p className="mt-2 text-gray-900 whitespace-pre-wrap break-words">
        {content}
      </p>
        
      <div className="mt-4 flex gap-4">
        <button>❤️ Amen</button>
        <button>🙏 Prier</button>
        <button>💬 Répondre</button>
        <ReportButton targetId={id} targetType="post" />
      </div>
    </div>
  );
}
