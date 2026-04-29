"use client";

import { User } from "@/app/types";
import { useAuth } from "@/provider/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  user: User | null;
}

function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  //   const userMe = true;
  const navigation = [
    { name: "Home", href: "/", show: true },
    { name: "Dashboard", href: "/dashboard", show: true },
  ].filter((item) => item.show);

  const getNavItemClass = (href: string) => {
    let isActive = false;
    if (href === "/") {
      isActive = pathname === "/";
    } else if (href === "/dashboard") {
      isActive = pathname.startsWith(href);
    }

    return `px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <Link href="/" className="font-bold text-xl text-white">
            Team Access
          </Link>

          {/* NAVIGATION */}
          <nav className="flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={getNavItemClass(item.href)}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {" "}
                <span className="text-sm text-slate-300">
                  {user.name} {user.role}
                </span>
                <button
                  onClick={logout}
                  className="text-sm rounded hover:bg-red-700 transition-colors text-white bg-red-500 px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {" "}
                <Link
                  className="bg-blue-600 inline-block  mr-2 mt-3 px-4 py-2 text-white"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="bg-slate-600 inline-block mt-3 px-4 py-2 text-white"
                  href="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
