export function FormError({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-sm font-medium text-[#dc2626]">{children}</p>;
}
