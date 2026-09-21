// Present legacy response fields through one status control without deleting data.
export function trackingStatus(record, company = false) {
  const status = company ? record.latest_status || record.application_status : record.status;
  const response = company ? record.latest_status ? record.latest_response : record.response : record.response;
  if (["Not Applied", "Applied", "Under Review"].includes(status) || !status) {
    if (["Interview", "Accepted", "Rejected", "Responded"].includes(response)) return response;
  }
  return status || "Not Applied";
}
export function statusFields(status, company = false) {
  return {
    [company ? "application_status" : "status"]: status === "Responded" ? "Applied" : status,
    response: ["Interview", "Accepted", "Rejected", "Responded"].includes(status)
      ? status : ["Technical Interview", "Offer", "Under Review"].includes(status) ? "Responded" : "No Response",
  };
}
