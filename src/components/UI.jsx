import { useEffect, useRef } from "react";
import { X, ExternalLink, Inbox } from "lucide-react";
export function Badge({ children }) {
  const text = children || "No Response";
  return (
    <span className={"badge " + text.toLowerCase().replaceAll(" ", "-")}>
      {text}
    </span>
  );
}
export const date = (value) =>
  value
    ? new Date(value.slice(0, 10) + "T12:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function External({ href, children }) {
  if (!href || !/^https?:\/\//i.test(href))
    return <span className="muted">—</span>;
  return (
    <a className="external" href={href} target="_blank" rel="noreferrer">
      {children}
      <ExternalLink size={13} />
    </a>
  );
}
export function Empty({
  text = "No records yet. Add your first one to get started.",
}) {
  return (
    <div className="empty">
      <Inbox size={30} />
      <p>{text}</p>
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Notice({ error, success }) {
  return error ? (
    <div className="notice error" role="alert">
      {error}
    </div>
  ) : success ? (
    <div className="notice success" role="status">
      {success}
    </div>
  ) : null;
}
export function PageHeader({
  eyebrow = "YOUR INTERNSHIP SEARCH",
  title,
  description,
  children,
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
