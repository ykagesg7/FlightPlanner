export const formatBearing = (value: number): string => {
  return Math.round(value).toString().padStart(3, '0');
};

export const formatDistance = (value: number): string => {
  return Math.round(value).toString();
}; 