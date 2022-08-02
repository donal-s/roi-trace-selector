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

export const AddCircleIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
  </svg>
);

export const EditIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    viewBox="0 0 24 24"
    width="24px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
);

export const FileOpenIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enableBackground="new 0 0 24 24"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <g>
      <rect fill="none" height="24" width="24" />
    </g>
    <g>
      <path d="M15,22H6c-1.1,0-2-0.9-2-2V4c0-1.1,0.9-2,2-2h8l6,6v6h-2V9h-5V4H6v16h9V22z M19,21.66l0-2.24l2.95,2.95l1.41-1.41L20.41,18 h2.24v-2H17v5.66H19z" />
    </g>
  </svg>
);

export const SaveAsIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    enableBackground="new 0 0 24 24"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <g>
      <rect fill="none" height="24" width="24" />
    </g>
    <g>
      <path d="M21,12.4V7l-4-4H5C3.89,3,3,3.9,3,5v14c0,1.1,0.89,2,2,2h7.4l2-2H5V5h11.17L19,7.83v6.57L21,12.4z M15,15 c0,1.66-1.34,3-3,3s-3-1.34-3-3s1.34-3,3-3S15,13.34,15,15z M6,6h9v4H6V6z M19.99,16.25l1.77,1.77L16.77,23H15v-1.77L19.99,16.25z M23.25,16.51l-0.85,0.85l-1.77-1.77l0.85-0.85c0.2-0.2,0.51-0.2,0.71,0l1.06,1.06C23.45,16,23.45,16.32,23.25,16.51z" />
    </g>
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="35px"
    viewBox="0 0 24 24"
    width="35px"
    fill="#000000"
    {...props}
  >
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);
