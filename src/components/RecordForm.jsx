import { useState } from "react";
import { Notice } from "./UI";
import api, { errorMessage } from "../services/api";
export const companyStatuses = [
  "Not Applied",
  "Applied",
  "Interview",
  "Accepted",
  "Rejected",
];
export const responses = [
  "No Response",
  "Responded",
  "Interview",
  "Rejected",
  "Accepted",
];
export const contactTypes = [
  "CEO / Founder",
  "HR / Recruiter",
  "Technical Lead",
  "Employee",
  "Other",
];
export const applicationStatuses = [
  "Applied",
  "Under Review",
  "Interview",
  "Technical Interview",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
];
const f = (name, label, type = "text", options) => ({
  name,
  label,
  type,
  options,
});
export const fields = {
  companies: [
    f("name", "Company name *"),
    f("description", "What they do", "textarea"),
    f("category", "Category"),
    f("website", "Website", "url"),
    f("linkedin_url", "LinkedIn company URL", "url"),
    f("directory_profile_url", "Directory profile URL", "url"),
    f("general_email", "General email", "email"),
    f("careers_email", "Careers email", "email"),
    f("phone", "Phone"),
    f("location", "Location"),
    f("application_status", "Application status", "select", companyStatuses),
    f("application_date", "Application date", "date"),
    f("applied_through_linkedin", "Applied through LinkedIn", "checkbox"),
    f("response", "Response", "select", responses),
    f("follow_up_sent", "Follow-up email sent", "checkbox"),
    f("follow_up_date", "Follow up date", "date"),
    f("notes", "Notes", "textarea"),
  ],
  contacts: [
    f("company_id", "Company *", "company"),
    f("name", "Name *"),
    f("job_title", "Job title"),
    f("contact_type", "Contact type", "select", contactTypes),
    f("email", "Email", "email"),
    f("linkedin_url", "LinkedIn URL", "url"),
    f("phone", "Phone"),
    f("notes", "Notes", "textarea"),
  ],
  applications: [
    f("company_id", "Company *", "company"),
    f("position", "Position"),
    f("application_date", "Application date", "date"),
    f("application_method", "Application method", "select", [
      "Email",
      "LinkedIn",
      "Company Website",
      "Referral",
      "Other",
    ]),
    f("applied_through_linkedin", "Applied through LinkedIn", "checkbox"),
    f("status", "Status", "select", applicationStatuses),
    f("response", "Response", "select", responses),
    f("follow_up_date", "Follow up date", "date"),
    f("notes", "Notes", "textarea"),
  ],
  "follow-ups": [
    f("company_id", "Company *", "company"),
    f("application_id", "Application (optional)", "application"),
    f("contact_id", "Contact (optional)", "contact"),
    f("follow_up_date", "Follow up date *", "date"),
    f("status", "Status", "select", ["Pending", "Completed", "Cancelled"]),
    f("notes", "Notes", "textarea"),
  ],
};
const defaults = {
  companies: {
    applied_through_linkedin: false,
    application_status: "Not Applied",
    response: "No Response",
    follow_up_sent: false,
  },
  contacts: { contact_type: "Other" },
  applications: {
    status: "Applied",
    application_method: "",
    applied_through_linkedin: false,
    response: "No Response",
  },
  "follow-ups": { status: "Pending" },
};
export default function RecordForm({
  type,
  record,
  companies = [],
  applications = [],
  contacts = [],
  companyId,
  onSaved,
  onCancel,
}) {
  const [values, setValues] = useState({
    ...defaults[type],
    ...record,
    ...(companyId ? { company_id: companyId } : {}),
  });
  const [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  function change(name, value) {
    setValues((old) => ({
      ...old,
      [name]: value,
      ...(name === "company_id" ? { application_id: "", contact_id: "" } : {}),
    }));
  }
  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = Object.fromEntries(
        fields[type].map((field) => [field.name, values[field.name] ?? ""]),
      );
      if (record?.id) await api.put(`/${type}/${record.id}`, body);
      else await api.post("/" + type, body);
      onSaved();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <Notice error={error} />
        <p className="form-help span-two">
          Fill in only what you know. Fields marked * are required; everything
          else can stay blank.
        </p>
        {fields[type].map((field) => {
          const { name, label, type: inputType } = field;
          const value = values[name] ?? "";
          let options = field.options?.map((v) => ({ id: v, name: v }));
          if (inputType === "company") options = companies;
          if (inputType === "application")
            options = applications
              .filter((a) => String(a.company_id) === String(values.company_id))
              .map((a) => ({
                id: a.id,
                name: a.position || "Untitled application",
              }));
          if (inputType === "contact")
            options = contacts.filter(
              (c) => String(c.company_id) === String(values.company_id),
            );
          if (
            inputType === "select" &&
            value &&
            !options.some((o) => o.id === value)
          )
            options = [...options, { id: value, name: value }];
          return (
            <label
              key={name}
              className={inputType === "textarea" ? "span-two" : ""}
            >
              <span>{label}</span>
              {options ? (
                <select
                  value={value}
                  required={label.includes("*")}
                  disabled={name === "company_id" && !!companyId}
                  onChange={(e) => change(name, e.target.value)}
                >
                  <option value="">
                    {label.includes("*")
                      ? "Select…"
                      : "Leave blank / use default"}
                  </option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : inputType === "textarea" ? (
                <textarea
                  rows="3"
                  value={value}
                  onChange={(e) => change(name, e.target.value)}
                />
              ) : (
                <input
                  type={inputType === "url" ? "text" : inputType}
                  placeholder={
                    inputType === "url" ? "example.com (optional)" : undefined
                  }
                  value={inputType === "checkbox" ? undefined : value}
                  checked={inputType === "checkbox" ? !!value : undefined}
                  required={label.includes("*")}
                  maxLength={
                    inputType === "text"
                      ? name === "category" || name === "phone"
                        ? 100
                        : 255
                      : undefined
                  }
                  onChange={(e) =>
                    change(
                      name,
                      inputType === "checkbox"
                        ? e.target.checked
                        : e.target.value,
                    )
                  }
                />
              )}
            </label>
          );
        })}
      </div>
      <div className="form-actions">
        <button
          type="button"
          className="button secondary"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button className="button" disabled={saving}>
          {saving
            ? "Saving…"
            : "Save " +
              (type === "companies"
                ? "company"
                : type === "applications"
                  ? "application"
                  : type === "contacts"
                    ? "contact"
                    : "follow up")}
        </button>
      </div>
    </form>
  );
}
