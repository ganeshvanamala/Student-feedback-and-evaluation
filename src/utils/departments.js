export const DEPARTMENTS = Object.freeze([
  { id: "cse", name: "CSE", aliases: ["cse", "computer science"] },
  { id: "ece", name: "ECE", aliases: ["ece", "electronics and communication"] },
  { id: "eee", name: "EEE", aliases: ["eee", "electrical and electronics"] },
  { id: "mech", name: "MECHANICAL", aliases: ["mechanical", "mech"] },
  { id: "civil", name: "CIVIL", aliases: ["civil"] },
]);

const ALIAS_TO_ID = DEPARTMENTS.reduce((acc, department) => {
  acc[department.id] = department.id;
  acc[department.name.toLowerCase()] = department.id;
  (department.aliases || []).forEach((alias) => {
    acc[String(alias).trim().toLowerCase()] = department.id;
  });
  return acc;
}, {});

export function inferDepartmentId(value) {
  if (value === null || value === undefined) return "";
  const key = String(value).trim().toLowerCase();
  return ALIAS_TO_ID[key] || "";
}

export function inferDepartmentIds(values) {
  const list = Array.isArray(values) ? values : [values];
  return list
    .map((value) => inferDepartmentId(value))
    .filter((value, index, arr) => Boolean(value) && arr.indexOf(value) === index);
}

export function getDepartmentNameById(departmentId, fallback = "") {
  const id = inferDepartmentId(departmentId);
  const matched = DEPARTMENTS.find((department) => department.id === id);
  return matched?.name || fallback;
}
