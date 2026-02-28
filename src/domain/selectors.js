import { canViewForm } from "../auth/accessControl";
import { ROLES } from "../auth/roles";
import { inferDepartmentId } from "../utils/departments";
import { canViewComplaint, canViewResponse } from "../auth/accessControl";

const toArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const flattenForms = (rawForms) =>
  Object.entries(rawForms || {}).flatMap(([categoryId, value]) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map((form) => ({ ...form, __categoryId: categoryId }));
    return [{ ...value, __categoryId: categoryId }];
  });

export const getFormsForCategory = (rawForms, categoryId) =>
  flattenForms(rawForms)
    .filter((form) => form.__categoryId === categoryId)
    .sort((a, b) => (b.id || 0) - (a.id || 0));

export const getEligibleFormsForStudent = (rawForms, categoryId, contextData = {}) => {
  const student = { role: ROLES.STUDENT };
  const normalizedContext = {
    ...contextData,
    departmentId: contextData.departmentId || inferDepartmentId(contextData.departmentId || contextData.dept),
  };
  return getFormsForCategory(rawForms, categoryId).filter((form) =>
    canViewForm(student, { ...form, category: form.category || categoryId }, normalizedContext)
  );
};

export const getScopedFormsForUser = (rawForms, user, categoryId = null) => {
  const forms = categoryId ? getFormsForCategory(rawForms, categoryId) : flattenForms(rawForms);
  return forms.filter((form) => canViewForm(user, form, {}));
};

export const getAvailableFormsForStudent = (rawForms) =>
  flattenForms(rawForms).sort((a, b) => (b.id || 0) - (a.id || 0));

export const getStudentRepliesForUser = (allReplies, username) =>
  toArray(allReplies)
    .filter((reply) => reply.targetUser === username)
    .sort((a, b) => (b.id || 0) - (a.id || 0));

export const countStudentSubmittedFeedback = (rawForms, username) =>
  flattenForms(rawForms).reduce((count, form) => {
    const responses = toArray(form.responses);
    return (
      count +
      responses.reduce((inner, response) => (response.submittedBy === username ? inner + 1 : inner), 0)
    );
  }, 0);

export const countStudentComplaints = (complaintsByCategory, username) =>
  Object.values(complaintsByCategory || {})
    .flatMap((items) => toArray(items))
    .filter((item) => item.submittedBy === username).length;

export const getResponseRowsFromForms = (rawForms) => {
  const rows = [];
  flattenForms(rawForms).forEach((form) => {
    toArray(form.responses).forEach((response) => {
      const contextData = response.contextData || {};
      rows.push({
        id: response.id,
        category: form.__categoryId,
        formTitle: form.title,
        formId: form.id,
        timestamp: response.timestamp,
        answers: response.answers,
        questions: form.questions,
        submittedBy: response.submittedBy || "unknown",
        departmentId:
          contextData.departmentId ||
          inferDepartmentId(contextData.departmentId || contextData.dept || form.departmentId || form.targetBranch),
        subjectId: contextData.subjectId || form.targetSubjectId || "",
        contextData: {
          ...contextData,
          departmentId: contextData.departmentId || inferDepartmentId(contextData.departmentId || contextData.dept),
        },
        replyKey: `response-${response.id}`,
      });
    });
  });
  return rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const getComplaintRows = ({ academics = [], sports = [], hostel = [] }) =>
  [
    ...toArray(academics).map((c, i) => ({
      ...c,
      departmentId: c.departmentId || inferDepartmentId(c.departmentId || c.dept),
      rowId: `acad-${i}`,
      storageIndex: i,
      category: "academics",
      complaintId: c.complaintId || `academics-${i}`,
      studentId: c.id || "",
      submittedBy: c.submittedBy || "unknown",
    })),
    ...toArray(sports).map((c, i) => ({
      ...c,
      rowId: `sports-${i}`,
      storageIndex: i,
      category: "sports",
      complaintId: c.complaintId || `sports-${i}`,
      studentId: c.id || "",
      submittedBy: c.submittedBy || "unknown",
    })),
    ...toArray(hostel).map((c, i) => ({
      ...c,
      rowId: `hostel-${i}`,
      storageIndex: i,
      category: "hostel",
      complaintId: c.complaintId || `hostel-${i}`,
      studentId: c.id || "",
      submittedBy: c.submittedBy || "unknown",
    })),
  ]
    .map((item) => ({ ...item, replyKey: `complaint-${item.category}-${item.complaintId}` }))
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

export const filterByCategory = (items, category) =>
  category === "all" ? items : toArray(items).filter((item) => item.category === category);

const groupFormsByCategory = (forms = []) =>
  forms.reduce((acc, form) => {
    const categoryId = form.__categoryId || form.category || "academics";
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(form);
    return acc;
  }, {});

export const getScopedResponseRowsFromForms = (rawForms, user) =>
  getResponseRowsFromForms(groupFormsByCategory(getScopedFormsForUser(rawForms, user))).filter((row) =>
    canViewResponse(user, row)
  );

export const getScopedComplaintRows = (complaintsByCategory, user) =>
  getComplaintRows(complaintsByCategory).filter((row) => canViewComplaint(user, row));
