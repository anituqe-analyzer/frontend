import React, { useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface ImageMagnifierProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  zoomLevel?: number;
  magnifierSize?: number;
}

export function ImageMagnifier({
  src,
  className,
  zoomLevel = 2.5,
  magnifierSize = 150,
  alt = "",
  ...props
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const handleMouseEnter = (e: MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setImgSize({ width, height });
    setShowMagnifier(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    // Calculate cursor position relative to the image
    const x = e.pageX - left - window.scrollX;
    const y = e.pageY - top - window.scrollY;

    setMagnifierPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div className="relative inline-block h-full w-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className={cn(
          "max-w-full max-h-full object-contain cursor-crosshair",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      />

      {showMagnifier && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierSize}px`,
            width: `${magnifierSize}px`,
            // Center the magnifier on the cursor
            top: `${magnifierPosition.y - magnifierSize / 2}px`,
            left: `${magnifierPosition.x - magnifierSize / 2}px`,
            opacity: "1",
            border: "1px solid lightgray",
            backgroundColor: "white",
            borderRadius: "50%",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            // Scale the background image to match the zoom level relative to the displayed image size
            backgroundSize: `${imgSize.width * zoomLevel}px ${
              imgSize.height * zoomLevel
            }px`,
            // Position the background image to show the zoomed area
            backgroundPositionX: `${
              -magnifierPosition.x * zoomLevel + magnifierSize / 2
            }px`,
            backgroundPositionY: `${
              -magnifierPosition.y * zoomLevel + magnifierSize / 2
            }px`,
            zIndex: 50,
            boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          }}
        />
      )}
    </div>
  );
}
