export const getAuthToken = (role) => {
    const roleKey = `${role}-token`;
    return localStorage.getItem(roleKey) || localStorage.getItem('token');
};

export const setAuthToken = (role, token) => {
    localStorage.setItem(`${role}-token`, token);
    localStorage.removeItem('token');
};

export const clearAuthToken = (role) => {
    localStorage.removeItem(`${role}-token`);
    localStorage.removeItem('token');
};
