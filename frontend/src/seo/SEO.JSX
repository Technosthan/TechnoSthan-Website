import { Helmet } from "react-helmet-async";

export default function SEO({ title, desc }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
    </Helmet>
  );
}