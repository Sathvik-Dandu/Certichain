import api from './api';

const getDashboardStats = () => {
    return api.get('/admin/dashboard');
};

const verifyInstitution = (data) => {
    return api.post('/admin/verify-institution', data);
};

const adminService = {
    getDashboardStats,
    verifyInstitution,
};

export default adminService;
