function formatarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); 

    if (cpf.length !== 11) {
        return "CPF inválido";
    }

    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export default formatarCPF;

