export interface ActivityFilters {
 currency?: string;
 postedAfter?: string;
 postedBefore?: string;
 direction?: "money_in" | "money_out";
 lineTypes?: string[];
 resourceId?: string;
}

// Use the same serialized filters for deep links and report drilldowns.
export function activitySearch(filters: ActivityFilters): Record<string, string> {
 return Object.fromEntries(Object.entries({
  currency: filters.currency,
  after: filters.postedAfter,
  before: filters.postedBefore,
  direction: filters.direction,
  types: filters.lineTypes?.join(","),
  resource: filters.resourceId,
 }).filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0));
}

export function activityFilters(search: string): ActivityFilters {
 const params = new URLSearchParams(search);
 const result: ActivityFilters = {};
 const currency = params.get("currency");
 if (currency && /^[a-zA-Z0-9]{2,16}$/.test(currency)) result.currency = currency;
 for (const [query, field] of [["after", "postedAfter"], ["before", "postedBefore"]] as const) {
  const date = params.get(query);
  if (date && date.length <= 40 && Number.isFinite(Date.parse(date))) result[field] = date;
 }
 const direction = params.get("direction");
 if (direction === "money_in" || direction === "money_out") result.direction = direction;
 const types = params.get("types")?.split(",").filter(type => /^[a-z_]{1,80}$/.test(type)).slice(0, 30);
 if (types?.length) result.lineTypes = types;
 const resource = params.get("resource");
 if (resource && /^[a-zA-Z0-9_]{1,100}$/.test(resource)) result.resourceId = resource;
 return result;
}
