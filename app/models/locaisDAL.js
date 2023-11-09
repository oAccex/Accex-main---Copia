module.exports = class TarefasDAL{
 
    constructor(conexao) {
        this.conexao = conexao;
    }
    
    FindAll(){
        return new Promise(function(resolve, reject){
            this.conexao.query('SELECT * FROM local',  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };
 
    FindPage(pagina, total){
        return new Promise((resolve, reject)=>{
            this.conexao.query('SELECT * FROM local limit '+ pagina + ', '+ total,  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };

    FindPageTarefa(contem, pagina, total){
        return new Promise((resolve, reject)=>{
            this.conexao.query("SELECT * FROM local where nome like CONCAT('%',?,'%') limit ? , ?", [contem, pagina, total],  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };
    
    FindTarefa(contem){
        return new Promise((resolve, reject)=>{
            this.conexao.query("SELECT * FROM local where nome like CONCAT('%',?,'%')",[contem],  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };
    
    Create(dadosForm){
        return new Promise((resolve, reject)=>{
            this.conexao.query("INSERT INTO nome SET ?", dadosForm,  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };


    TotalReg(){
        return new Promise((resolve, reject)=>{
            this.conexao.query('SELECT count(*) total FROM local ',  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };
    TotalRegTarefa(contem){
        return new Promise((resolve, reject)=>{
            this.conexao.query("SELECT count(*) total FROM local where nome like CONCAT('%',?,'%') ",[contem],  function(error, elements){
                if(error){
                    return reject(error);
                }
                return resolve(elements);
            });
        });
    };


}