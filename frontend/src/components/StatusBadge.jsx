const MAP = {
  Pending: "badge-warn",
  Processing: "badge-info",
  Shipped: "badge-primary",
  Delivered: "badge-success",
  Cancelled: "badge-danger",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${MAP[status] || ""}`}>{status}</span>;
}

export const PaidBadge = ({ paid }) => (
  <span className={`badge ${paid ? "badge-success" : "badge-danger"}`}>{paid ? "Paid" : "Unpaid"}</span>
);
