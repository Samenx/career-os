import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import api, { errorMessage } from "../services/api";
import { Badge, date, External, Modal, Notice, Empty } from "../components/UI";
import RecordForm from "../components/RecordForm";
import { trackingStatus } from "../services/tracking";
import Records from "./Records";
import LinkedInStatus from "../components/LinkedInStatus";
export default function CompanyDetails() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "Overview";
  const setTab = (value) => setParams({ tab: value });
  const [company, setCompany] = useState(null),
    [notes, setNotes] = useState([]),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [editing, setEditing] = useState(false),
    [noteEditor, setNoteEditor] = useState(null),
    [noteText, setNoteText] = useState(""),
    [saving, setSaving] = useState(false),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    Promise.all([
      api.get("/companies/" + id),
      api.get(`/companies/${id}/notes`),
    ])
      .then(([c, n]) => {
        if (active) {
          setCompany(c.data);
          setNotes(n.data);
        }
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, [id, version]);
  async function saveNote(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (noteEditor.id)
        await api.put("/notes/" + noteEditor.id, { note: noteText });
      else await api.post(`/companies/${id}/notes`, { note: noteText });
      setNoteEditor(null);
      setSuccess("Note saved successfully.");
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  async function deleteNote(note) {
    if (!window.confirm("Delete this note?")) return;
    try {
      await api.delete("/notes/" + note.id);
      setSuccess("Note deleted successfully.");
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  if (!company)
    return (
      <>
        <Notice error={error} />
        {!error && <p>Loading company…</p>}
        <Link to="/companies">Back to companies</Link>
      </>
    );
  return (
    <>
      <Link className="back-link" to="/companies">
        <ArrowLeft size={16} />
        All companies
      </Link>
      <div className="company-header">
        <div className="company-avatar">
          {company.name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <span className="eyebrow">
            {company.category || "COMPANY PROFILE"}
          </span>
          <h1>{company.name}</h1>
          <p>
            {company.description ||
              "Add a description to get to know this company."}
          </p>
          <div className="company-links">
            <External href={company.website}>Visit Website</External>
            <External href={company.linkedin_url}>View LinkedIn</External>
          </div>
          <Badge>{trackingStatus(company, true)}</Badge>
          <Link className="back-link" to={`?tab=Follow+ups`}>
            {company.has_follow_up_sent ? "Follow-up sent" : "Follow-up tracking"}
          </Link>
          <LinkedInStatus checked={company.applied_through_linkedin} />
        </div>
        <button className="button secondary" onClick={() => setEditing(true)}>
          <Pencil size={15} />
          Edit company
        </button>
      </div>
      <Notice error={error} success={success} />
      <div className="tabs">
        {["Overview", "Application", "Follow ups", "Contacts", "Notes"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <section className="panel detail-panel">
          <h2>Company overview</h2>
          <dl className="detail-grid">
            {[
              ["Location", company.location],
              ["General email", company.general_email],
              ["Careers email", company.careers_email],
              ["Phone", company.phone],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "—"}</dd>
              </div>
            ))}
            <div>
              <dt>Directory profile</dt>
              <dd>
                <External href={company.directory_profile_url}>
                  View profile
                </External>
              </dd>
            </div>
          </dl>
        </section>
      )}
      {tab === "Application" && (
        <>
          {!company.application_count && <section className="panel detail-panel">
            <div className="section-heading">
              <h2>Application tracking</h2>
              <button className="text-button" onClick={() => setEditing(true)}>
                Edit tracking
              </button>
            </div>
            <p className="muted">
              Track your application here, or add individual positions below.
            </p>
            <dl className="detail-grid">
              <div>
                <dt>Status</dt>
                <dd>
                  <Badge>{trackingStatus(company, true)}</Badge>
                </dd>
              </div>
              <div>
                <dt>Application date</dt>
                <dd>{date(company.application_date)}</dd>
              </div>
            </dl>
          </section>}
          <Records type="applications" companyId={id} embedded onChanged={() => setVersion((v) => v + 1)} />
        </>
      )}
      {tab === "Follow ups" && (
        <>
          <section className="panel detail-panel">
            <h2>Follow-up summary</h2>
            <p>{company.has_follow_up_sent ? "Follow-up sent" : "No follow-up recorded as sent"}</p>
            {company.follow_up_sent && <p className="muted">Marked as sent in the company record. A send date was not recorded.</p>}
            {company.follow_up_date && <p>Company reminder: {date(company.follow_up_date)}</p>}
            {company.application_follow_up_date && <p>Application reminder: {date(company.application_follow_up_date)}</p>}
            <button className="text-button" onClick={() => setEditing(true)}>Edit follow-up tracking</button>
          </section>
          <Records type="follow-ups" companyId={id} embedded onChanged={() => setVersion((v) => v + 1)} />
        </>
      )}
      {tab === "Contacts" && (
        <Records type="contacts" companyId={id} embedded />
      )}
      {tab === "Notes" && (
        <>
          <div className="section-heading">
            <h2>Company notes</h2>
            <button
              className="button"
              onClick={() => {
                setNoteEditor({});
                setNoteText("");
              }}
            >
              <Plus size={16} />
              Add note
            </button>
          </div>
          {company.notes && (
            <article className="panel note">
              <h3>General / imported notes</h3>
              <p>{company.notes}</p>
              <button className="text-button" onClick={() => setEditing(true)}>
                Edit general notes
              </button>
            </article>
          )}
          {!notes.length && !company.notes && (
            <Empty text="Keep conversation details, research, and reminders here." />
          )}
          {notes.map((n) => (
            <article className="panel note" key={n.id}>
              <p>{n.note}</p>
              <div className="note-footer">
                <span>
                  Created {date(n.created_at)} · Updated {date(n.updated_at)}
                </span>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    aria-label="Edit note"
                    onClick={() => {
                      setNoteEditor(n);
                      setNoteText(n.note);
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label="Delete note"
                    onClick={() => deleteNote(n)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </>
      )}
      {editing && (
        <Modal title="Edit company" onClose={() => setEditing(false)}>
          <RecordForm
            type="companies"
            record={company}
            onCancel={() => setEditing(false)}
            onSaved={() => {
              setEditing(false);
              setSuccess("Company updated successfully.");
              setVersion((v) => v + 1);
            }}
          />
        </Modal>
      )}
      {noteEditor && (
        <Modal
          title={noteEditor.id ? "Edit note" : "Add note"}
          onClose={() => setNoteEditor(null)}
        >
          <form onSubmit={saveNote} className="note-form">
            <Notice error={error} />
            <label>
              Note
              <textarea
                required
                rows="7"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </label>
            <div className="form-actions">
              <button className="button" disabled={saving}>
                {saving ? "Saving…" : "Save note"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
