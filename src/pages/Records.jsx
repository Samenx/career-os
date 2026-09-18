import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CompanyCards from "../components/CompanyCards";
import { Plus, Search, Upload, Download } from "lucide-react";
import api, { errorMessage } from "../services/api";
import RecordForm, {
  contactTypes,
  companyStatuses,
  applicationStatuses,
} from "../components/RecordForm";
import RecordTable from "../components/RecordTable";
import { Modal, Notice, PageHeader } from "../components/UI";
const labels = {
  companies: [
    "Companies",
    "company",
    "Build a shortlist. Find your next opportunity.",
  ],
  applications: [
    "Applications",
    "application",
    "Every application, from first click to offer.",
  ],
  contacts: [
    "Contacts",
    "contact",
    "Good connections start with a little organization.",
  ],
  "follow-ups": [
    "Follow Ups",
    "follow up",
    "Keep the conversation moving forward.",
  ],
};
export default function Records({
  type,
  companyId,
  embedded = false,
  view = "table",
}) {
  const [rows, setRows] = useState([]),
    [companies, setCompanies] = useState([]),
    [contacts, setContacts] = useState([]),
    [applications, setApplications] = useState([]);
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [category, setCategory] = useState(""),
    [response, setResponse] = useState(""),
    [sort, setSort] = useState("name"),
    [direction, setDirection] = useState("asc"),
    [contactType, setContactType] = useState("");
  const [editing, setEditing] = useState(null),
    [importing, setImporting] = useState(false),
    [file, setFile] = useState(null),
    [dateOrder, setDateOrder] = useState("DMY"),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [version, setVersion] = useState(0);
  const [title, singular, description] = labels[type];
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const [records, cs, cts, apps] = await Promise.all([
          api.get("/" + type, {
            params: {
              search,
              status,
              category,
              response,
              sort,
              direction,
              type: contactType,
              company_id: companyId,
            },
          }),
          api.get("/companies"),
          type === "follow-ups"
            ? api.get("/contacts")
            : Promise.resolve({ data: [] }),
          type === "follow-ups"
            ? api.get("/applications")
            : Promise.resolve({ data: [] }),
        ]);
        if (active) {
          setRows(records.data);
          setCompanies(cs.data);
          setContacts(cts.data);
          setApplications(apps.data);
        }
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    type,
    search,
    status,
    category,
    response,
    sort,
    direction,
    contactType,
    companyId,
    version,
  ]);
  function saved() {
    setEditing(null);
    setSuccess(
      `${singular[0].toUpperCase() + singular.slice(1)} ${editing?.id ? "updated" : "added"} successfully.`,
    );
    setVersion((v) => v + 1);
  }
  async function remove(row) {
    if (
      !window.confirm(
        `Delete this ${singular}?${type === "companies" ? " Its applications, contacts, notes, and follow-ups will also be deleted." : ""}`,
      )
    )
      return;
    try {
      await api.delete(`/${type}/${row.id}`);
      setSuccess(
        `${singular[0].toUpperCase() + singular.slice(1)} deleted successfully.`,
      );
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  async function complete(row) {
    try {
      await api.patch(`/follow-ups/${row.id}/complete`);
      setSuccess("Follow up completed.");
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }
  async function upload(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("date_order", dateOrder);
      const { data } = await api.post("/companies/import", body);
      setResult(data);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  const actions = (
    <>
      {type === "companies" && (
        <button
          className="button secondary"
          onClick={() => {
            setImporting(true);
            setResult(null);
            setFile(null);
          }}
        >
          <Upload size={16} />
          Import CSV
        </button>
      )}
      <button className="button" onClick={() => setEditing({})}>
        <Plus size={17} />
        Add {singular}
      </button>
    </>
  );
  return (
    <>
      {embedded ? (
        <div className="section-heading">
          <h2>{title}</h2>
          {actions}
        </div>
      ) : (
        <PageHeader
          title={view === "cards" ? "Company Cards" : title}
          description={description}
        >
          {actions}
        </PageHeader>
      )}
      {type === "companies" && (
        <div className="view-tabs" aria-label="Company view">
          <Link className={view === "table" ? "active" : ""} to="/companies">
            Table view
          </Link>
          <Link
            className={view === "cards" ? "active" : ""}
            to="/company-cards"
          >
            Card view
          </Link>
        </div>
      )}
      <Notice error={error} success={success} />
      <section className="panel">
        <div className="toolbar">
          <label className="search">
            <Search size={17} />
            <input
              aria-label="Search records"
              placeholder={
                type === "contacts"
                  ? "Search name or company…"
                  : "Search companies…"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          {type === "companies" && (
            <>
              <select
                aria-label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {[...new Set(companies.map((c) => c.category).filter(Boolean))]
                  .sort()
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
              <select
                aria-label="Response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              >
                <option value="">All responses</option>
                <option>Responded</option>
                <option>No Response</option>
              </select>
              <select
                aria-label="Sort by"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="name">Company name</option>
                <option value="application_date">Application date</option>
              </select>
              <select
                aria-label="Sort direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </>
          )}
          {type === "contacts" ? (
            <select
              aria-label="Contact type"
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              <option value="">All types</option>
              {contactTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          ) : (
            <select
              aria-label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {(type === "companies"
                ? companyStatuses
                : type === "applications"
                  ? applicationStatuses
                  : ["Pending", "Completed", "Cancelled"]
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
        <div className="table-meta">
          {loading ? "Loading…" : `${rows.length} ${title.toLowerCase()}`}
        </div>
        {loading ? (
          <div className="empty">Loading records…</div>
        ) : view === "cards" ? (
          <CompanyCards rows={rows} onEdit={setEditing} onDelete={remove} />
        ) : (
          <RecordTable
            type={type}
            rows={rows}
            onEdit={setEditing}
            onDelete={remove}
            onComplete={complete}
          />
        )}
      </section>
      {editing && (
        <Modal
          title={`${editing.id ? "Edit" : "Add"} ${singular}`}
          onClose={() => setEditing(null)}
        >
          <RecordForm
            type={type}
            record={editing}
            companies={companies}
            contacts={contacts}
            applications={applications}
            companyId={companyId}
            onSaved={saved}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
      {importing && (
        <Modal
          title="Import your company list"
          onClose={() => !busy && setImporting(false)}
        >
          <form onSubmit={upload} className="import-form">
            <p>
              Upload a CSV exported from your spreadsheet (up to 5 MB). Existing
              company names are updated without duplicating contacts or imported
              applications.
            </p>
            <p className="muted">
              Company or Company Name is the only required column. Comma,
              semicolon, and tab-separated files are supported. Each contact
              cell becomes one contact; add additional people from the Contacts
              tab.
            </p>
            <a className="external" href="/import-template.csv" download>
              <Download size={16} />
              Download CSV template
            </a>
            <label className="import-date-order">
              Date format in your spreadsheet
              <select
                value={dateOrder}
                onChange={(e) => setDateOrder(e.target.value)}
              >
                <option value="DMY">Day / Month / Year (31/12/2026)</option>
                <option value="MDY">Month / Day / Year (12/31/2026)</option>
              </select>
              <small>YYYY-MM-DD also works with either setting.</small>
            </label>
            <label className="upload-zone">
              <Upload size={26} />
              <span>Select your CSV file</span>
              <input
                type="file"
                accept=".csv,text/csv"
                required
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>
            <Notice error={error} />
            {result && (
              <div className="import-result" role="status">
                <strong>
                  {result.failed && !result.imported && !result.updated
                    ? "No companies imported — check the errors below"
                    : "Import complete"}
                </strong>
                <p>
                  Imported: {result.imported} · Updated: {result.updated} ·
                  Skipped: {result.skipped} · Failed: {result.failed}
                </p>
                {!!result.warnings?.length && (
                  <details>
                    <summary>
                      {result.warnings.length} optional fields saved in notes —
                      review warnings
                    </summary>
                    {result.warnings.map((warning, index) => (
                      <p key={index}>
                        Row {warning.row}: {warning.message}
                      </p>
                    ))}
                  </details>
                )}
                {result.errors.map((e) => (
                  <p key={e.row}>
                    Row {e.row}: {e.message}
                  </p>
                ))}
              </div>
            )}
            <div className="form-actions">
              <button className="button" disabled={busy || !file}>
                {busy ? "Importing…" : "Import companies"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
