var express = require("express");
var router = express.Router();

var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(12);

var fabricaDeConexao = require("../../config/connection-factory");
var accex = fabricaDeConexao();

var UsuarioDAL = require("../models/UsuarioDAL");
var usuarioDAL = new UsuarioDAL(accex);

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
  res.render("pages/login", { listaErros: null });
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
      return res.render("pages/login", { listaErros: erros, dadosNotificacao: null })
    }
    if (req.session.autenticado != null) {
      res.redirect("/?login=logado");
    } else {
      res.render("pages/login", { listaErros: erros, dadosNotificacao: { titulo: "Erro ao logar!", mensagem: "Usuário e/ou senha inválidos!", tipo: "error" } })
    }
  });


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
  

/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

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

// ////////////////////////////////////////////////////////////////////////////////////////////////
// // copia do professor 

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
        id_tipo_usuario: 1

      };
      console.log("senha: " + req.body.password)
      if (req.body.password != "") {
        dadosForm.senha = bcrypt.hashSync(req.body.password, salt);
      }
      if (!req.file) {
        console.log("Falha no carregamento");
      } else {
        caminhoArquivo = "imagem/perfil/" + req.file.filename;
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

router.get("/faleConosco", function (req, res) {
  res.render("pages/faleConosco");
});

router.get("/favoritos", function (req, res) {
  res.render("pages/favoritos");
});

router.get("/locais", function (req, res) {
  res.render("pages/locais");
});

router.get("/localCaracteristicas", function (req, res) {
  res.render("pages/localCaracteristicas");
});

router.get("/localDesc", function (req, res) {
  res.render("pages/localDesc");
});

router.get("/visitados", function (req, res) {
  res.render("pages/visitados");
});

router.get("/cadastroLocais", function (req, res) {
  res.render("pages/cadastroLocais");
});

router.get("/avaliacao", function (req, res) {
  res.render("pages/avaliacao");
});


module.exports = router;