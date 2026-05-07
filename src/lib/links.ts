export function getDeliveryLink(id: string, origin?: string) {
  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return `${baseOrigin}/d/${id}`;
}
