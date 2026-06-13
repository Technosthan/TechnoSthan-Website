import api from "./axios";

export const getTestimonials =
  () => {
    return api.get(
      "/testimonials"
    );
  };