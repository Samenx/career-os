import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  Pencil,
  Trash2,
  ArrowUpRight,
  Mail,
} from "lucide-react";
import { Badge, External, Empty, date } from "./UI";
export default function CompanyCards({ rows, onEdit, onDelete }) {
  if (!rows.length)
    return (
      <Empty text="No matching companies. Try another filter or add a company." />
    );
  return (
    <div className="company-card-grid">
      {rows.map((company) => (
        <article className="company-card" key={company.id}>
          <div className="company-card-top">
            <div className="company-avatar">
              {company.name[0].toUpperCase()}
            </div>
            <div className="row-actions">
              <button
                className="icon-button"
                aria-label={"Edit " + company.name}
                onClick={() => onEdit(company)}
              >
                <Pencil size={16} />
              </button>
              <button
                className="icon-button danger"
                aria-label={"Delete " + company.name}
                onClick={() => onDelete(company)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <span className="eyebrow">{company.category || "COMPANY"}</span>
          <h2>
            <Link to={"/companies/" + company.id}>{company.name}</Link>
          </h2>
          <p className="company-card-description">
            {company.description ||
              "No description yet. Add what you know about this company."}
          </p>
          <div className="company-card-badges">
            <Badge>{company.latest_status || company.application_status}</Badge>
            <Badge>{company.response}</Badge>
          </div>
          <div className="company-card-meta">
            {company.location && (
              <span>
                <MapPin size={14} />
                {company.location}
              </span>
            )}
            <span>
              <Users size={14} />
              {company.contacts?.length || 0} contacts ·{" "}
              {company.application_count || 0} applications
            </span>
            {company.general_email && (
              <a href={"mailto:" + company.general_email}>
                <Mail size={14} />
                {company.general_email}
              </a>
            )}
            {(company.latest_application_date || company.application_date) && (
              <small>
                Applied{" "}
                {date(
                  company.latest_application_date || company.application_date,
                )}
              </small>
            )}
          </div>
          <div className="company-card-links">
            {company.website && (
              <External href={company.website}>Visit Website</External>
            )}
            {company.linkedin_url && (
              <External href={company.linkedin_url}>View LinkedIn</External>
            )}
          </div>
          <Link className="company-card-open" to={"/companies/" + company.id}>
            Open company
            <ArrowUpRight size={16} />
          </Link>
        </article>
      ))}
    </div>
  );
}
