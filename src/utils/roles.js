
const STAFF_ROLES = [
    "super_admin",
    "admin",
    "district",
    "subdivision",
    "block",
];

const OPERATIONAL_USER_TYPES = [
    "volunteers",
    "ngo_contact_person",
];

export const getUserRole = (user) => {
    if (!user || user.role == null) return null;

    const role = String(user.role).trim().toLowerCase();
    return STAFF_ROLES.includes(role) ? role : null;
};

export const getUserType = (user) => {
    if (!user || user.user_type == null) return null;

    return String(user.user_type).trim().toLowerCase();
};

export const hasFullAccess = (user) => {
    return STAFF_ROLES.includes(getUserRole(user));
};

export const isOperationalUser = (user) => {
    return OPERATIONAL_USER_TYPES.includes(getUserType(user));
};

export const isVolunteer = (user) => {
    return getUserType(user) === "volunteers";
};

export const isNgoContact = (user) => {
    return getUserType(user) === "ngo_contact_person";
};

export const isTaskOnlyRole = (user) => {
    // Retained for compatibility with existing imports.
    // Operational users need access to more than the Task page.
    return false;
};
