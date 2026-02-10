/**
 * Utilitários de Formatação para o SITEC
 */

// Formata moeda para BRL
export const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

// Formata data para pt-BR
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    }).format(date);
};

// Formata CPF (000.000.000-00)
export const formatCPF = (value) => {
    if (!value) return '';
    const cpf = value.replace(/\D/g, '');
    return cpf
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// Formata CNPJ (00.000.000/0000-00)
export const formatCNPJ = (value) => {
    if (!value) return '';
    const cnpj = value.replace(/\D/g, '');
    return cnpj
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// Formata Telefone ( (00) 00000-0000 )
export const formatPhone = (value) => {
    if (!value) return '';
    const phone = value.replace(/\D/g, '');
    if (phone.length > 10) {
        return phone
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    }
    return phone
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};
