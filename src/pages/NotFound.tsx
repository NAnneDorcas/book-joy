import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="text-center max-w-md">

        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <h1 className="mb-4 text-4xl font-bold">
          404
        </h1>

        <p className="mb-2 text-xl text-muted-foreground">
          Page not found
        </p>

        <p className="mb-6 text-sm text-muted-foreground">
          The page <code>{location.pathname}</code> does not exist.
        </p>

        <Link
          to="/"
          className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          Return to Home
        </Link>

        {/* Required assignment footer */}
        <div className="mt-10 text-xs text-muted-foreground">
          Built in AI Web Session 2026, BookingAgent Pro,
          Student: Anne Dorcas Nguewouo,
          Team: TEAM_SLUG
        </div>

      </div>
    </div>
  );
};

export default NotFound;