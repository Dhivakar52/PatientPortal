import { useState } from "react";
import {
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  Copy,
  Home,
  LifeBuoy,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface FallbackProps {
  error: unknown;
  resetErrorBoundary: (...args: unknown[]) => void;
}

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  let errorMessage = "An unexpected error occurred while loading this page.";

  if (isError(error)) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error) {
    errorMessage = String(error.message);
  }

  const timestamp = new Date().toLocaleString();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${errorMessage}\nTimestamp: ${timestamp}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors and keep the fallback accessible.
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.assign("/");
  };

  return (
    <div className="flex  items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <Card className="border-border/70 bg-card shadow-[0_20px_70px_-24px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_-20px_rgba(15,23,42,0.4)]">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="destructive" className="rounded-full px-3 py-1 text-[11px] font-medium">
                ERR-500
              </Badge>
              <span className="text-xs text-muted-foreground">{timestamp}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                  Something went wrong
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-muted-foreground">
                  We encountered an unexpected error while loading this page. Please try again.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Technical Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-2">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy Error"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails((value) => !value)}
                    className="h-8 gap-2"
                  >
                    {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {showDetails ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>

              {showDetails ? (
                <>
                  <Separator className="my-3" />
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap wrap-break-word rounded-xl border border-border/50 bg-background/80 p-3 font-mono text-xs leading-5 text-foreground">
                    {errorMessage}
                  </pre>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={resetErrorBoundary} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleRefresh} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-start gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LifeBuoy className="h-4 w-4" />
              Need help? Contact support.
            </div>
            <Button variant="ghost" className="gap-2 px-0 text-sm text-muted-foreground hover:text-foreground">
              <LifeBuoy className="h-4 w-4" />
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}