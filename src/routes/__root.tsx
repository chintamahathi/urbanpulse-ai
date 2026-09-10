import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "@/state/store";
import AppShell from "@/components/shell/AppShell";
import { ThemeProvider } from "@/theme/ThemeProvider";

const themeInitScript = `(function(){try{var t=localStorage.getItem('urbansense-theme');if(t!=='light'&&t!=='dark'&&t!=='system')t='dark';var r=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;var e=document.documentElement;e.classList.remove('dark','light');e.classList.add(r);e.dataset.theme=r;e.style.colorScheme=r}catch(e){document.documentElement.classList.add('dark')}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="metric text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold uppercase">Sector not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This command-center view does not exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-primary-foreground uppercase transition-colors hover:bg-primary/90"
          >
            Return to command center
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight uppercase">This view didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A telemetry panel failed to initialise. Retry or return to the command center.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-primary-foreground uppercase"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-input bg-background px-4 py-2 font-mono text-[11px] tracking-[0.14em] uppercase"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "UrbanSense AI — Urban Intelligence Command Center" },
      {
        name: "description",
        content:
          "UrbanSense AI turns public transport buses into mobile urban sensing units and visualises city-scale road, traffic and safety intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <AppShell>
            {/* Required: nested routes render here. */}
            <Outlet />
          </AppShell>
        </StoreProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
