"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof NextLink>, "href" | "prefetch"> & {
  href: string;
};

/** True unless the phone has Data Saver on (Chrome/Android report this). */
function dataSaverOff(): boolean {
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  return !connection?.saveData;
}

/**
 * The site's only link component. Next's default prefetches every link the
 * moment it scrolls into view, which spends prepaid data on pages nobody
 * opens. This prefetches on intent instead: when a finger touches the link,
 * a mouse hovers it, or the keyboard focuses it. Never with Data Saver on.
 */
export function Link({
  href,
  onPointerEnter,
  onTouchStart,
  onFocus,
  ...props
}: Props) {
  const router = useRouter();
  const prefetch = () => {
    if (dataSaverOff()) router.prefetch(href);
  };

  return (
    <NextLink
      href={href}
      prefetch={false}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        prefetch();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        prefetch();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        prefetch();
      }}
      {...props}
    />
  );
}
