export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (phone.startsWith("+")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone.startsWith("+")) return phone;
  const country = phone.slice(0, 4);
  const rest = phone.slice(4);
  const parts = rest.match(/.{1,3}/g) ?? [rest];
  return `${country} ${parts.join(" ")}`;
}
