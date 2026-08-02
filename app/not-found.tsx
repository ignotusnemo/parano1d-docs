import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404 / DOCUMENT NOT FOUND</span>
      <h1>The requested page is not in this documentation set.</h1>
      <p>
        The path may have changed, or the document may only exist in a newer
        source snapshot.
      </p>
      <Link href="/">Return to the documentation index</Link>
    </main>
  );
}
