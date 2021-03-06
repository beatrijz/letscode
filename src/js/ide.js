/**
 * O editor de programação exige que o código salvo seja um array, mas no BD é salvo como string. Faz a conversão neste método
 * @param  codigo 
 */
function prepararCodigo(codigo){
    if(codigo != undefined || codigo != ""){
        return [codigo];
    }else{
        return [""];
    }
}

// TODO: usar Observable para disparar quando o editor estiver pronto. Assim o model Editor pode ter acesso à instância do mônico quando ela estiver pronta.
function carregarIde(readOnly, callback=null, instance=null, codigo){


        require(['vs/editor/editor.main'], function () {
            
            //var appRoot = document.createElement("app-root"); 
            //document.getElementById("body").appendChild(appRoot);
            if(document.getElementById('container') != undefined){
                editor = monaco.editor.create(document.getElementById('container'), {
                value: prepararCodigo(codigo).join('\n'),
                language: 'python',
                readOnly:readOnly

            });



            // TODO: modificar para colocar em outra função exclusiva de comentário e só aparecer para comentários
            var div = document.getElementById('iconeNovoComentario');
            editorElement = document.getElementById('container');
            div.style.left = (editorElement.offsetLeft+1)+"px";

            dialogEmExibicao = false;
            
            var posicaoFinal = editorElement.offsetTop;
            var y = posicaoFinal+"px";
            div.style.top = y;
            
            editor.onMouseMove(function (e) {
                if( e != undefined){
                    // posicao inicial 
                    if( callback != null)
                        callback(e, instance);

                    if(!dialogEmExibicao){
                        var posicaoInicial = editorElement.offsetTop;
                        var posicaoFinal = 0;
                        if(e.target.position.lineNumber > 1)
                            posicaoFinal = posicaoInicial + e.target.position.lineNumber*18-18;
                        else
                            posicaoFinal = posicaoInicial + e.target.position.lineNumber;
                        //y = (e.event.posy-10)+"px";
                        y = posicaoFinal+"px";
                        console.log(y);
                        div.style.top = y;
                    }

                    
                }
                
            });
            
            }
        });

    }