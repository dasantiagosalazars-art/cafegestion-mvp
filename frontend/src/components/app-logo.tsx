import type { SVGProps } from "react";

/** Logo de CafeGestión: grano de café. */
export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2c4.6 0 8 4.1 8 9.2 0 5.6-3.4 10.8-8 10.8s-8-5.2-8-10.8C4 6.1 7.4 2 12 2Z" />
      <path d="M12 2.5c-2.4 3.4 2.4 6.2 0 9.6s2.4 6.2 0 9.4" />
    </svg>
  );
}
