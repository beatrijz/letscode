import { Questao } from './questao';
import Codigo from './codigo';
import { Document, Collection, date } from './firestore/document';
import Erro from './erro';
import { Observable, forkJoin } from 'rxjs';
import Query from './firestore/query';
import Usuario from './usuario';
import Estudante from './estudante';

@Collection("submissoes")
export default class Submissao extends Document{

    @date()
    data;
    estudante:Usuario;
    questao:Questao;
    erros:Erro[];

    constructor(id, public codigo:Codigo, estudante, questao){
        super(id);
        this.estudante = estudante;
        this.questao = questao;
        this.erros = [];
    }

    objectToDocument(){
        let document = super.objectToDocument();
        document["estudanteId"] = this.estudante.pk();
        document["questaoId"] = this.questao.pk();
        document["codigo"] = this.codigo.algoritmo;
        
        return document;
    }

    static getRecentePorQuestao(questao:Questao, estudante:Usuario){
        return new Observable(observer=>{
            Submissao.getAll([new Query("estudanteId", "==", estudante.pk()), new Query("questaoId", "==", questao.pk())]).subscribe(submissoes=>{
                let submissaoRecente = null;
                if(submissoes.length != 0){
                    if(submissoes.length == 1){
                        submissaoRecente = submissoes[0];
                    }else{
                        submissoes.forEach(submissao=>{
                            if(submissaoRecente == null){
                                submissaoRecente = submissao;
                            }else{
                                if(submissaoRecente.data.toDate().getTime() <= submissao.data.toDate().getTime()){
                                    submissaoRecente = submissao;
                                }
                            }
                        })
                    }
                }

                observer.next(submissaoRecente);
                observer.complete();
            })
        })
        
    }

    /*getLazy(){
        return new Observable<Erro[]>(observer=>{
            Erro.getAll(new Query("submissaoId", "==", this.id)).subscribe(errosLocalizados=>{
                this.erros = errosLocalizados;
            }, err=>{
                
            }, ()=>{
                observer.next(this.erros);
                observer.complete();
            });
        });
    }*/

    static get(id){
        return new Observable(observer=>{
            super.get(id).subscribe(submissao=>{
                Erro.getAll(new Query("submissaoId", "==", submissao["id"])).subscribe(erros=>{
                    submissao["erros"] = erros;
                }, err=>{
                    
                }, ()=>{
                    observer.next(submissao);
                    observer.complete();
                });
            }, err=>{
                observer.error(err);
            })
        })
    }

    static getAll(queries?){
        return new Observable<any[]>(observer=>{
            super.getAll(queries).subscribe(submissoes=>{
                let erros:any[] = [];
                submissoes.forEach(submissao=>{
                    erros.push(Erro.getAll(new Query("submissaoId", "==", submissao["id"])));

                    
                })
                
                if(erros.length > 0){
                    forkJoin(erros).subscribe(erros=>{
                        
                        erros.forEach(erro=>{
                            console.log(erro);
                            /*erro.forEach(e=>{
                                for(let i = 0; i < submissoes.length; i++){
                                    if( e.submissaoId == submissoes[i].id){
                                        submissoes[i].erros.push(e);
                                        break;
                                    }
                                    
                                }
                            })*/
                            
                        });
                        
                        
                        
                    }, err=>{
                        
                    }, ()=>{
                        observer.next(submissoes);
                        observer.complete();
                    });
                }else{
                    observer.next(submissoes);
                    observer.complete();
                }
                
                
            }, err=>{
                observer.error(err);
            })
        })
    }

    
}