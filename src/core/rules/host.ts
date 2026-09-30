/** RFC 1035 style host check: dot-separated labels of letters, digits and inner hyphens, alphabetic TLD. */
export function hostProblem(host: string): string | null {
  if (host.length === 0) return "host is empty";
  if (host.length > 253) return "host is longer than 253 characters";
  const labels = host.split(".");
  if (labels.length < 2) return `host "${host}" has no top-level domain`;
  for (const label of labels) {
    if (label.length === 0) return `host "${host}" has an empty label`;
    if (label.length > 63) return `label "${label}" is longer than 63 characters`;
    if (!/^[a-z0-9-]+$/i.test(label)) return `label "${label}" has characters other than letters, digits and hyphens`;
    if (label.startsWith("-") || label.endsWith("-")) return `label "${label}" starts or ends with a hyphen`;
  }
  const tld = labels[labels.length - 1]!;
  if (!/^[a-z]{2,63}$/i.test(tld)) return `top-level domain "${tld}" must be 2 or more letters`;
  return null;
}
