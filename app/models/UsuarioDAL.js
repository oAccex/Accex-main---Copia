module.exports = class UsuarioDAL {

    constructor(accex) {
        this.accex = accex;
    }

    findAll() {
        return new Promise((resolve, reject) => {
            this.accex.query("SELECT u.id_usuario, u.nome_usuario, u.user_usuario, " ,
             function (error, elements) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(elements);
                });
        });
    };

    findUserEmail(camposForm) {
        return new Promise((resolve, reject) => {
            this.accex.query("SELECT * FROM usuario WHERE nickname = ? or email= ?",
            [camposForm.userName, camposForm.email],
                function (error, elements) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(elements);
                });
        });
    };

    findID(id) {
        return new Promise((resolve, reject) => {
            this.accex.query("SELECT * from usuario WHERE idusuario = ?", [id], function (error, elements) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(elements);
                });
        });
    };

    create(camposJson) {
        return new Promise((resolve, reject) => {
            this.accex.query("insert into usuario set ?",
                camposJson,
                function (error, elements) {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(elements);
                });
        });
    }
    update(camposJson) {
        return new Promise((resolve, reject) => {
            this.accex.query(
                "UPDATE usuario SET nome_completo = ?, nickname = ?, senha = ?,  " +
                " email = ?, telefone = ?, img_perfil = ?,id_tipo_usuario = ?, status_usuario = ? " +
                " WHERE idusuario = ?",
                [camposJson.nome_completo, camposJson.nickname, camposJson.senha,
                camposJson.email, camposJson.telefone, camposJson.img_perfil,camposJson.id_tipo_usuario,
                camposJson.status_usuario, camposJson.idusuario
                ],
                
                function (error, results, fields) {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            this.accex.query("UPDATE usuario SET status_usuario = '0' WHERE idusuario = ?", [id], function (error, results) {
                if (error) {
                    return reject(error);
                }
                return resolve(results[0]);
            });
        });
    }

    Pesquisar(texto) {
        return new Promise((resolve, reject) => {
            this.accex.query("SELECT * from local WHERE nome = ?", [texto], function (error, elements) {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(elements);
                });
        });
    };

    

}

