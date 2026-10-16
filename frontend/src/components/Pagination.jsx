import Icon from "./Icon";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
  const withGaps = nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? ["…" + n, n] : [n]));

  return (
    <nav className="pagination" aria-label="Pagination">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><Icon name="chevLeft" size={16} /></button>
      {withGaps.map((n) =>
        typeof n === "string" ? <span key={n} className="muted">…</span> : (
          <button key={n} className={n === page ? "active" : ""} onClick={() => onChange(n)} aria-current={n === page ? "page" : undefined}>{n}</button>
        )
      )}
      <button disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><Icon name="chevRight" size={16} /></button>
    </nav>
  );
}
