import { getProductMediaVariant, normalizeText } from "../data/productsData";

const ProductFallbackVisual = ({ variant, title }) => {
  const label = normalizeText(title, "Product");

  if (variant === "mobile") {
    return (
      <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
        <rect x="252" y="70" width="216" height="384" rx="40" className="products-project-media__frame" />
        <rect x="294" y="118" width="132" height="14" rx="7" className="products-project-media__line" />
        <rect x="286" y="160" width="148" height="34" rx="17" className="products-project-media__panel" />
        <rect x="286" y="212" width="148" height="34" rx="17" className="products-project-media__panel" />
        <rect x="286" y="264" width="148" height="34" rx="17" className="products-project-media__panel" />
        <circle cx="360" cy="396" r="20" className="products-project-media__node" />
        <path d="M210 196C252 160 292 140 360 140C428 140 468 160 510 196" className="products-project-media__arc" />
        <path d="M226 298C274 334 318 350 360 350C402 350 446 334 494 298" className="products-project-media__path" />
        <text x="54" y="484" className="products-project-media__caption">{label}</text>
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
        <circle cx="360" cy="236" r="88" className="products-project-media__cloud" />
        <circle cx="246" cy="184" r="28" className="products-project-media__node" />
        <circle cx="482" cy="178" r="28" className="products-project-media__node" />
        <circle cx="224" cy="328" r="24" className="products-project-media__node" />
        <circle cx="498" cy="324" r="24" className="products-project-media__node" />
        <path d="M246 184L306 216M482 178L420 216M224 328L308 294M498 324L416 294M324 240H396" className="products-project-media__line" />
        <path d="M294 124C336 110 384 110 426 124" className="products-project-media__arc" />
        <text x="54" y="484" className="products-project-media__caption">{label}</text>
      </svg>
    );
  }

  if (variant === "devops") {
    return (
      <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
        <path d="M176 272C210 190 258 154 360 154C462 154 510 190 544 272C510 354 462 390 360 390C258 390 210 354 176 272Z" className="products-project-media__loop" />
        <path d="M242 272H302M418 272H478M360 196V246M360 298V348" className="products-project-media__line" />
        <rect x="230" y="244" width="68" height="56" rx="18" className="products-project-media__panel" />
        <rect x="320" y="182" width="80" height="58" rx="18" className="products-project-media__panel" />
        <rect x="422" y="244" width="68" height="56" rx="18" className="products-project-media__panel" />
        <rect x="320" y="304" width="80" height="58" rx="18" className="products-project-media__panel" />
        <circle cx="360" cy="272" r="16" className="products-project-media__node" />
        <text x="54" y="484" className="products-project-media__caption">{label}</text>
      </svg>
    );
  }

  if (variant === "ai") {
    return (
      <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
        <path d="M190 324L274 246L322 194L396 168L532 214" className="products-project-media__path" />
        <path d="M204 186L280 216L352 276L438 222L516 276" className="products-project-media__line" />
        <circle cx="252" cy="214" r="24" className="products-project-media__node" />
        <circle cx="360" cy="236" r="32" className="products-project-media__cloud" />
        <circle cx="468" cy="222" r="22" className="products-project-media__node" />
        <circle cx="298" cy="324" r="16" className="products-project-media__node" />
        <circle cx="424" cy="300" r="16" className="products-project-media__node" />
        <path d="M276 214C314 184 404 180 448 218" className="products-project-media__arc" />
        <text x="54" y="484" className="products-project-media__caption">{label}</text>
      </svg>
    );
  }

  if (variant === "security") {
    return (
      <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
        <path d="M360 142L492 190V284C492 360 430 408 360 442C290 408 228 360 228 284V190L360 142Z" className="products-project-media__shield" />
        <path d="M320 272L348 300L408 240" className="products-project-media__line" />
        <circle cx="292" cy="210" r="18" className="products-project-media__node" />
        <circle cx="428" cy="210" r="18" className="products-project-media__node" />
        <circle cx="360" cy="342" r="22" className="products-project-media__cloud" />
        <text x="54" y="484" className="products-project-media__caption">{label}</text>
      </svg>
    );
  }

  if (variant === "data") {
    return (
      <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
        <rect x="154" y="146" width="100" height="202" rx="28" className="products-project-media__frame" />
        <rect x="294" y="114" width="132" height="266" rx="28" className="products-project-media__panel" />
        <rect x="468" y="176" width="100" height="170" rx="28" className="products-project-media__frame" />
        <path d="M204 180V316M360 152V324M518 208V312" className="products-project-media__line" />
        <circle cx="204" cy="228" r="18" className="products-project-media__node" />
        <circle cx="360" cy="206" r="22" className="products-project-media__cloud" />
        <circle cx="518" cy="248" r="18" className="products-project-media__node" />
        <text x="54" y="484" className="products-project-media__caption">{label}</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 540" className="products-project-media__svg" role="presentation">
      <rect x="176" y="132" width="368" height="240" rx="30" className="products-project-media__frame" />
      <rect x="214" y="170" width="292" height="12" rx="6" className="products-project-media__line" />
      <rect x="214" y="204" width="184" height="18" rx="9" className="products-project-media__panel" />
      <rect x="214" y="238" width="246" height="18" rx="9" className="products-project-media__panel" />
      <rect x="214" y="272" width="148" height="18" rx="9" className="products-project-media__panel" />
      <circle cx="472" cy="254" r="34" className="products-project-media__node" />
      <path d="M226 334H494" className="products-project-media__line" />
      <text x="54" y="484" className="products-project-media__caption">{label}</text>
    </svg>
  );
};

const ProductMedia = ({ product, eager = false, className = "" }) => {
  const title = normalizeText(product?.title, "Product");
  const imageUrl = normalizeText(product?.imageUrl, "");
  const variant = getProductMediaVariant(product);

  if (imageUrl) {
    return (
      <figure className={`products-project-media ${className}`.trim()}>
        <img
          src={imageUrl}
          alt={title}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "auto"}
          width="1280"
          height="900"
        />
        <div className="products-project-media__overlay" aria-hidden="true" />
      </figure>
    );
  }

  return (
    <figure className={`products-project-media products-project-media--fallback ${className}`.trim()} aria-hidden="true">
      <ProductFallbackVisual variant={variant} title={title} />
      <div className="products-project-media__overlay products-project-media__overlay--fallback" />
    </figure>
  );
};

export default ProductMedia;

