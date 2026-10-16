import Icon from "./Icon";

export default function EmptyState({ icon = "box", title, text, children }) {
  return (
    <div className="empty fade-in">
      <div className="e-ico"><Icon name={icon} size={32} /></div>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
