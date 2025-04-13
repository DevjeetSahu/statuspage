import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAuthToken, clearAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = getAuthToken();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  const navLink = (to: string, label: string, onClick?: () => void) => (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary block py-2 md:py-0",
        pathname === to
          ? "text-primary underline underline-offset-4"
          : "text-muted-foreground"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo & Links */}
        <div className="flex items-center gap-6">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLink("/", "Status Page")}
            {token && (
              <>
                {navLink("/dashboard", "Dashboard")}
                {navLink("/incidents", "Incidents")}
              </>
            )}
          </div>
        </div>

        {/* Right: Auth Actions */}
        <div className="hidden md:flex items-center gap-4">
          {token ? (
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="default" size="sm">
                  Signup
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 pb-4">
          <div className="flex flex-col gap-2">
            {navLink("/", "Status Page", () => setMenuOpen(false))}
            {token && (
              <>
                {navLink("/dashboard", "Dashboard", () => setMenuOpen(false))}
                {navLink("/incidents", "Incidents", () => setMenuOpen(false))}
              </>
            )}

            <div className="mt-2 flex flex-col gap-2">
              {token ? (
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      Signup
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
