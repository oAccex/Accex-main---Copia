// Use PORT provided in environment or default to 3000
const port = process.env.PORT || 3000;

// Listen on `port` and 0.0.0.0
app.listen(port, "0.0.0.0", function () {
  // ...
});

const express = require("express");
const app = express();
const port = 6969;

var session = require("express-session");

app.use(express.static("app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "HELLO ACCEX",
    resave: false,
    saveUninitialized: false,
}));

var rotas = require("./app/routes/router");
app.use("/", rotas);

app.set("/index.ejs", function (req, res) {
  res.render("pages/index.ejs");
});

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
