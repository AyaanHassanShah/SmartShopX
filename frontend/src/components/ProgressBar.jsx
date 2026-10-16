import Icon from "./Icon";

const STEPS = [
  { key: "Pending", label: "Placed" },
  { key: "Processing", label: "Processing" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
];

export default function ProgressBar({ status }) {
  if (status === "Cancelled") {
    return <div className="alert alert-error" style={{ display: "flex", gap: 10, alignItems: "center" }}><Icon name="x" size={18} /> This order was cancelled.</div>;
  }
  const current = Math.max(STEPS.findIndex((s) => s.key === status), 0);

  return (
    <ol className="track" aria-label={`Order status: ${status}`}>
      {STEPS.map((s, i) => (
        <li key={s.key} className={i < current ? "done" : i === current ? "current" : ""}>
          <span className="dot">{i < current || (i === current && status === "Delivered") ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>
          <span className="lbl">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
