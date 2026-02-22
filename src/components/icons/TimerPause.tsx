import * as React from "react";
type Props = {
  className?: string;
};
const TimerPause = (props: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <g clipPath="url(#clip0_4418_3878)">
      <path
        d="M8.00977 5.46C9.20977 4.85 10.5598 4.5 11.9998 4.5C16.8298 4.5 20.7498 8.42 20.7498 13.25"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 22.0002C7.17 22.0002 3.25 18.0802 3.25 13.2502C3.25 11.2702 3.91 9.45023 5.01 7.99023"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8V13"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 2H15"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 17V21"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17V21"
        stroke="#010A04"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_3878">
        <rect width={24} height={24} fill="white" />
      </clipPath>
    </defs>
  </svg>
);
export default TimerPause;
