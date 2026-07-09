import React, { useEffect, useState } from "react";
import {
  getBusinessVerticalFallbackSrc,
  resolveBusinessVerticalImageSrc,
} from "../lib/businessVerticalUtils";

const BusinessVerticalImage = ({
  vertical,
  alt,
  className,
  imageClassName,
}) => {
  const initialSrc = resolveBusinessVerticalImageSrc(vertical);
  const [src, setSrc] = useState(initialSrc);

  useEffect(() => {
    setSrc(resolveBusinessVerticalImageSrc(vertical));
  }, [vertical?.imageUrl, vertical?.image, vertical?.imageKey]);

  const fallbackSrc = getBusinessVerticalFallbackSrc(vertical);
  const displaySrc = src || fallbackSrc;

  const handleError = () => {
    if (src !== fallbackSrc) {
      setSrc(fallbackSrc);
    }
  };

  return (
    <div className={className}>
      <img
        className={imageClassName}
        src={displaySrc}
        alt={alt}
        onError={handleError}
      />
    </div>
  );
};

export default BusinessVerticalImage;
