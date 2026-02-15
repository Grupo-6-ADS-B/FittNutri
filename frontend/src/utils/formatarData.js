function aplicarMascaraData(date) {
    return date.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{4})\d+?$/, "$1");  
}

export default aplicarMascaraData;