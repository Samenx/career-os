import { useEffect, useState } from "react";
import { trackingStatus } from "../services/tracking";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Send,
  Clock,
  MessageSquare,
  CalendarDays,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Plus,
  BriefcaseBusiness,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import {
  Badge,
  date,
  PageHeader,
  Notice,
  Empty,
  today,
} from "../components/UI";
const cards = [
  ["Total companies", "totalCompanies", Building2, "green", "/companies"],
  ["Applied", "applied", Send, "blue", "/companies?status=Applied"],
  ["Not applied", "notApplied", BriefcaseBusiness, "gray", "/companies?status=Not+Applied"],
  ["Follow-up emails needed", "companiesNeedingFollowUp", Clock, "orange", "/companies?follow_up=needed"],
  ["Responses received", "responsesReceived", MessageSquare, "purple", "/companies?response=Responded"],
  ["Interviews", "interviews", CalendarDays, "orange", "/companies?status=Interview"],
  ["Rejected", "rejected", XCircle, "red", "/companies?status=Rejected"],
  ["Accepted", "accepted", CheckCircle2, "green", "/companies?status=Accepted"],
];
export default function Dashboard() {
  const navigate = useNavigate();
  const rowLink = (path) => ({ tabIndex: 0, role: "link", className: "dashboard-row", onClick: () => navigate(path), onKeyDown: (e) => { if (e.target === e.currentTarget && e.key === "Enter") navigate(path); } });
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api
      .get("/dashboard")
      .then((r) => {
        if (active) setData(r.data);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <PageHeader
        title="A little progress, every day."
        description="Your next chapter starts with the opportunities you track today."
      >
        <Link className="button" to="/companies">
          <Plus size={17} />
          Manage companies
        </Link>
      </PageHeader>
      <Notice error={error} />
      <div className="dashboard-banner">
        <div>
          <span className="banner-tag">MAKE YOUR NEXT MOVE</span>
          <h2>
            Big opportunities.
            <br />
            One organized workspace.
          </h2>
          <p>Keep your companies, conversations, and next steps together.</p>
          <Link to="/applications">
            View your applications <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="orbit one" />
          <div className="orbit two" />
          <div className="art-card">
            <BriefcaseBusiness size={38} />
            <span>Your next chapter</span>
            <div className="art-lines" />
            <span className="art-check">
              <CheckCircle2 size={24} />
            </span>
          </div>
          <span className="spark">✦</span>
        </div>
      </div>
      <div className="section-heading">
        <h2>Your search at a glance</h2>
        <Link to="/applications" className="muted">
          {data
            ? `${data.totalApplications} applications tracked`
            : "Loading your overview…"}
        </Link>
      </div>
      <div className="stat-grid">
        {cards.map(([label, key, Icon, color, href]) => (
          <Link className="stat-card" key={key} to={href}>
            <span className={"stat-icon " + color}>
              <Icon size={19} />
            </span>
            <span className="stat-label">{label}</span>
            <strong>{data ? data[key] : "—"}</strong>
            <span>View companies <ArrowUpRight size={14} /></span>
          </Link>
        ))}
      </div>
      <div className="dashboard-tables">
        <section className="panel">
          <div className="section-heading panel-heading">
            <h2>Recent applications</h2>
            <Link to="/applications">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {data?.recentApplications.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((a) => (
                    <tr key={a.id} {...rowLink(`/companies/${a.company_id}?tab=Application`)}>
                      <td>
                        <Link
                          className="company-link"
                          to={"/companies/" + a.company_id + "?tab=Application"}
                        >
                          {a.company_name}
                        </Link>
                        <small>{a.position}</small>
                      </td>
                      <td>{date(a.application_date)}</td>
                      <td>
                        <Badge>{trackingStatus(a)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              text={
                data
                  ? "Your applications will appear here."
                  : "Loading applications…"
              }
            />
          )}
        </section>
        <section className="panel">
          <div className="section-heading panel-heading">
            <h2>Upcoming follow ups</h2>
            <Link to="/follow-ups">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          {data?.upcomingFollowUps.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Last contact</th>
                    <th>Follow up date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcomingFollowUps.map((f) => (
                    <tr key={f.id} {...rowLink(`/companies/${f.company_id}?tab=Follow+ups`)}>
                      <td>
                        <Link
                          className="company-link"
                          to={"/companies/" + f.company_id + "?tab=Follow+ups"}
                        >
                          {f.company_name}
                        </Link>
                      </td>
                      <td>{date(f.last_contact)}</td>
                      <td
                        className={
                          f.follow_up_date < today() ? "overdue-label" : ""
                        }
                      >
                        {date(f.follow_up_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              text={
                data
                  ? "All clear. Plan your next follow up when you’re ready."
                  : "Loading follow ups…"
              }
            />
          )}
        </section>
      </div>
      <p className="dashboard-footnote">
        Each outcome counts companies with a matching application or company
        status. Follow-up emails needed counts each applied company once until
        you check “Follow-up email sent” in Edit company or complete a follow-up.
        No scheduled follow-up date is required.
      </p>
    </>
  );
}
