import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CUSTOMER_PREFIX = "/account";
const OWNER_PREFIX = "/dashboard/owner";
const EMPLOYEE_PREFIX = "/dashboard/employee";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith(CUSTOMER_PREFIX) ||
    pathname.startsWith(OWNER_PREFIX) ||
    pathname.startsWith(EMPLOYEE_PREFIX);

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase isn't configured yet — don't hard-lock the whole site out.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isProtected) return response;

  if (!user) {
    const loginPath = pathname.startsWith("/dashboard") ? "/staff/login" : "/login";
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname.startsWith(OWNER_PREFIX) || pathname.startsWith(EMPLOYEE_PREFIX)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    if (pathname.startsWith(OWNER_PREFIX) && role !== "owner") {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    if (pathname.startsWith(EMPLOYEE_PREFIX) && role !== "employee" && role !== "owner") {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/dashboard/:path*"],
};
