"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto flex justify-between">
        <Link href="/" className="font-bold">MyApp</Link>
        <div className="space-x-4">
          {session?.user ? (
            <>
              <button
                onClick={() => signOut()}
                className="text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
              <Link href="/register" className="text-green-600 hover:underline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}