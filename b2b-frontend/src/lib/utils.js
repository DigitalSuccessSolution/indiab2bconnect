export const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const generateDiscoveryUrl = (query, locStr = "All India", catId = null) => {
  const parts = (locStr || "All India").split(',').map(s => s.trim());
  let area = null;
  let city = parts[parts.length - 1] || "All India";
  
  if (parts.length >= 2) {
    area = parts[0];
  }

  const citySlug = slugify(city);
  
  if (!query || !query.trim()) {
    return `/search?city=${encodeURIComponent(locStr)}`;
  }

  const querySlug = slugify(query);
  const areaPart = area ? `-in-${slugify(area)}` : "";

  return `/${citySlug}/${querySlug}${areaPart}`;
};
