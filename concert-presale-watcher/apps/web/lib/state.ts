const US_STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL",
  alaska: "AK",
  arizona: "AZ",
  arkansas: "AR",
  california: "CA",
  colorado: "CO",
  connecticut: "CT",
  delaware: "DE",
  florida: "FL",
  georgia: "GA",
  hawaii: "HI",
  idaho: "ID",
  illinois: "IL",
  indiana: "IN",
  iowa: "IA",
  kansas: "KS",
  kentucky: "KY",
  louisiana: "LA",
  maine: "ME",
  maryland: "MD",
  massachusetts: "MA",
  michigan: "MI",
  minnesota: "MN",
  mississippi: "MS",
  missouri: "MO",
  montana: "MT",
  nebraska: "NE",
  nevada: "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  ohio: "OH",
  oklahoma: "OK",
  oregon: "OR",
  pennsylvania: "PA",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  tennessee: "TN",
  texas: "TX",
  utah: "UT",
  vermont: "VT",
  virginia: "VA",
  washington: "WA",
  "west virginia": "WV",
  wisconsin: "WI",
  wyoming: "WY",
  "district of columbia": "DC",
};

const compact = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");

export const normalizeState = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  const cleaned = compact(value);
  if (!cleaned) {
    return null;
  }

  if (/^[a-z]{2}$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }

  const mapped = US_STATE_NAME_TO_CODE[cleaned];
  if (mapped) {
    return mapped;
  }

  return cleaned;
};

export const stateMatches = (expected: string | null | undefined, actual: string | null | undefined): boolean => {
  const normalizedExpected = normalizeState(expected);
  if (!normalizedExpected) {
    return true;
  }

  const normalizedActual = normalizeState(actual);
  if (!normalizedActual) {
    return false;
  }

  return normalizedExpected === normalizedActual;
};
