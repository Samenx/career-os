import { Link } from "react-router-dom";
import { Pencil, Trash2, Check } from "lucide-react";
import { Badge, date, External, Empty, today } from "./UI";
import LinkedInStatus from "./LinkedInStatus";
const companyLink = (row) => (
  <Link
    className="company-link"
    to={"/companies/" + (row.company_id || row.id)}
  >
    {row.company_name || row.name}
  </Link>
);
const contactNames = (row, type) =>
  row.contacts
    ?.filter((c) => c.contact_type === type)
    .map((c) => c.name)
    .join(", ") || "—";
const columns = {
  companies: [
    ["Company", companyLink],
    [
      "Description",
      (r) => (
        <span className="truncate" title={r.description}>
          {r.description || "—"}
        </span>
      ),
    ],
    ["Category", (r) => r.category || "—"],
    ["Website", (r) => <External href={r.website}>Visit Website</External>],
    [
      "Email",
      (r) =>
        r.general_email ? (
          <a href={"mailto:" + r.general_email}>{r.general_email}</a>
        ) : (
          "—"
        ),
    ],
    [
      "Application status",
      (r) => <Badge>{r.latest_status || r.application_status}</Badge>,
    ],
    ["Response", (r) => <Badge>{r.response}</Badge>],
    ["LinkedIn application", (r) => <LinkedInStatus checked={r.applied_through_linkedin} />],
    ["CEO / Founder", (r) => contactNames(r, "CEO / Founder")],
    ["HR / Recruiter", (r) => contactNames(r, "HR / Recruiter")],
    ["Technical Lead", (r) => contactNames(r, "Technical Lead")],
  ],
  applications: [
    ["Company", companyLink],
    ["Position", (r) => r.position || "—"],
    ["Application date", (r) => date(r.application_date)],
    ["Method", (r) => r.application_method || "—"],
    ["Applied through LinkedIn", (r) => r.applied_through_linkedin ? "Yes" : "No"],
    ["Status", (r) => <Badge>{r.status}</Badge>],
    ["Response", (r) => <Badge>{r.response}</Badge>],
    ["Follow up date", (r) => date(r.follow_up_date)],
  ],
  contacts: [
    ["Name", (r) => <strong>{r.name}</strong>],
    ["Company", companyLink],
    ["Job title", (r) => r.job_title || "—"],
    ["Type", (r) => <Badge>{r.contact_type}</Badge>],
    [
      "Email",
      (r) => (r.email ? <a href={"mailto:" + r.email}>{r.email}</a> : "—"),
    ],
    [
      "LinkedIn",
      (r) => <External href={r.linkedin_url}>View LinkedIn</External>,
    ],
    ["Phone", (r) => r.phone || "—"],
  ],
  "follow-ups": [
    ["Company", companyLink],
    ["Application", (r) => r.application_position || "—"],
    ["Contact", (r) => r.contact_name || "—"],
    [
      "Follow up date",
      (r) => (
        <>
          {date(r.follow_up_date)}
          {r.status === "Pending" && r.follow_up_date < today() && (
            <small className="overdue-label">Overdue</small>
          )}
        </>
      ),
    ],
    ["Status", (r) => <Badge>{r.status}</Badge>],
    [
      "Notes",
      (r) => (
        <span className="truncate" title={r.notes}>
          {r.notes || "—"}
        </span>
      ),
    ],
  ],
};
export default function RecordTable({
  type,
  rows,
  onEdit,
  onDelete,
  onComplete,
}) {
  if (!rows.length) return <Empty />;
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columns[type].map(([label]) => (
              <th key={label}>{label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={
                type === "follow-ups" &&
                row.status === "Pending" &&
                row.follow_up_date < today()
                  ? "overdue"
                  : ""
              }
            >
              {columns[type].map(([label, render]) => (
                <td key={label}>{render(row)}</td>
              ))}
              <td>
                <div className="row-actions">
                  {type === "follow-ups" && row.status === "Pending" && (
                    <button
                      title="Mark completed"
                      aria-label="Mark completed"
                      className="icon-button"
                      onClick={() => onComplete(row)}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    title="Edit"
                    aria-label="Edit record"
                    className="icon-button"
                    onClick={() => onEdit(row)}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    title="Delete"
                    aria-label="Delete record"
                    className="icon-button danger"
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
