export interface Extracted {
  product: string;
  customer?: string;
  quantity?: string;
}

const UNITS =
  "kg|kgs|kilo|kilos|kilogram|kilograms|g|gm|gms|gram|grams|l|ltr|litre|litres|liter|liters|ml|packet|packets|pack|packs|piece|pieces|pcs|bottle|bottles|box|boxes|dozen|bag|bags|tin|tins|jar|jars|units?";

const WORD_NUMBERS: Record<string, string> = {
  one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  a: "1", an: "1", half: "0.5",
};

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (/^[a-z]/.test(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** Best-effort extraction of product, customer and quantity from a spoken sentence. */
export function extractRequest(input: string): Extracted {
  let text = input.trim().replace(/\s+/g, " ").replace(/[.!?।]+$/u, "");
  if (!text) return { product: "" };

  // Remove "not available" style trailing clauses
  text = text.replace(
    /[,\s]*(but|and|which|that)?\s*(it|they|this|that)?\s*(is|are|was|were)?\s*(not|n't)\s*(available|in stock|there)\b.*$/i,
    "",
  );
  text = text.replace(/[,\s]*(we|i)\s+(don't|do not|didn't)\s+have\s+(it|them|that)?.*$/i, "");
  text = text.replace(/[,\s]*(out of stock|unavailable)\b.*$/i, "");

  let customer: string | undefined;
  const named = text.match(/\bcustomer\s+(?:named|called)\s+([A-Z][\w]*(?:\s[A-Z][\w]*)?)/);
  const leading = text.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(?:asked|wants|wanted|needs|needed|requested|was looking)/);
  if (named?.[1]) customer = named[1];
  else if (leading?.[1] && !/^(A|The|One|Customer|Someone|Somebody|He|She|They)$/i.test(leading[1]))
    customer = leading[1];

  const trigger =
    /\b(?:asked\s+(?:me\s+)?for|asking\s+for|asked\s+about|wants?|wanted|needs?|needed|requested|request(?:ed)?\s+for|looking\s+for|was\s+looking\s+for|enquired\s+about|inquired\s+about)\s+(.+)$/i;
  const m = text.match(trigger);
  let product = (m?.[1] ?? text).trim();

  let quantity: string | undefined;
  const qty = product.match(new RegExp(`^(\\d+(?:\\.\\d+)?|${Object.keys(WORD_NUMBERS).join("|")})\\s*(${UNITS})\\b\\s*(?:of\\s+)?`, "i"));
  if (qty?.[1] && qty[2]) {
    const n = WORD_NUMBERS[qty[1].toLowerCase()] ?? qty[1];
    quantity = `${n} ${qty[2].toLowerCase()}`;
    product = product.slice(qty[0].length);
  } else {
    const plain = product.match(/^(\d+)\s+(?!of\b)/);
    if (plain?.[1]) {
      quantity = plain[1];
      product = product.slice(plain[0].length);
    }
  }

  product = product
    .replace(/^(?:some|any|the|a|an)\s+/i, "")
    .replace(/\s+(?:today|yesterday|please|again)$/i, "")
    .replace(/[,;:]+$/, "")
    .trim();

  return {
    product: titleCase(product),
    ...(customer ? { customer } : {}),
    ...(quantity ? { quantity } : {}),
  };
}
