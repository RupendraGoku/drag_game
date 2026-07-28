export function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <section className="surface p-6">
        <h1 className="text-3xl font-black text-[#111827]">How to Play</h1>
        <ol className="mt-5 space-y-4 text-sm leading-6 text-[#334155]">
          <li>
            <strong>1. Choose a genre.</strong> Open a published game from the homepage or genres page.
          </li>
          <li>
            <strong>2. Pick a top category.</strong> Category tabs filter only the remaining unranked image pool.
          </li>
          <li>
            <strong>3. Drag every image.</strong> Move cards into ranking rows, reorder them, or drag them back to the pool.
          </li>
          <li>
            <strong>4. Keep editing.</strong> Progress is saved in this browser and the board remains editable after completion.
          </li>
          <li>
            <strong>5. Export when complete.</strong> The exported image contains the ranked board without the unranked pool.
          </li>
        </ol>
      </section>
    </div>
  );
}
