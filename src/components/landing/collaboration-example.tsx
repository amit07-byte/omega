export function CollaborationExample() {
  return (
    <figure className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-primary/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full bg-clay/15"
      />
      <figcaption className="relative text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Example collaboration
      </figcaption>
      <div className="relative mt-4 rounded-2xl border bg-background p-4 sm:p-5">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Local business
        </p>
        <p className="mt-2 font-heading text-2xl tracking-tight">Harbor & Rye</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          A neighborhood bakery looking for a creator to document a Saturday
          market series.
        </p>
      </div>
      <p className="relative my-3 flex items-center gap-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        Collaboration
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </p>
      <div className="relative rounded-2xl border bg-background p-4 sm:p-5">
        <p className="text-xs font-medium tracking-wide text-clay uppercase">
          Creator
        </p>
        <p className="mt-2 font-heading text-2xl tracking-tight">
          A local photographer
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Food and neighborhood stories, working within a few miles of the
          bakery.
        </p>
      </div>
    </figure>
  );
}
