import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface RequestDraft {
  product: string;
  customer: string;
  quantity: string;
  details: string;
}

export function RequestFields({
  value,
  onChange,
  showError,
}: {
  value: RequestDraft;
  onChange: (v: RequestDraft) => void;
  showError?: boolean;
}) {
  const set = (k: keyof RequestDraft) => (e: { target: { value: string } }) => onChange({ ...value, [k]: e.target.value });
  const missing = showError && !value.product.trim();
  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="f-product" className="text-base">
          Product name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="f-product"
          value={value.product}
          onChange={set("product")}
          placeholder="e.g. Millet flour"
          aria-invalid={missing || undefined}
          className="h-12 text-lg"
        />
        {missing && <p className="text-sm font-semibold text-destructive">Please enter the product name.</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="f-customer" className="text-base">Customer name <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="f-customer" value={value.customer} onChange={set("customer")} className="h-12 text-lg" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="f-qty" className="text-base">Quantity <span className="text-muted-foreground">(optional)</span></Label>
          <Input id="f-qty" value={value.quantity} onChange={set("quantity")} placeholder="e.g. 2 kg" className="h-12 text-lg" />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="f-details" className="text-base">Additional details <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea id="f-details" value={value.details} onChange={set("details")} rows={2} className="text-base" />
      </div>
    </div>
  );
}

export function draftToRequest(d: RequestDraft) {
  return {
    product: d.product.trim(),
    ...(d.customer.trim() ? { customer: d.customer.trim() } : {}),
    ...(d.quantity.trim() ? { quantity: d.quantity.trim() } : {}),
    ...(d.details.trim() ? { details: d.details.trim() } : {}),
  };
}
