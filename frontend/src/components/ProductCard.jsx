import { Link } from "react-router-dom";
import { imgSrc, money, colorHex } from "../utils/format";

const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14;
const isRecent = (d) => Date.now() - new Date(d).getTime() < TWO_WEEKS;

export default function ProductCard({ p }) {
  const out = p.countInStock < 1;
  const low = !out && p.countInStock <= 5;
  const isNew = isRecent(p.createdAt);

  return (
    <Link to={`/product/${p._id}`} className={`pcard${out ? " is-out" : ""}`}>
      <div className="pcard-img">
        <img src={imgSrc(p.image)} alt={p.name} loading="lazy" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
        <div className="pcard-tags">
          {out ? <span className="tag tag-dark">Sold out</span> : low ? <span className="tag tag-warn">Only {p.countInStock} left</span> : isNew ? <span className="tag tag-new">New</span> : null}
        </div>
      </div>
      <div className="pcard-body">
        <span className="pcard-cat">{p.category}</span>
        <h3 className="pcard-name">{p.name}</h3>
        <div className="pcard-foot">
          <span className="pcard-price money">{money(p.price)}</span>
          {p.colors?.length > 0 && (
            <span className="swatches" aria-label={`${p.colors.length} colours`}>
              {p.colors.slice(0, 4).map((c) => <i key={c} title={c} style={{ background: colorHex(c) }} />)}
              {p.colors.length > 4 && <em>+{p.colors.length - 4}</em>}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export const ProductCardSkeleton = () => (
  <div className="pcard pcard-skel">
    <div className="pcard-img skeleton" />
    <div className="pcard-body">
      <div className="skeleton" style={{ height: 12, width: "35%" }} />
      <div className="skeleton" style={{ height: 18, width: "80%" }} />
      <div className="skeleton" style={{ height: 18, width: "30%" }} />
    </div>
  </div>
);
