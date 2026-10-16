import { useEffect } from "react";
import Icon from "./Icon";

const SHOE_SIZES = [
  ["35", "22.5", "8.9"],
  ["36", "23.0", "9.1"],
  ["37", "23.5", "9.3"],
  ["38", "24.0", "9.4"],
  ["39", "25.0", "9.8"],
  ["40", "25.5", "10.0"],
  ["41", "26.0", "10.2"],
  ["42", "27.0", "10.6"],
  ["43", "27.5", "10.8"],
  ["44", "28.0", "11.0"],
  ["45", "29.0", "11.4"],
];

const APPAREL_SIZES = [
  ["XS", "86–91", "34–36"],
  ["S", "91–97", "36–38"],
  ["M", "97–102", "38–40"],
  ["L", "102–107", "40–42"],
  ["XL", "107–112", "42–44"],
  ["XXL", "112–117", "44–46"],
];

export default function SizeGuide({ category, onClose }) {
  const isShoe = category?.toLowerCase().includes("shoe");
  const rows = isShoe ? SHOE_SIZES : APPAREL_SIZES;

  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop size-guide-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="size-guide card" role="dialog" aria-modal="true" aria-labelledby="size-guide-title">
        <div className="modal-head">
          <div>
            <span className="eyebrow">Find your fit</span>
            <h2 id="size-guide-title">Size guide</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close size guide"><Icon name="x" /></button>
        </div>
        <div className="size-guide-body">
          <p className="muted">Measure around the fullest part of your foot or chest. If you are between sizes, choose the larger size for a more relaxed fit.</p>
          <div className="size-table-wrap">
            <table className="size-table">
              <thead>
                <tr>
                  <th>{isShoe ? "EU size" : "Size"}</th>
                  <th>{isShoe ? "Foot length (cm)" : "Chest (cm)"}</th>
                  <th>{isShoe ? "Foot length (in)" : "Chest (in)"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => <tr key={row[0]}>{row.map((value) => <td key={value}>{value}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <p className="field-hint"><Icon name="info" size={14} /> Product measurements can vary slightly by style. Check the product description for fit notes.</p>
        </div>
      </section>
    </div>
  );
}
