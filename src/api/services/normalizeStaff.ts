import type { Staff } from "@/types";

/**
 * The backend populates references, so a user comes back as
 *   { roleId: { id, name, permissions }, cityId: { id, name }, zoneId: { id, name } }
 * but the Users & Staff page reads
 *   roleId / cityId / zoneId  -> plain id strings (filters, edit form)
 *   role / city / zone        -> the populated objects (table cells, action guards)
 * This maps one shape to the other. It is safe to call on already-normalized data.
 */
const refId = (value: any): string | undefined => {
  if (value && typeof value === "object") return value.id ?? value._id;
  return value ?? undefined;
};

const refObject = (value: any) =>
  value && typeof value === "object" ? value : undefined;

export function normalizeStaff(raw: any): Staff {
  if (!raw || typeof raw !== "object") return raw;

  return {
    ...raw,
    roleId: refId(raw.roleId) ?? "",
    role: raw.role ?? refObject(raw.roleId),
    cityId: refId(raw.cityId),
    city: raw.city ?? refObject(raw.cityId),
    zoneId: refId(raw.zoneId),
    zone: raw.zone ?? refObject(raw.zoneId),
  } as Staff;
}