import { useEffect, useState } from "react";
import API from "../services/api";

// Facets (categories / colours / sizes / price range) come from the database,
// so filters always reflect what is actually in the catalogue. Cached per session.
let cache = null;
let inflight = null;

export default function useFacets() {
  const [facets, setFacets] = useState(cache);

  useEffect(() => {
    if (cache) return;
    inflight ??= API.get("/products/filters").then(({ data }) => (cache = data)).finally(() => (inflight = null));
    inflight.then((d) => d && setFacets(d)).catch(() => {});
  }, []);

  return facets;
}

export const resetFacetsCache = () => { cache = null; };
