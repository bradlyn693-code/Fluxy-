export function normalizePhone(phone: string): string | null {
  const raw = String(phone ?? "").replace(/\s+/g, "");
  if (!/^0?7\d{8}$/.test(raw)) return null;
  return `254${raw.startsWith("0") ? raw.slice(1) : raw}`;
}

export function buildPaymentRequest(phone: string, amount: number) {
  const phoneNumber = normalizePhone(phone);
  const numericAmount = Number(amount);
  if (!phoneNumber || !Number.isFinite(numericAmount) || numericAmount <= 0) return null;
  return {
    phone_number: phoneNumber,
    email: "customer@courtneytech.xyz",
    amount: numericAmount,
    api_ref: `fluxt-${Date.now()}`,
  };
}
