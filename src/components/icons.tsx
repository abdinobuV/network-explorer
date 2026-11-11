import type { SVGProps } from "react";

/**
 * Ikon garis kustom — 24x24, stroke 1.5, `currentColor`.
 *
 * Digantikan seluruh emoji lama (🖥️ 🔀 🔌 🧑‍🚀 🔒 ☁ …) supaya tampilan
 * konsisten di semua OS dan bisa diwarnai lewat CSS.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------- Perangkat jaringan ---------- */

export const IconPc = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M8 20h8M12 16v4" />
  </Svg>
);

export const IconSwitch = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="8" width="18" height="8" rx="1.5" />
    <path d="M7 12h.01M11 12h.01M15 12h.01M19 12h.01" />
  </Svg>
);

export const IconRouter = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="13" width="19" height="6.5" rx="1.5" />
    <path d="M6 16.5h.01M10 16.5h.01M7.5 13V9m9 4V9M7.5 9a4.5 4.5 0 0 1 9 0" />
  </Svg>
);

export const IconPlug = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 3v5M15 3v5" />
    <path d="M6.5 8h11v3.5a5.5 5.5 0 0 1-5.5 5.5A5.5 5.5 0 0 1 6.5 11.5V8Z" />
    <path d="M12 17v4" />
  </Svg>
);

export const IconCable = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4v5a4 4 0 0 0 4 4h8a4 4 0 0 1 4 4v3" />
    <rect x="2" y="2" width="4" height="4" rx="1" />
    <rect x="18" y="18" width="4" height="4" rx="1" />
  </Svg>
);

export const IconBackbone = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 12h20" />
    <path d="M6 12v-5M12 12V5M18 12v-5" />
    <rect x="3.5" y="2" width="5" height="3" rx=".5" />
    <rect x="9.5" y="2" width="5" height="3" rx=".5" />
    <rect x="15.5" y="4" width="5" height="3" rx=".5" />
  </Svg>
);

export const IconRing = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.5" />
    <rect x="9.5" y="1.5" width="5" height="4" rx=".5" />
    <rect x="18" y="10" width="5" height="4" rx=".5" />
    <rect x="1" y="10" width="5" height="4" rx=".5" />
  </Svg>
);

/* ---------- Navigasi & dokumen ---------- */

export const IconBook = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15H5.5A1.5 1.5 0 0 0 4 19.5V4.5Z" />
    <path d="M4 19.5A1.5 1.5 0 0 1 5.5 18H19v3H5.5A1.5 1.5 0 0 1 4 19.5Z" />
  </Svg>
);

export const IconChart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18" />
    <path d="M6 21V11M11 21V5M16 21v-7M21 21v-4" />
  </Svg>
);

export const IconList = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </Svg>
);

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
);

export const IconGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="1" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1" />
  </Svg>
);

export const IconTarget = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
  </Svg>
);

/* ---------- Aksi & status ---------- */

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const IconCross = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.5h.01" />
  </Svg>
);

export const IconWarning = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.3 4.3 2.6 17.6A1.5 1.5 0 0 0 3.9 20h16.2a1.5 1.5 0 0 0 1.3-2.4L13.7 4.3a1.5 1.5 0 0 0-2.6 0Z" />
    <path d="M12 9v4.5M12 16.5h.01" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="10" width="15" height="10" rx="1.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Svg>
);

export const IconKey = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8" cy="12" r="4" />
    <path d="M12 12h9M18 12v3.5M15.5 12v2.5" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
    <path d="m3 6.5 9 6 9-6" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.75" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 5.5v5.8c0 4.3 2.9 7.6 7 9.2 4.1-1.6 7-4.9 7-9.2V5.5L12 3Z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5 5" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Svg>
);

export const IconChevron = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const IconArrow = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Svg>
);

export const IconPrint = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 9V3h10v6" />
    <rect x="3.5" y="9" width="17" height="8" rx="1.5" />
    <path d="M7 14h10v7H7z" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.5l3.5 2" />
  </Svg>
);

export const IconCloud = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 18.5A4.5 4.5 0 0 1 7.3 9.6a5.5 5.5 0 0 1 10.5 1.4A3.9 3.9 0 0 1 17.5 18.5H7Z" />
  </Svg>
);

export const IconVolume = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Svg>
);

export const IconVolumeOff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
    <path d="m16 10 4 4M20 10l-4 4" />
  </Svg>
);

export const IconTrophy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5v1.5A3 3 0 0 0 7 10.5M17 6h2.5v1.5A3 3 0 0 1 17 10.5" />
    <path d="M12 14v3.5M8.5 20.5h7M10 17.5h4v3h-4z" />
  </Svg>
);

export const IconStar = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z" />
  </Svg>
);

export const IconFlag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21V4M5 4h11l-2 3.5L16 11H5" />
  </Svg>
);

export const IconBug = (p: IconProps) => (
  <Svg {...p}>
    <rect x="7.5" y="7.5" width="9" height="12" rx="4.5" />
    <path d="M9 5.5a3 3 0 0 1 6 0M4 11h3.5M20 11h-3.5M4 17h3.5M20 17h-3.5M12 7.5v12" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10" />
    <path d="M15 8l4 4-4 4M19 12H9" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M4 19.5h16" />
  </Svg>
);

export const IconExternal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4 10 14" />
    <path d="M18 14v5.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19.5v-11A1.5 1.5 0 0 1 5.5 7H11" />
  </Svg>
);
