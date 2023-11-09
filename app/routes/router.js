var express = require("express");
var router = express.Router();

const moment = require("moment");

var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);

var fabricaDeConexao = require("../../config/connection-factory");
var accex = fabricaDeConexao();

var UsuarioDAL = require("../models/UsuarioDAL");
var usuarioDAL = new UsuarioDAL(accex);

var LocalDAL = require("../models/LocalDAL");
var localDAL = new LocalDAL(accex);

var LocaisDAL = require("../models/locaisDAL");
var locaisDAL = new LocaisDAL(accex);

var localDALcrct = require("../models/localDALcrct");
var localDALcrct = new localDALcrct(accex);

var { verificarUsuAutenticado, limparSessao, gravarUsuAutenticado,
  verificarUsuAutorizado } = require("../models/autenticador_middleware");

const { body, validationResult } = require("express-validator");

const multer = require('multer');
const path = require('path');
const { receiveMessageOnPort } = require("worker_threads");
const e = require("express");

var storagePasta = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, './app/public/image/perfil/')
  },
  filename: (req, file, callBack) => {
    callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storagePasta });

// router.get("/", function (req, res) {
//   res.render("pages/index");
// });

// router.get("/login", function (req, res) {
//   res.render("pages/login");
// });

// router.post("/login", (req, res) => {
//   const { nickname, senha } = req.body;
//   if (nickname === "usuarioteste" && senha === "senhateste") {
//     res.redirect("/index");
//   } else {
//     res.render("pages/login", { erro: "Credenciais inválidas" });
//   }
// });

router.get("/sair", limparSessao, function (req, res) {
  res.redirect("/");
});

router.get("/", verificarUsuAutenticado, function (req, res) {
  req.session.autenticado.login = req.query.login;
  res.render("pages/index", req.session.autenticado);
});

router.get("/login", function (req, res) {
  res.locals.erroLogin = null
  res.render("pages/login", { listaErros: null, dadosNotificacao: null, valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" } });
});

router.post(
  "/login",
  body("email")
    .isLength({ min: 4, max: 45 })
    .withMessage("O nome de usuário/e-mail deve ter de 8 a 45 caracteres"),
  body("password")
    .isStrongPassword()
    .withMessage("A senha ou usuario estão incorretos"),

  gravarUsuAutenticado(usuarioDAL, bcrypt),
  function (req, res) {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.render("pages/login", { autenticado: req.session.autenticado, listaErros: erros, dadosNotificacao: null })
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    if (req.session.autenticado.id != null) {
      console.log(`Logado`)
      res.redirect("/?login=logado");
    } else {
      res.render("pages/login", { autenticado: req.session.autenticado, listaErros: erros, dadosNotificacao: { titulo: "Erro ao logar!", mensagem: "Usuário e/ou senha inválidos!", tipo: "error" } })
    }
  }
);


router.get("/cadastro", function (req, res) {
  res.render("pages/cadastro", { listaErros: null, dadosNotificacao: null, valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" } });
});

router.post("/cadastro",
  body("fullName")
    .isLength({ min: 3, max: 25 }).withMessage("Digite um nome válido"),
  body("userName")
    .isLength({ min: 3, max: 25 }).withMessage("O nome de usuário deve ter de 3 a 25 caracteres"),
  body("email")
    .isEmail().withMessage("Digite um e-mail válido!"),
  //body("telefone")
  //.isLength({ min: 12, max: 13 }).withMessage("Coloque seu telefone!"),
  body("password")
    .isStrongPassword().withMessage("Escolha uma senha mais forte. Ex: 8nd5?4eCJ@"),
  async function (req, res) {
    var dadosForm = {
      senha: bcrypt.hashSync(req.body.password, salt),
      email: req.body.email,
      nome_completo: req.body.fullName,
      nickname: req.body.userName,
      telefone: req.body.telefone
    };
    const erros = validationResult(req);
    console.log(erros)
    if (!erros.isEmpty()) {
      console.log("erro no cadastro", erros);
      return res.render("pages/cadastro", { listaErros: erros, dadosNotificacao: null, valores: req.body })
    }
    try {
      let insert = await usuarioDAL.create(dadosForm);
      console.log(insert);
      res.render("pages/cadastro", {
        listaErros: null, dadosNotificacao: {
          titulo: "Cadastro realizado!", mensagem: "Usuário criado com o id " + insert.insertId + "!", tipo: "success"
        }, valores: req.body
      })
    } catch (e) {
      console.log("erro no cadastro", e);
      res.render("pages/cadastro", {
        listaErros: erros, dadosNotificacao: {
          titulo: "Erro ao cadastrar!", mensagem: "Verifique os valores digitados!", tipo: "error"
        }, valores: req.body
      })
    }
  }
);

router.get("/perfil", verificarUsuAutorizado([1, 2, 3], "pages/restrito"), async function (req, res) {
  try {
    let results = await usuarioDAL.findID(req.session.autenticado.id);
    console.log(results);
    let campos = {
      nome_completo: results[0].nome_completo, email: results[0].email,
      img_perfil: results[0].img_perfil,
      nickname: results[0].nickname, telefone: results[0].telefone, senha: ""
    }
    console.log(results)
    res.render("pages/perfil", { listaErros: null, dadosNotificacao: null, valores: campos })
  } catch (e) {
    res.render("pages/perfil", {
      listaErros: null, dadosNotificacao: null, valores: {
        img_perfil: "", nome_completo: "", email: "",
        nickname: "", telefone: "", senha: ""
      }
    })
  }
});


router.get("/editarPerfil", verificarUsuAutorizado([1, 2, 3], "pages/restrito"), verificarUsuAutenticado, async function (req, res) {
  try {
    let results = await usuarioDAL.findID(req.session.autenticado.id);
    console.log(results);
    let campos = {
      nome_completo: results[0].nome_completo, email: results[0].email,
      img_perfil: results[0].img_perfil,
      nickname: results[0].nickname, telefone: results[0].telefone, senha: ""
    }
    console.log(results)
    res.render("pages/editarPerfil", { listaErros: null, dadosNotificacao: null, valores: campos })
  } catch (e) {
    res.render("pages/editarPerfil", {
      listaErros: null, dadosNotificacao: null, valores: {
        img_perfil: "", nome_completo: "", email: "",
        nickname: "", telefone: "", senha: ""
      }
    })
  }
});

router.post("/editarPerfil", upload.single('img-perfil'),
  body("fullName")
    .isLength({ min: 3, max: 50 }).withMessage("Mínimo de 3 letras e máximo de 50!"),
  body("userName")
    .isLength({ min: 3, max: 30 }).withMessage("Nome de usuário deve ter de 8 a 30 caracteres!"),
  body("email")
    .isEmail().withMessage("Digite um e-mail válido!"),
  // body("telefone")
  //   .isLength({ min: 11, max: 11 }).withMessage("Digite um telefone válido!"),
  verificarUsuAutorizado([1, 2, 3], "pages/restrito"),
  async function (req, res) {
    const erros = validationResult(req);
    console.log(erros)
    if (!erros.isEmpty()) {
      return res.render("pages/editarPerfil", { listaErros: erros, dadosNotificacao: null, valores: req.body })
    }
    try {
      var dadosForm = {
        nickname: req.body.userName,
        nome_completo: req.body.fullName,
        email: req.body.email,
        telefone: req.body.telefone,
        idusuario: req.session.autenticado.id,
        status_usuario: 1,
        id_tipo_usuario: 1,
        img_perfil: null
      };
      console.log("senha: " + req.body.password)
      if (req.body.password != "") {
        dadosForm.senha = bcrypt.hashSync(req.body.password, salt);
      }
      if (!req.file) {
        console.log("Falha no carregamento");
      } else {
        caminhoArquivo = "image/perfil/" + req.file.filename;
        dadosForm.img_perfil = caminhoArquivo
      }
      console.log(dadosForm);

      let resultUpdate = await usuarioDAL.update(dadosForm);
      if (!resultUpdate.isEmpty) {
        if (resultUpdate.changedRows == 1) {
          var result = await usuarioDAL.findID(req.session.autenticado.id);
          var autenticado = {
            autenticado: result[0].nome_completo,
            id: result[0].idusuario,
            tipo: result[0].id_tipo_usuario,
            img_perfil: result[0].img_perfil
          };
          req.session.autenticado = autenticado;
          var campos = {
            nome_completo: result[0].nome_completo, email: result[0].email,
            img_perfil: result[0].img_perfil,
            nickname: result[0].nickname, telefone: result[0].telefone, senha: ""
          }
          res.render("pages/editarPerfil", { listaErros: null, dadosNotificacao: { titulo: "Perfil! atualizado com sucesso", mensagem: "", tipo: "success" }, valores: campos });
        }
      }
    } catch (e) {
      console.log(e)
      res.render("pages/editarPerfil", { listaErros: erros, dadosNotificacao: { titulo: "Erro ao atualizar o perfil!", mensagem: "Verifique os valores digitados!", tipo: "error" }, valores: req.body })
    }

  });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DO FILIPE
router.get("/painel_adm", verificarUsuAutorizado([/* */1,/* */ 2, 3], "pages/restrito"), verificarUsuAutenticado, async (req, res) => {
  try {
    const usuarios = await buscarUsuariosDoBanco();

    accex.query("SELECT COUNT(idusuario) AS total_usuarios FROM usuario", (error, results) => {
      if (error) {
        console.error("Erro ao contar usuários:", error);
        res.status(500).send("Erro ao contar usuários.");
      } else {
        const totalUsuarios = results[0].total_usuarios;

        res.render("pages/painel_adm", {
          listaErros: null,
          dadosNotificacao: null,
          valores: { nome_completo: "", email: "", senha: "", img_perfil: "" },
          autenticado: req.session.autenticado,
          login: req.session.autenticado,
          id_tipo_usuario: req.session.autenticado.tipo,
          img_perfil: req.session.autenticado.img_perfil,
          usuarios: usuarios,
          totalUsuarios: totalUsuarios,
        });
      }
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).send("Erro ao buscar usuários.");
  }
});

async function buscarUsuariosDoBanco() {
  return new Promise((resolve, reject) => {
    accex.query("SELECT * FROM usuario", (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

router.post("/desativar-usuario/:id", verificarUsuAutorizado([1, 2, 3], "pages/restrito"), verificarUsuAutenticado, async (req, res) => {
  const id = req.params.id;

  try {
    await usuarioDAL.delete(id);
    res.status(200).send("Usuário desativado com sucesso.");
    console.log("Usuário desativado com sucesso.");
  } catch (error) {
    console.error("Erro ao desativar o usuário:", error);
    res.status(500).send("Erro ao desativar o usuário.");
    console.log("Erro ao desativar o usuário.");
  }
});

router.post("/reativar-usuario/:id", verificarUsuAutorizado([1, 2, 3], "pages/restrito"), verificarUsuAutenticado, async (req, res) => {
  const id = req.params.id;

  try {
    await usuarioDAL.reactivate(id);
    res.status(200).send("Usuário reativado com sucesso.");
    console.log("Usuário reativado com sucesso.");
  } catch (error) {
    console.error("Erro ao reativar o usuário:", error);
    res.status(500).send("Erro ao reativar o usuário.");
    console.log("Erro ao reativar o usuário.");
  }
});



/////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////
router.get("/faleConosco", function (req, res) {
  res.render("pages/faleConosco");
});

// router.get("/excluir", verificarUsuAutenticado, async function (req, res) {

// try{

//   let deleta = await usuarioDAL.delete(req.session.autenticado.id_Cadastro);

//   console.log(deleta);

//   res.redirect("/sair");

// } catch(e) {

//   console.log(e);

//   res.render("pages/locais");

// }

// });
//////////////////////////////////////////////////////////////////////////////


router.get("/excluir", verificarUsuAutenticado, async function (req, res) {
  try {
    let deleta = await usuarioDAL.delete(req.session.autenticado.id);
    console.log(deleta);
    res.redirect("/sair");
  } catch (e) {
    console.log(e); res.render("pages/404");
  }
});

router.get("/favoritos", function (req, res) {
  res.render("pages/favoritos");
});

router.get("/locais", function (req, res) {
  res.render("pages/locais");
});

router.get("/localDesc", async function (req, res) {
  
  res.render("pages/localDesc");

});

router.get("/visitados", function (req, res) {
  res.render("pages/visitados");
});

router.get("/cadastroLocais", verificarUsuAutenticado, async function (req, res) {
  if (req.session.autenticado.autenticado) {
    res.render("pages/cadastroLocais", { listaErros: null, dadosNotificacao: null, valores: { NomeLocal: "", nomeusu_usu: "", email_usu: "", senha_usu: "" } });
  } else {
    res.render("pages/restrito")
  }

});

router.post("/cadastroLocais",
  body("NomeLocal")
    .isLength({ min: 3, max: 100 }).withMessage("Digite um nome válido"),
  body("Cidade")
    .isLength({ min: 3, max: 25 }).withMessage("O nome de usuário deve ter de 3 a 25 caracteres"),
  body("cep")
    .isLength({ min: 3, max: 25 }).withMessage("O nome de usuário deve ter de 3 a 25 caracteres"),
  body("Bairro")
    .isLength({ min: 4, max: 100 }).withMessage("Digite o bairro!"),
  body("Rua")
    .isLength({ min: 3, max: 100 }).withMessage("Digite um nome válido"),
  body("Num")
    .isLength({ min: 3, max: 25 }).withMessage("Digite um nome válido"),
  async function (req, res) {
    var dadosForm = {
      nome: req.body.NomeLocal,
      cidade: req.body.Cidade,
      cep: req.body.cep,
      rua: req.body.Rua,
      bairro: req.body.Bairro,
      num_residen: req.body.Num,
      idtipoDlocal: req.body.estabelecimento,
      idusuario: req.session.autenticado.id
    };
    const erros = validationResult(req);
    console.log(erros)
    if (!erros.isEmpty()) {
      console.log("erro no cadastro", erros);
      return res.render("pages/cadastrolocais", { listaErros: erros, dadosNotificacao: null, valores: req.body, idLocal: req.body })
    }
    try {
      let insert = await localDAL.create(dadosForm);
      console.log(insert);
      var idDolocal = insert.insertId;
      req.session.autenticado.idLocal = idDolocal;
      console.log("esse é o id " + idDolocal) // Exibição do id do local cadastrado
      res.render("pages/localCaracteristicas", { idLocal: insert.insertId, listaErros: null, dadosNotificacao: { titulo: "Cadastro de local realizado!", mensagem: "Local criado com o id " + insert.insertId + "!", tipo: "success"
        }, valores: req.body})
    } catch (e) {
      console.log("erro no cadastro", e);
      res.render("pages/cadastroLocais", {
        listaErros: erros, dadosNotificacao: {
          titulo: "Erro ao cadastrar local!", mensagem: "Verifique os valores digitados!", tipo: "error"
        }, valores: req.body, idLocal: req.body
      })
    }
  }
);

router.get("/localCaracteristicas", async function (req, res) {
  console.log("get local características")
  console.log(req.session.autenticado.idLocal)
  res.render("pages/localCaracteristicas", { listaErros: null, dadosNotificacao: null, valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" }, idlocal: req.session.autenticado.idLocal });
});

router.post("/localCaracteristicas",
  body("andares")
    .isLowercase().withMessage("Selecione uma opção válida!"),
  body("escada")
    .isLowercase().withMessage("Selecione uma opção válida!"),
  body("elevadores")
    .isLowercase().withMessage("Selecione uma opção válida!"),
  body("rampa")
    .isLowercase().withMessage("Selecione uma opção válida!"),
  body("piso")
    .isLowercase().withMessage("Selecione uma opção válida!"),
  async function (req, res) {
    var dadosForm = {
      descricao_1: req.body.andares,
      descricao_2: req.body.escada,
      descricao_3: req.body.elevadores,
      descricao_5: req.body.piso,
      descricao_4: req.body.rampa,
      descricao_6: req.body.acessibilidade,
      idlocal: req.body.idLocal
    };
    const erros = validationResult(req);
    console.log(erros)
    if (!erros.isEmpty()) {
      console.log("erro no cadastro", erros);
      return res.render("pages/cadastrolocais", { listaErros: erros, dadosNotificacao: null, valores: req.body, idLocal: req.body })
    }
    try {
      let insert = await localDALcrct.create(dadosForm);
      console.log(insert);

/////////////////////
      let local = await localDAL.findID( req.body.idLocal)
      console.log("local----> ");
      console.log(local);

 //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //////////////////////////////
      res.render("pages/localDesc", {localInst: local ,
        listaErros: null, dadosNotificacao: {
          titulo: "Cadastro de local realizado!", mensagem: "Caracteristica atribuídas ao local com id " + insert.insertId + "!", tipo: "success"
        }, valores: dadosForm, idLocal: insert.insertId})
    } catch (e) {
      console.log("erro no cadastro", e);
      res.render("pages/localCaracteristicas", {
        listaErros: erros, dadosNotificacao: {
          titulo: "Erro ao cadastrar local!", mensagem: "Verifique os valores digitados!", tipo: "error"
        }, valores: req.body, idLocal: req.body
      })
    }
  }
);

router.get("/avaliacao", function (req, res) {
  res.render("pages/avaliacao");
});

router.get("/resultadosPesquisa", async function (req, res) {
  
  res.locals.moment = moment;
  if (req.query.pesquisa) {
    var contem = req.query.pesquisa;
  } else {
    var contem = req.query.pesquisa == undefined ? '' : req.query.pesquisa;
  }

  try {

    let pagina = req.query.pagina == undefined ? 1 : req.query.pagina;
    var results = null;
    inicio = parseInt(pagina - 1) * 3
    results = await LocaisDAL.FindPageTarefa(req.query.pesquisa, inicio, 3);
    totReg = await LocaisDAL.TotalRegTarefa(req.query.pesquisa);
    console.log(results);

    totPaginas = Math.ceil(totReg[0].total / 3);

    var paginador = totReg[0].total <= 3 ? null : { "pagina_atual": pagina, "total_reg": totReg[0].total, "total_paginas": totPaginas, pesquisa:contem }

    res.render("pages/resultadosPesquisa", { tarefas: results, paginador: paginador });

  } catch (e) {
    console.log(e); // console log the error so we can see it in the console
    res.json({ erro: "Falha ao acessar dados" });
  }
});

router.post("/pesquisa", async function (req, res) {
  res.locals.moment = moment;
  if (req.body.pesquisa) {
    var contem = req.body.pesquisa;
  } else {
    var contem = req.query.pesquisa == undefined ? '' : req.query.pesquisa;
  }

  try {

    let pagina = req.query.pagina == undefined ? 1 : req.query.pagina;
    var results = null;
    inicio = parseInt(pagina - 1) * 3
    results = await LocaisDAL.FindPageTarefa(req.body.pesquisa, inicio, 3);
    totReg = await LocaisDAL.TotalRegTarefa(req.body.pesquisa);
    console.log(results);

    totPaginas = Math.ceil(totReg[0].total / 3);

    var paginador = totReg[0].total <= 3 ? null : { "pagina_atual": pagina, "total_reg": totReg[0].total, "total_paginas": totPaginas, pesquisa:contem }

    res.render("pages/resultadosPesquisa", { local: results, paginador: paginador });

  } catch (e) {
    console.log(e); // console log the error so we can see it in the console
    res.json({ erro: "Falha ao acessar dados" });
  }
});

// router.post("/pesquisa", verificarUsuAutenticado, async function (req, res) {
//   try {
//     var results = null
//     let pesquisa = req.body.pesquisa;
//     console.log(pesquisa)
//     results = await usuarioDAL.findByTag(pesquisa)
//     console.log(results)
//     res.render("pages/home", { tarefas: results, autenticado: req.session.autenticado });
//   } catch (e) {
//     console.log(e)
//   }
// });

// router.get("/pesquisa", verificarUsuAutenticado, async function (req, res) {
//   // idUsuario = req.params.id_usuario;
//   req.session.login = req.query.login;
//   idUsuario = req.query.idusuario;
//   result = await usuarioDAL.findID(idUsuario);
//   res.render("pages/perfilusu", { login: req.session.login, dadosUsuario: result, autenticado: req.session.autenticado });
// });



module.exports = router;