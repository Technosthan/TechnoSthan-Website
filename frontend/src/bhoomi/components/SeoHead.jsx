import React from "react";
import { Helmet } from "react-helmet-async";
import { siteBrand } from "../data";

const SeoHead = ({
  title,
  description,
  path = "/",
  image = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
}) => {
  const absoluteUrl = path.startsWith("http")
    ? path
    : `${typeof window !== "undefined" ? window.location.origin : "https://technosthan.example"}${path}`;
  const pageTitle = title
    ? title.includes(siteBrand.name)
      ? title
      : `${title} | ${siteBrand.name}`
    : siteBrand.name;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description || siteBrand.description} />
      <link rel="canonical" href={absoluteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title || siteBrand.name} />
      <meta property="og:description" content={description || siteBrand.description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteBrand.name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteBrand.name} />
      <meta name="twitter:description" content={description || siteBrand.description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SeoHead;
