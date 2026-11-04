// Fixed addresses selected by the family. Never resolve a player's current location.
window.BAD_CAT_SITES = [
  {
    id: "carwash",
    name: "GO Car Wash",
    address: "1900 S Lakeline Blvd, Cedar Park, TX 78613",
    street: "1900 South Lakeline Boulevard",
    house: "1900",
    coordinates: null,
    arrivalRadiusMetres: 65,
    exitRadiusMetres: 180,
    maximumAccuracyMetres: 45,
  },
  {
    id: "puppybase",
    name: "Puppy Base",
    address: "2000 Lakeline Blvd, Cedar Park, TX 78613",
    street: "2000 South Lakeline Boulevard",
    house: "2000",
    coordinates: null,
  },
];
window.BAD_CAT_SITE = window.BAD_CAT_SITES[0];
window.resolveBadCatSite = async (site = window.BAD_CAT_SITE) => {
  const key = `bad-cat-fixed-site-${site.id}-v1`;
  const valid = (p) =>
    Array.isArray(p) &&
    p.length === 2 &&
    p.every(Number.isFinite) &&
    p[0] > 30.4 &&
    p[0] < 30.6 &&
    p[1] > -97.95 &&
    p[1] < -97.7;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    if (valid(cached)) {
      site.coordinates = cached;
      return cached;
    }
  } catch {
    /* Private mode can still play. */
  }
  if (!navigator.onLine) return null;
  // One exact-address query per successfully resolved fixed address; never live tracking.
  const query = new URLSearchParams({
    street: site.street,
    city: "Cedar Park",
    state: "Texas",
    postalcode: "78613",
    country: "United States",
    format: "jsonv2",
    addressdetails: "1",
    limit: "3",
  });
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${query}`,
      {
        signal: AbortSignal.timeout(12000),
        referrerPolicy: "strict-origin-when-cross-origin",
      },
    );
    if (!response.ok) return null;
    const rows = await response.json();
    const row =
      Array.isArray(rows) &&
      rows.find(
        (r) =>
          r.address?.house_number === site.house &&
          /lakeline/i.test(r.address?.road || "") &&
          valid([Number(r.lat), Number(r.lon)]),
      );
    if (!row) return null;
    site.coordinates = [Number(row.lat), Number(row.lon)];
    try {
      localStorage.setItem(key, JSON.stringify(site.coordinates));
    } catch {
      /* Fixed-address cache is optional. */
    }
    return site.coordinates;
  } catch {
    return null;
  }
};
