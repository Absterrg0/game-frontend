import * as React from "react";
const User = (props: any) => (
  <svg
    width={40}
    height={40}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_99_1654)">
      <rect width={40} height={40} rx={20} fill="#DDDDDD" fillOpacity={0.6} />
      <path
        d="M20 24C23.4518 24 26.25 21.2018 26.25 17.75C26.25 14.2982 23.4518 11.5 20 11.5C16.5482 11.5 13.75 14.2982 13.75 17.75C13.75 21.2018 16.5482 24 20 24Z"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30.7374 36.5C30.7374 31.6625 25.9249 27.75 19.9999 27.75C14.0749 27.75 9.26245 31.6625 9.26245 36.5"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <rect
      x={0.75}
      y={0.75}
      width={38.5}
      height={38.5}
      rx={19.25}
      stroke="#010A04"
      strokeWidth={1.5}
    />
    <defs>
      <clipPath id="clip0_99_1654">
        <rect width={40} height={40} rx={20} fill="white" />
      </clipPath>
    </defs>
  </svg>
);
export default User;
