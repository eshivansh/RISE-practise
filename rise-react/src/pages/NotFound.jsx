import { Link } from "react-router-dom";
import "../styles/extra.css";

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or was moved.</p>
      <Link to="/" className="cta-primary">Back to Home</Link>
    </div>
  );
}
