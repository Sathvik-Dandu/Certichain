import api from './api';

const issueCertificate = (data) => {
    return api.post('/certificate/issue', data);
};

const getCertificate = (id) => {
    return api.get(`/certificate/${id}`);
};

const certificateService = {
    issueCertificate,
    getCertificate,
};

export default certificateService;
