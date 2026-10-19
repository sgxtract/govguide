// Temporary token preview. Replaced by the city picker in Lesson 03.
export default function Home() {
  return (
    <div className="mx-auto max-w-page px-4 py-12">
      <h1 className="max-w-prose text-display font-extrabold tracking-tight">
        Get your government errand done in one trip.
      </h1>
      <p className="mt-6 max-w-prose text-lg text-muted">
        Where to go, what to bring, the steps, the fees, and how long it takes,
        for offices in Sorsogon.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Type and color check</h2>
      <p className="mt-4 max-w-prose">
        Body text is 18px with generous line height so it stays readable on a
        phone outdoors. Links look like{" "}
        <a href="https://github.com/sgxtract/govguide">this</a>.
      </p>

      <div className="mt-6 max-w-prose rounded-md border-l-6 border-ink bg-notice px-4 py-3">
        <p className="font-bold">Bring photocopies.</p>
        <p>Notice callout. Used for things people commonly forget.</p>
      </div>

      <div className="mt-6 max-w-prose border-y border-rule bg-surface px-4 py-3">
        <p className="text-sm text-muted">Surface block with ruled edges.</p>
      </div>
    </div>
  );
}
