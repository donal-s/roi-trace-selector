import React from "react";

// Icon SVGs downloaded from https://fonts.google.com/icons?icon.style=Filled&icon.set=Material+Icons under Apache licence

export type IconProps = {
  id?: string;
  className?: string;
  onClick?: any;
};

export const CheckCircleIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

export const CheckCircleOutlineIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
    <path d="M16.59 7.58L10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
  </svg>
);

export const HelpIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

export const HelpOutlineIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
  </svg>
);

export const RemoveCircleIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z" />
  </svg>
);

export const RemoveCircleOutlineIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
  </svg>
);

export const FullscreenIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
  </svg>
);

export const FullscreenExitIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
  </svg>
);
