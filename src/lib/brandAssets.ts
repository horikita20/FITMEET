export const getPublicAssetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const FITMEET_LOGO_URL = getPublicAssetUrl('assets/images/fitmeet_logo_master.png');
export const FITMEET_EMBLEM_URL = getPublicAssetUrl(
  'assets/aistudio/FitMeet_Emblem_original_1_.jpg_3ce53c29.jpeg'
);
