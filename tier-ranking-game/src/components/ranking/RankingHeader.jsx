import { CompletionMessage } from './CompletionMessage.jsx';

export function RankingHeader({ genre, complete }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-xl font-black text-[#111827] sm:text-2xl">{genre.heading}</h1>
      <CompletionMessage complete={complete} />
    </div>
  );
}
