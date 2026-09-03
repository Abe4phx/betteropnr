import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLERK_FAPI = "https://clerk.betteropnr.com";
const FUNCTION_PREFIX = "/clerk-proxy";

const CORS = {
  "access-control-allow-origin": "capacitor://localhost",
  "access-control-allow-credentials": "true",
  "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "access-control-allow-headers":
    "Content-Type, Authorization, Clerk-Publishable-Key, clerk-publishable-key",
  "access-control-expose-headers": "Authorization, X-Country",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(req.url);
  const forwardPath = url.pathname.replace(FUNCTION_PREFIX, "") || "/";
  const target = `${CLERK_FAPI}${forwardPath}${url.search}`;

  console.log("[proxy] →", req.method, forwardPath);
  console.log("[proxy] target:", target);
  console.log(
    "[proxy] cookie header:",
    req.headers.get("cookie") ?? "(none)",
  );
  console.log(
    "[proxy] authorization header:",
    req.headers.get("authorization")
      ? `present (${req.headers.get("authorization")!.slice(0, 40)}...)`
      : "(none)",
  );
  if (req.method !== "GET" && req.method !== "HEAD") {
    console.log("[proxy] has body:", req.body !== null);
  }

  const headers = new Headers();
  for (const [k, v] of req.headers.entries()) {
    const lower = k.toLowerCase();
    if (lower === "origin" || lower === "host" || lower === "referer") continue;
    headers.set(k, v);
  }

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
  });

  console.log(
    "[proxy] response authorization:",
    upstream.headers.get("authorization")
      ? `present (${upstream.headers.get("authorization")?.slice(0, 40)}...)`
      : "(none)",
  );
  const setCookie = upstream.headers.get("set-cookie");
  console.log(
    "[proxy] response set-cookie:",
    setCookie ? setCookie.substring(0, 300) : "(none)",
  );
  const hasCookie = upstream.headers.has("set-cookie");
  console.log("[proxy] ← status:", upstream.status, "| set-cookie:", hasCookie);

  const responseHeaders = new Headers(upstream.headers);
  for (const [k, v] of Object.entries(CORS)) responseHeaders.set(k, v);

  if (upstream.status >= 400) {
    const bodyText = await upstream.text();
    console.log("[proxy] ← error body:", bodyText);
    return new Response(bodyText, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
});
