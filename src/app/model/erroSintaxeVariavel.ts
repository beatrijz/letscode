import ErroSintaxe from './erroSintaxe';
import Erro from './erro';
import Codigo from './codigo';
import { TipoErro } from './tipoErro';

export default class ErroSintaxeVariavel extends ErroSintaxe{

    static erros(codigo:Codigo):Erro[]{
        let erros:Erro[] = [];
        let linhasCodigo = codigo.linhasAlgoritmo();
        let tipoErro = TipoErro.variavel;
        
        for (let i = 0; i < linhasCodigo.length; i++) {
            let numeroLinha = i+1;
            let linhaCodigo = linhasCodigo[i];

            

            if(ErroSintaxeVariavel.numeroDecimalComVirgula(linhaCodigo)){
                erros.push(new Erro(numeroLinha, "Você declarou uma variável com número decimal e utilizou , (vírgula) quando deveria ter usado . (ponto). Erro na linha: "+numeroLinha, tipoErro));
            }

            if(ErroSintaxeVariavel.variavelDeclaradaComDoisIguais(linhaCodigo)){
                erros.push(new Erro(numeroLinha, "Você declarou uma variável com dois == (igualdades) quando deveria ter usado apenas um =. Erro na linha: "+numeroLinha, tipoErro));
            }

            if(ErroSintaxeVariavel.nomeVariavelComEspaco(linhaCodigo)){
                erros.push(new Erro(numeroLinha, "Você utilizou espaço no nome de uma variável e isso não é permitido. Erro na linha: "+numeroLinha, tipoErro));
            }
        }

        let variaveisNaoDeclaradas = ErroSintaxeVariavel.variaveisNaoDeclaradas(codigo);
        variaveisNaoDeclaradas.forEach(variavel=>{
            erros.push(new Erro(variavel.linha, "Você tentou utilizar a variável: '"+variavel.nome+"' que não foi criada. Erro na linha: "+variavel.linha, tipoErro));
        })


        return erros;
    }

    static numeroDecimalComVirgula(linha) {
        if (this.isLinhaProgramacaoValida(linha)) {
            // ([a-zA-Z])*.*=[\s.]*[^\"\'a-zA-Z]([0-9,])*
            let regex = /([a-zA-Z0-9])*\s*=\s*([0-9]+,[0-9]*)*/g
            let resultado = regex.exec(linha)
            if (resultado != undefined && resultado.length == 3 && resultado[2] != undefined) {
                return true;
            }

            return false;
        }

        return false;
        
    }

    static variavelDeclaradaComDoisIguais(linha) {
        if (this.isLinhaProgramacaoValida(linha)) {
            //(?<!\bif)==
            let regex = /^((?!if).)*={2}.*$/g
            let resultado = regex.exec(linha)
            if (resultado != null && resultado.length > 0) {
                return true;
            }

            return false;
        }
        
        return false;
    }

    static nomeVariavelComEspaco(linha) {
        if (this.isLinhaProgramacaoValida(linha)) {
            // (?<=[a-zA-Z]*\s)(\w)*\s*=
            let regex = /(?<=\w+\s+\w+\s*)=/g
            let resultado = regex.exec(linha)
            if (resultado != null && resultado.length > 0) {
                return true;
            }

            return false;
        }

        return false;
    }


    private static identificarVariaveisUtilizadas(codigo) {

        let linhasCodigo = codigo.linhasAlgoritmo();

        let variaveisUtilizadas = [];

        for (let i = 0; i < linhasCodigo.length; i++) {
            // =[\s.]*[^0-9\"\'][a-zA-z0-9(]*
            let resultado = undefined
            // SE tiver () ou os sinais de operação então deve removê-los para restar apenas as variáveis
            resultado = linhasCodigo[i].match(/=[\s.]*(?:\(|\+|\-|\/|\*)/);
            if(resultado != undefined && resultado.length > 0){
                let linhaCodigo = linhasCodigo[i]
                let atribuicao = linhaCodigo.match(/=[\s.]*(.*)/);
                if(atribuicao != undefined && atribuicao.length > 0){
                    // deve remover os (
                        atribuicao[1] = atribuicao[1].replace(/\(/, "")
                        atribuicao[1] = atribuicao[1].replace(/\)/, "")
                        atribuicao[1] = atribuicao[1].replace(/\+/, "_____")
                        atribuicao[1] = atribuicao[1].replace(/\-/, "_____")
                        atribuicao[1] = atribuicao[1].replace(/\*/, "_____")
                        atribuicao[1] = atribuicao[1].replace(/\//, "_____")
                        atribuicao[1] = atribuicao[1].split("_____");
                        atribuicao[1].forEach(dado=>{
                            if(dado.search("[a-zA-Z]") != -1){
                                variaveisUtilizadas.push({ nome: dado, linha: i + 1 });
                            }
                        })
                }
            }else{
                // SE tiver sinais de operação +, -, * e / deve dividir a setença

                resultado = linhasCodigo[i].match(/=[\s.]*(?![0-9\"\',])[a-zA-z0-9(]*/);

                if (resultado != undefined && resultado.length > 0) {
                    // se tiver input então ignora

                    let nomeVariavel = resultado[0].replace(/=\s*/, "");
                    if (nomeVariavel != "") { // a REGEX retorna =\s, assim ao fazer o replace acima sobra vazio
                        if (nomeVariavel.search(/input\(/) == -1) {
                            
                            
                            // SE variável não estiver em variaveisDeclaradas ENTÃO adicione ao array variaveisDeclaradas// mais de uma vez significa que foi atribuído um valor à ela.
                            if (!variaveisUtilizadas.includes(nomeVariavel)) {
                                variaveisUtilizadas.push({ nome: nomeVariavel, linha: i + 1 });
                            }
                        }
                    }

                }
            }
            

        }

        return variaveisUtilizadas
    }

    private static identificarVariaveisDeclaradas(codigo) {

        let linhasCodigo = codigo.linhasAlgoritmo();

        let variaveisDeclaradas = [];

        for (let i = 0; i < linhasCodigo.length; i++) {
            // REGEX: ([a-zA-Z])*.*= // TODO: está pegando apenas variáveis que não tem números
            let resultado = linhasCodigo[i].match(/([a-zA-Z])*.*=/);

            if (resultado != undefined && resultado.length > 0) {
                let nomeVariavel = resultado[0].replace(/\s*=/, "");
                // SE variável não estiver em variaveisUtilizadas ENTÃO adicione ao array variaveisUtilizadas
                if (!variaveisDeclaradas.includes(nomeVariavel)) {
                    variaveisDeclaradas.push({ nome: nomeVariavel, linha: i + 1 });
                }
            }

        }

        return variaveisDeclaradas;
    }

    static variaveisNaoDeclaradas(codigo) {

        let variaveisNaoDeclaradas = [];

        let variaveisUtilizadas = this.identificarVariaveisUtilizadas(codigo);
        let variaveisDeclaradas = this.identificarVariaveisDeclaradas(codigo);

        variaveisUtilizadas.forEach(variavel => {
            let utilizada = false;
            for (let i = 0; i < variaveisDeclaradas.length; i++) {
                if (variaveisDeclaradas[i].nome == variavel.nome && variaveisDeclaradas[i].linha < variavel.linha) {
                    utilizada = true;
                    break;
                }
            }

            if (!utilizada)
                variaveisNaoDeclaradas.push(variavel);


        });

        return variaveisNaoDeclaradas;


    }

}