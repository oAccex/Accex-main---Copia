var express = require("express");
var router = express.Router();
const moment = require("moment");

var fabricaDeConexao = require("../../config/connection-factory");
var conexao = fabricaDeConexao();

var TarefasDAL = require("../models/tarefasDAL");
var tarefasDAL = new TarefasDAL(conexao);

const { body, validationResult } = require("express-validator");

router.get("/", async function (req, res) {
  res.locals.moment = moment;
  try {

    let pagina = req.query.pagina == undefined ? 1 : req.query.pagina;
    var results = null;
    inicio = parseInt(pagina - 1) * 3
    results = await tarefasDAL.FindPage(inicio, 3);
    totReg = await tarefasDAL.TotalReg();
    console.log(results);

    totPaginas = Math.ceil(totReg[0].total / 3);

    var paginador = totReg[0].total <= 3 ? null : { "pagina_atual": pagina, "total_reg": totReg[0].total, "total_paginas": totPaginas }


    res.render("pages/index", { tarefas: results, paginador: paginador });

  } catch (e) {
    console.log(e); // console log the error so we can see it in the console
    res.json({ erro: "Falha ao acessar dados" });
  }
});

router.get("/pesquisa", async function (req, res) {
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
    results = await tarefasDAL.FindPageTarefa(req.query.pesquisa, inicio, 3);
    totReg = await tarefasDAL.TotalRegTarefa(req.query.pesquisa);
    console.log(results);

    totPaginas = Math.ceil(totReg[0].total / 3);

    var paginador = totReg[0].total <= 3 ? null : { "pagina_atual": pagina, "total_reg": totReg[0].total, "total_paginas": totPaginas, pesquisa:contem }

    res.render("pages/index", { tarefas: results, paginador: paginador });

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
    results = await tarefasDAL.FindPageTarefa(req.body.pesquisa, inicio, 3);
    totReg = await tarefasDAL.TotalRegTarefa(req.body.pesquisa);
    console.log(results);

    totPaginas = Math.ceil(totReg[0].total / 3);

    var paginador = totReg[0].total <= 3 ? null : { "pagina_atual": pagina, "total_reg": totReg[0].total, "total_paginas": totPaginas, pesquisa:contem }

    res.render("pages/index", { tarefas: results, paginador: paginador });

  } catch (e) {
    console.log(e); // console log the error so we can see it in the console
    res.json({ erro: "Falha ao acessar dados" });
  }
});



router.get("/adicionar", function (req, res) {
  res.render("pages/adicionar", { dados: null, erros: null });
});

router.post(
  "/adicionar",

  body("tarefa").isLength({ min: 5, max: 45 }),
  body("prazo").isDate(),
  body("situacao").isNumeric(),

  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.json(errors);
    }

    var dadosForm = {
      nome_tarefa: req.body.tarefa,
      prazo_tarefa: req.body.prazo,
      situaca_tarefa: req.body.situacao,
    };

    try {
      results = await tarefasDAL.Create(dadosForm);
    } catch (e) {
      console.log(e);
      res.json({ erro: "Falha ao acessar dados" });
    }
    res.redirect("/");
  }
);

router.get("/excluir/:id", function (req, res) {
  var query = conexao.query(
    "DELETE FROM tarefas WHERE ?",
    { id_tarefa: req.params.id },
    function (error, results, fields) {
      if (error) throw error;
    }
  );

  res.redirect("/");
});

router.get("/finalizar/:id", function (req, res) {
  var query = conexao.query(
    "UPDATE tarefas SET situaca_tarefa = 0 WHERE ?",
    { id_tarefa: req.params.id },
    function (error, results, fields) {
      if (error) throw error;
    }
  );

  res.redirect("/");
});

module.exports = router;