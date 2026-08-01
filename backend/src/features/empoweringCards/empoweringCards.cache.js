let publicCache = null;

export const invalidateEmpoweringCardsCache = () => {
  publicCache = null;
};

export const loadPublicEmpoweringCardsSnapshot = async (loader) => {
  if (publicCache) {
    return publicCache;
  }

  const data = await loader();
  publicCache = data;
  return data;
};
