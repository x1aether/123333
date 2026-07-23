import Link from "next/link";
import { Glasses } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <Glasses className="w-16 h-16 text-luxury-gold mb-6" />
      <h1 className="heading-display mb-4">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist. Perhaps you&apos;d like to
        browse our premium eyewear collection instead.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
