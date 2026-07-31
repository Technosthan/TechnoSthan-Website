import { forwardRef } from "react";

const DigitalEarthOrbitNode = forwardRef(function DigitalEarthOrbitNode(
  {
    orbit,
    isHovered,
    isFeatured,
    labelPosition = "right",
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
  },
  ref,
) {
  const Icon = orbit?.node?.icon;

  return (
    <div
      className={`digital-earth-orbit digital-earth-orbit--${orbit.key} ${
        isHovered ? "is-hovered" : ""
      } ${isFeatured ? "is-featured" : ""}`.trim()}
    >
      <svg
        className="digital-earth-orbit__svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse
          cx="500"
          cy="500"
          rx={orbit.radiusX}
          ry={orbit.radiusY}
          transform={`rotate(${orbit.tilt} 500 500)`}
          className={`digital-earth-orbit__track digital-earth-orbit__track--${orbit.key}`}
        />
      </svg>

      <button
        ref={ref}
        type="button"
        className="digital-earth-planet"
        data-label-position={labelPosition}
        style={{
          "--planet-x": "50%",
          "--planet-y": "50%",
        }}
        aria-label={orbit?.node?.label}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <span className="digital-earth-planet__content">
          <span className="digital-earth-planet__orb">
            <span className="digital-earth-planet__icon" aria-hidden="true">
              <Icon size={18} />
            </span>
          </span>

          <span className="digital-earth-planet__label">
            <strong>{orbit?.node?.label}</strong>
          </span>
        </span>
      </button>
    </div>
  );
});

export default DigitalEarthOrbitNode;
