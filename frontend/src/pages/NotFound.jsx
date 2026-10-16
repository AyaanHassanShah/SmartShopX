import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import EmptyState from "../components/EmptyState";
import useDocumentTitle from "../hooks/useDocumentTitle";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <Layout>
      <EmptyState icon="search" title="404 - Page not found" text="The page you're looking for doesn't exist or has moved.">
        <Link to="/" className="btn btn-primary">Go home</Link>
      </EmptyState>
    </Layout>
  );
}
