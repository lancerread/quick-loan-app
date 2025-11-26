import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold" data-testid="text-404">404</h1>
        <p className="mb-4 text-xl text-muted-foreground" data-testid="text-not-found">Oops! Page not found</p>
        <Link href="/" className="text-primary underline hover:text-primary/90" data-testid="link-home">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
