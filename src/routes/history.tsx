import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/pakodo/PageHeader";
import { draftToRequest, RequestFields, type RequestDraft } from "@/components/pakodo/RequestFields";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { groupByProduct, normalizeProduct } from "@/lib/insights";
import { deleteRequest, updateRequest, useRequests } from "@/lib/pakodo-store";
import type { DemandRequest } from "@/lib/pakodo-types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Request history — PAKODO" },
      { name: "description", content: "All customer requests you've recorded." },
      { property: "og:title", content: "Request history — PAKODO" },
      { property: "og:description", content: "All customer requests you've recorded." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

type StatusFilter = "all" | "pending" | "stocked";

function HistoryPage() {
  const requests = useRequests();
  const [q, setQ] = useState("");
  const [product, setProduct] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<DemandRequest | null>(null);
  const [deleting, setDeleting] = useState<DemandRequest | null>(null);
  const products = useMemo(() => groupByProduct(requests), [requests]);

  const filtered = requests.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (product && normalizeProduct(r.product) !== product) return false;
    const s = q.trim().toLowerCase();
    if (s && ![r.product, r.customer, r.details].some((v) => v?.toLowerCase().includes(s))) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="History" subtitle={`${requests.length} request${requests.length === 1 ? "" : "s"} saved`} />
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products or customers" className="h-12 pl-10 text-lg" aria-label="Search" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Filter by product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="h-12 rounded-md border border-input bg-card px-3 text-base"
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.key} value={p.key}>{p.product} ({p.count})</option>
            ))}
          </select>
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-12 rounded-md border border-input bg-card px-3 text-base"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="stocked">Stocked</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center">
          <p className="text-lg">No requests saved yet.</p>
          <Button asChild size="lg" className="mt-4 h-12"><Link to="/record">Record the first one</Link></Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No requests match your search.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-xl font-bold">{r.product}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    {r.quantity && ` · ${r.quantity}`}
                    {r.customer && ` · ${r.customer}`}
                  </p>
                  {r.details && <p className="mt-1 text-sm">{r.details}</p>}
                  {r.sample && <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-bold uppercase">Sample data</span>}
                </div>
                <button
                  onClick={() => updateRequest(r.id, { status: r.status === "pending" ? "stocked" : "pending" })}
                  className={`flex h-9 items-center gap-1 rounded-full px-3 text-sm font-bold ${r.status === "stocked" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"}`}
                  aria-label={`Status ${r.status}. Tap to change`}
                >
                  {r.status === "stocked" ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                  {r.status === "stocked" ? "Stocked" : "Pending"}
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="h-10" onClick={() => setEditing(r)}><Pencil className="size-4" /> Edit</Button>
                <Button variant="outline" size="sm" className="h-10 text-destructive" onClick={() => setDeleting(r)}><Trash2 className="size-4" /> Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && <EditDialog request={editing} onClose={() => setEditing(null)} />}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>“{deleting?.product}” will be removed. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleting) deleteRequest(deleting.id);
                toast.success("Request deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditDialog({ request, onClose }: { request: DemandRequest; onClose: () => void }) {
  const [draft, setDraft] = useState<RequestDraft>({
    product: request.product,
    customer: request.customer ?? "",
    quantity: request.quantity ?? "",
    details: request.details ?? "",
  });
  const [showError, setShowError] = useState(false);
  function save() {
    if (!draft.product.trim()) return setShowError(true);
    try {
      const r = draftToRequest(draft);
      updateRequest(request.id, { product: r.product, customer: r.customer ?? "", quantity: r.quantity ?? "", details: r.details ?? "" });
      toast.success("Request updated");
      onClose();
    } catch {
      toast.error("Could not save changes", { action: { label: "Retry", onClick: save } });
    }
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit request</DialogTitle></DialogHeader>
        <RequestFields value={draft} onChange={setDraft} showError={showError} />
        <DialogFooter className="gap-2">
          <Button variant="outline" className="h-12" onClick={onClose}>Cancel</Button>
          <Button className="h-12" onClick={save}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
