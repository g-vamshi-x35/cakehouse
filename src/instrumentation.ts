// Runs once when the server process starts. Some networks have a broken or
// slow IPv6 route, which makes Node try IPv6 first, stall, and only fall
// back to IPv4 after the full connect timeout — surfacing as intermittent
// "fetch failed" / ConnectTimeoutError when talking to Supabase. Forcing
// IPv4 first avoids that stall entirely.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setDefaultResultOrder } = await import("node:dns");
    setDefaultResultOrder("ipv4first");
  }
}
