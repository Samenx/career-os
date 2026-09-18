import { SquareCheck, Square } from "lucide-react";

export default function LinkedInStatus({ checked }) {
  const Icon = checked ? SquareCheck : Square;
  return (
    <span
      className={`linkedin-status ${checked ? "is-checked" : ""}`}
      title="Update this status in Edit company."
    >
      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      <span className="linkedin-status-label">Applied through LinkedIn</span>
      <strong className="linkedin-status-value">{checked ? "Yes" : "No"}</strong>
    </span>
  );
}
