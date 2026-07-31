const ensureMeta = (selector, attrs) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attrs).forEach(([name, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(name, value);
    }
  });

  return element;
};

const ensureLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  element.setAttribute("rel", rel);
  element.setAttribute("href", href);

  return element;
};

const upsertJsonLd = (id, data) => {
  let script = document.getElementById(id);

  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
  return script;
};

export const syncProductsHead = ({
  title,
  description,
  canonical,
  breadcrumbName = "Products",
  itemList = [],
  image = "",
}) => {
  if (typeof document === "undefined") {
    return () => {};
  }

  const previousTitle = document.title;
  const previousDescription =
    document.head.querySelector('meta[name="description"]')?.getAttribute("content") || "";
  const previousCanonical =
    document.head.querySelector('link[rel="canonical"]')?.getAttribute("href") || "";
  const previousOgImage =
    document.head.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

  document.title = title;
  ensureMeta('meta[name="description"]', {
    name: "description",
    content: description,
  });
  ensureMeta('meta[property="og:title"]', {
    property: "og:title",
    content: title,
  });
  ensureMeta('meta[property="og:description"]', {
    property: "og:description",
    content: description,
  });
  ensureMeta('meta[property="og:url"]', {
    property: "og:url",
    content: canonical,
  });
  ensureMeta('meta[property="og:type"]', {
    property: "og:type",
    content: "website",
  });
  ensureMeta('meta[name="twitter:card"]', {
    name: "twitter:card",
    content: "summary_large_image",
  });
  ensureMeta('meta[name="twitter:title"]', {
    name: "twitter:title",
    content: title,
  });
  ensureMeta('meta[name="twitter:description"]', {
    name: "twitter:description",
    content: description,
  });

  if (image) {
    ensureMeta('meta[property="og:image"]', {
      property: "og:image",
      content: image,
    });
  }

  ensureLink("canonical", canonical);

  const breadcrumbScript = upsertJsonLd("products-breadcrumb-jsonld", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: window.location.origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: breadcrumbName,
        item: canonical,
      },
    ],
  });

  const itemListScript =
    itemList.length > 0
      ? upsertJsonLd("products-itemlist-jsonld", {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: breadcrumbName,
          itemListOrder: "http://schema.org/ItemListOrderAscending",
          numberOfItems: itemList.length,
          itemListElement: itemList.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        })
      : null;

  return () => {
    document.title = previousTitle;

    const descriptionMeta = document.head.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      if (previousDescription) {
        descriptionMeta.setAttribute("content", previousDescription);
      } else {
        descriptionMeta.remove();
      }
    }

    const canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      if (previousCanonical) {
        canonicalLink.setAttribute("href", previousCanonical);
      } else {
        canonicalLink.remove();
      }
    }

    const ogImage = document.head.querySelector('meta[property="og:image"]');
    if (ogImage) {
      if (previousOgImage) {
        ogImage.setAttribute("content", previousOgImage);
      } else {
        ogImage.remove();
      }
    }

    breadcrumbScript?.remove();
    itemListScript?.remove();
  };
};

