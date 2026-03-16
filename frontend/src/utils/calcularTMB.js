function calcularTMB(peso, altura, idade, sexo, atividade) {
    let tmb;

    if (sexo.toLowerCase() === "masculino") {
        tmb = (10 * peso) + (6.25 * altura) - (5 * idade) + 5;
    } else {
        tmb = (10 * peso) + (6.25 * altura) - (5 * idade) - 161;
    }

    switch(atividade){
        case "sedentário":
            tmb *= 1.2;
            break;
        case "levemente ativo":
            tmb *= 1.375;
            break;
        case "moderadamente ativo":
            tmb *= 1.55;
            break;
        case "muito ativo":
            tmb *= 1.725;
            break;
        case "extremamente ativo":
            tmb *= 1.9;
            break;
        default:
            tmb *= 1.2;
    }

    return tmb;
}

export default calcularTMB;