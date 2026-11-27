import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Page not found
        </p>

        <h1 className="text-7xl font-bold tracking-tight sm:text-8xl">
          404
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <p className="mt-3 truncate rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          {location.pathname}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;