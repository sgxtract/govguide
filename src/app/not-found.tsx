import { StandalonePage } from "@/components/layout/standalone-page";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/components/ui/link";

export default function NotFound() {
  return (
    <StandalonePage title="Page not found">
      <p className="text-lg">
        This page doesn&apos;t exist, or the guide may have moved.
      </p>
      <p>
        <Link href="/" className={buttonClass("primary")}>
          Go to all guides
        </Link>
      </p>
    </StandalonePage>
  );
}
