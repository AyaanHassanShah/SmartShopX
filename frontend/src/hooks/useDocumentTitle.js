import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Smart Shop X` : "Smart Shop X";
  }, [title]);
}
