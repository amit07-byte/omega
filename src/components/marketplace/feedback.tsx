export function Feedback({ error, notice }: { error?: string; notice?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p role="status" className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
        {notice}
      </p>
    );
  }
  return null;
}

export function statusLabel(status: "draft" | "published" | "pending" | "accepted" | "rejected") {
  if (status === "draft") return "Draft";
  if (status === "published") return "Published";
  if (status === "pending") return "Pending";
  if (status === "accepted") return "Accepted";
  return "Rejected";
}
