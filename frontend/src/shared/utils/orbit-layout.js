const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getRadiusForCount = (count) => {
  if (count <= 1) {
    return 62;
  }

  if (count <= 3) {
    return 62;
  }

  if (count === 4) {
    return 68;
  }

  if (count === 5) {
    return 74;
  }

  if (count === 6) {
    return 80;
  }

  if (count === 7) {
    return 86;
  }

  return 92;
};

export const calculateOrbitLayout = (items = [], options = {}) => {
  const list = Array.isArray(items) ? items : [];
  const count = list.length;
  const totalItems = Math.max(count, 1);
  const itemSize = options.itemSize ?? 36;
  const minimumGap = options.minimumGap ?? 12;
  const baseRadius = options.baseRadius ?? 72;
  const maximumRadius = options.maximumRadius ?? 96;
  const minimumRadius = options.minimumRadius ?? 64;
  const startAngle = options.startAngle ?? -110;
  const viewportWidth =
    options.viewportWidth ??
    (typeof window !== "undefined" ? window.innerWidth : 1280);

  const countRadius = getRadiusForCount(count);
  const chordRadius =
    count <= 1
      ? baseRadius
      : (itemSize + minimumGap) /
        (2 * Math.sin(Math.PI / totalItems));

  const viewportRadius =
    viewportWidth <= 1200 ? Math.round(baseRadius * 0.95) : baseRadius;

  const radius = clamp(
    Math.max(countRadius, chordRadius, viewportRadius),
    minimumRadius,
    maximumRadius
  );

  const centerOffsetX =
    options.centerOffsetX ??
    (count > 1 ? -Math.min(10, Math.max(4, Math.round((radius - 64) * 0.2))) : 0);

  const centerOffsetY = options.centerOffsetY ?? 0;
  const angleStep = 360 / totalItems;

  const orbitItems = list.map((item, index) => {
    const angle = startAngle + index * angleStep;
    const radians = (angle * Math.PI) / 180;
    const orbitX = centerOffsetX + Math.cos(radians) * radius;
    const orbitY = centerOffsetY + Math.sin(radians) * radius;

    return {
      ...item,
      orbitAngle: angle,
      orbitX,
      orbitY,
    };
  });

  const menuSize = Math.max(
    168,
    Math.ceil((radius + itemSize / 2 + Math.max(Math.abs(centerOffsetX), Math.abs(centerOffsetY)) + 14) * 2)
  );

  return {
    angleStep,
    centerOffsetX,
    centerOffsetY,
    count,
    itemSize,
    menuSize,
    orbitItems,
    radius,
    startAngle,
  };
};

