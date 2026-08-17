import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="btn-cta">Back to Home</Link>
    </div>
  );
}
