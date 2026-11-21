/** Keeps the last 10 digits of an Indian mobile number ("+91 98765 43210" → "9876543210"). */
export function normalizePhone(input: string) {
  const d = input.replace(/\D/g, '');
  return d.length > 10 ? d.slice(-10) : d;
}

export function validateName(name: string) {
  const n = name.trim();
  if (n.length < 2) return 'Please enter your full name.';
  if (n.length > 60) return 'Name is too long.';
  if (!/^[\p{L} .'-]+$/u.test(n)) return 'Name can only contain letters, spaces, dots and hyphens.';
  return '';
}

export function validatePhone(phone: string) {
  const d = normalizePhone(phone);
  if (!d) return 'Please enter your phone number.';
  if (!/^[6-9]\d{9}$/.test(d)) return 'Enter a valid 10-digit mobile number.';
  return '';
}

export function validateBirthday(d: Date | null) {
  if (!d) return 'Please choose your date of birth.';
  const now = new Date();
  if (d.getTime() > now.getTime()) return 'Date of birth can’t be in the future.';
  const age = (now.getTime() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (age < 5) return 'Please check your date of birth.';
  if (age > 110) return 'Please check your date of birth.';
  return '';
}

export function passwordChecks(pw: string) {
  return [
    { ok: pw.length >= 8, label: 'At least 8 characters' },
    { ok: /[A-Za-z]/.test(pw), label: 'Contains a letter' },
    { ok: /\d/.test(pw), label: 'Contains a number' },
  ];
}

export function ymd(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function prettyDate(d: Date | string | null | undefined) {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d.length === 10 ? `${d}T00:00:00` : d) : d;
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
