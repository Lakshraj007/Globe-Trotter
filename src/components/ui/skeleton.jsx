import React from "react";
import "./skeleton.css";

const Skeleton = ({
  width = "100%",
  height = "16px",
  variant = "text",
  animation = "pulse",
  className = "",
  style = {},
  ...props
}) => {
  const skeletonStyle = {
    width,
    height,
    ...style,
  };

  return (
    <span
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={skeletonStyle}
      aria-hidden="true"
      {...props}
    />
  );
};

export default Skeleton;