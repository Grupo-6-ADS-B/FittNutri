function calcularIMC(peso, altura){
    return  (peso / (altura * altura)).toFixed(2);
}

export default calcularIMC;