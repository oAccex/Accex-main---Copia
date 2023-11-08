/* ALTER USER 'root'@'localhost'
identified
with
mysql_native_password
BY '@ITB123456';

DROP DATABASE IF EXISTS accex;
CREATE DATABASE  accex;

use accex;

CREATE TABLE  usuario(
	`idusuario` int NOT NULL AUTO_INCREMENT,
 	`nome_completo` varchar(90) NOT NULL,
 	`nickname` varchar(30) NOT NULL,
	`telefone` varchar(45) NULL,
 	`senha` varchar(100) NOT NULL,
 	`email` varchar(90) NOT NULL,
    `img_perfil` varchar(100) DEFAULT NULL,
    `id_tipo_usuario` int NOT NULL DEFAULT '1',
    `status_usuario` int DEFAULT '1',
    PRIMARY KEY (`idusuario`)
   
);


create table local(
	`nome` varchar(50) not null ,
	`rua` varchar(45) not null,
	`bairro` varchar(45) not null,
	`cep` varchar(20) not null,
	`num_residen` varchar(9) not null,
	`cidade` varchar(30) not null,
	`estado` varchar(30),
    `img_perfil` varchar(100) DEFAULT NULL,
    `idlocal` int not null Auto_increment, 
    `idtipoDlocal` int not null,
    `tipoDlocal` int not null,
    `idusuario` int NOT NULL,
    primary key (`idlocal`)
   
);

create table avaliacao(
	`texto` longtext null,
	`foto` longblob null,
	`video` longblob null,
	`idavaliacao` int not null auto_increment,
    primary key (`idavaliacao`),
    `idlocal` int not null , 
	`idusuario` int NOT NULL
	
);

create table tipoDeLocal(
	`idtipoDlocal` int not null auto_increment,
	`tipo` varchar(45) not null,
	primary key (`idtipoDlocal`)
);



create table descricaoDlocal(
	`id_descricao_D_Local` int not null auto_increment,
	`descricao_1` varchar(35) not null,
	`descricao_2` varchar(35) not null,
	`descricao_3` varchar(35) not null,
	`descricao_4` varchar(35) not null,
	`descricao_5` varchar(35) not null,
	`descricao_6` varchar(35) not null,
    `idlocal` int not null, 
	primary key (`id_descricao_D_Local`)
    
);

CREATE TABLE `tipo_usuario` (
  `id_tipo_usuario` int NOT NULL AUTO_INCREMENT,
  `tipo_usuario` varchar(25) DEFAULT NULL,
  `descricao_usuario` varchar(155) DEFAULT NULL,
  `status_tipo_usuario` int DEFAULT '1',
  PRIMARY KEY (`id_tipo_usuario`)
);

ALTER TABLE local
ADD CONSTRAINT fk_tipoDeLocal
FOREIGN KEY (`idtipoDlocal`) REFERENCES tipoDeLocal(`idtipoDlocal`),
ADD CONSTRAINT fk_usuario
FOREIGN KEY (`idusuario`) REFERENCES usuario(`idusuario`);

ALTER TABLE avaliacao
ADD CONSTRAINT local
FOREIGN KEY (`idlocal`) REFERENCES local(`idlocal`),
ADD CONSTRAINT usuario
FOREIGN KEY (`idusuario`) REFERENCES usuario(`idusuario`);
 
ALTER TABLE usuario
ADD CONSTRAINT tipo_usuario
FOREIGN KEY (`id_tipo_usuario`) REFERENCES tipo_usuario(`id_tipo_usuario`); 

ALTER TABLE descricaodlocatipodelocall
ADD CONSTRAINT fk_idlocal
FOREIGN KEY (`idlocal`) REFERENCES local(`idlocal`);

INSERT INTO `accex`.`tipo_usuario` (`id_tipo_usuario`, `tipo_usuario`, `descricao_usuario`, `status_tipo_usuario`) VALUES ('1', 'comum', 'usuario logado', '1');
INSERT INTO `accex`.`tipo_usuario` (`id_tipo_usuario`, `tipo_usuario`, `descricao_usuario`, `status_tipo_usuario`) VALUES ('2', 'proprietario', 'Usuário com acesso a consultas na área administrativa', '1');
INSERT INTO `accex`.`tipo_usuario` (`id_tipo_usuario`, `tipo_usuario`, `descricao_usuario`, `status_tipo_usuario`) VALUES ('3', 'ADM', 'Usuário com acesso a consultas e edições na área administrativa', '1');

UPDATE `accex`.`tipodelocal` SET `tipo` = 'Universidade' WHERE (`idtipoDlocal` = '1');
UPDATE `accex`.`tipodelocal` SET `tipo` = 'Mercado' WHERE (`idtipoDlocal` = '2');
UPDATE `accex`.`tipoDlocal` SET `tipo` = 'Parque' WHERE (`idtipoDlocal` = '3');
UPDATE `accex`.`tipodelocal` SET `tipo` = 'Restaurante' WHERE (`idtipoDlocal` = '4');
UPDATE `accex`.`tipodelocal` SET `tipo` = 'Hotel' WHERE (`idtipoDlocal` = '5');
UPDATE `accex`.`tipodelocal` SET `tipo` = 'Biblioteca' WHERE (`idtipoDlocal` = '6'); */

mysql -hroundhouse.proxy.rlwy.net -uroot -p******** --port 34628 --protocol=TCP railway


DROP DATABASE IF EXISTS accex;
CREATE DATABASE  accex;

use accex;

CREATE TABLE  usuario(
	`idusuario` int NOT NULL AUTO_INCREMENT,
 	`nome_completo` varchar(90) NOT NULL,
 	`nickname` varchar(30) NOT NULL,
	`telefone` varchar(45) NULL,
 	`senha` varchar(100) NOT NULL,
 	`email` varchar(90) NOT NULL,
    `img_perfil` varchar(100) DEFAULT NULL,
    `id_tipo_usuario` int NOT NULL DEFAULT '1',
    `status_usuario` int DEFAULT '1',
    PRIMARY KEY (`idusuario`)
   
);


create table local(
	`nome` varchar(50) not null ,
	`rua` varchar(45) not null,
	`bairro` varchar(45) not null,
	`cep` varchar(20) not null,
	`num_residen` varchar(9) not null,
	`cidade` varchar(30) not null,
    `img_perfil` varchar(100) DEFAULT NULL,
    `idlocal` int not null Auto_increment, 
    `idtipoDlocal` int not null,
    `idusuario` int NOT NULL,
    primary key (`idlocal`)
   
);



create table avaliacao(
	`texto` longtext null,
	`foto` longblob null,
	`video` longblob null,
	`idavaliacao` int not null auto_increment,
    primary key (`idavaliacao`),
    `idlocal` int not null , 
	`idusuario` int NOT NULL
	
);



create table tipoDeLocal(
	`idtipoDlocal` int not null auto_increment,
	`tipo` varchar(45) not null,
	primary key (`idtipoDlocal`)
);



CREATE TABLE descricaoDlocal (
    id_descricao_D_Local INT NOT NULL AUTO_INCREMENT,
    descricao_1 VARCHAR(35) NOT NULL,
    descricao_2 VARCHAR(35) NOT NULL,
    descricao_3 VARCHAR(35) NOT NULL,
    descricao_4 VARCHAR(35) NOT NULL,
    descricao_5 VARCHAR(35) NOT NULL,
    descricao_6 VARCHAR(35),
    idlocal INT NOT NULL,
    PRIMARY KEY (id_descricao_D_Local)
);

CREATE TABLE `tipo_usuario` (
  `id_tipo_usuario` int NOT NULL AUTO_INCREMENT,
  `tipo_usuario` varchar(25) DEFAULT NULL,
  `descricao_usuario` varchar(155) DEFAULT NULL,
  `status_tipo_usuario` int DEFAULT '1',
  PRIMARY KEY (`id_tipo_usuario`)
);


ALTER TABLE local
ADD CONSTRAINT fk_tipoDeLocal
FOREIGN KEY (`idtipoDlocal`) REFERENCES tipoDeLocal(`idtipoDlocal`),
ADD CONSTRAINT fk_usuario
FOREIGN KEY (`idusuario`) REFERENCES usuario(`idusuario`);

ALTER TABLE avaliacao
ADD CONSTRAINT local
FOREIGN KEY (`idlocal`) REFERENCES local(`idlocal`),
ADD CONSTRAINT usuario
FOREIGN KEY (`idusuario`) REFERENCES usuario(`idusuario`);
 
ALTER TABLE usuario
ADD CONSTRAINT tipo_usuario
FOREIGN KEY (`id_tipo_usuario`) REFERENCES tipo_usuario(`id_tipo_usuario`); 

ALTER TABLE descricaodlocal
ADD CONSTRAINT fk_idlocal
FOREIGN KEY (`idlocal`) REFERENCES local(`idlocal`);

INSERT INTO `accex`.`tipo_usuario` (`id_tipo_usuario`, `tipo_usuario`, `descricao_usuario`, `status_tipo_usuario`) VALUES ('1', 'comum', 'usuario logado', '1');
INSERT INTO `accex`.`tipo_usuario` (`id_tipo_usuario`, `tipo_usuario`, `descricao_usuario`, `status_tipo_usuario`) VALUES ('2', 'proprietario', 'Usuário com acesso a consultas na área administrativa', '1');
INSERT INTO `accex`.`tipo_usuario` (`id_tipo_usuario`, `tipo_usuario`, `descricao_usuario`, `status_tipo_usuario`) VALUES ('3', 'ADM', 'Usuário com acesso a consultas e edições na área administrativa', '1');

INSERT INTO `accex`.`tipodelocal` (`tipo`) VALUES ('Universidade');
INSERT INTO `accex`.`tipodelocal` (`tipo`) VALUES ('Mercado');
INSERT INTO `accex`.`tipodelocal` (`tipo`) VALUES ('Parque');
INSERT INTO `accex`.`tipodelocal` (`tipo`) VALUES ('Restaurante');
INSERT INTO `accex`.`tipodelocal` (`tipo`) VALUES ('Hotel');
INSERT INTO `accex`.`tipodelocal` (`tipo`) VALUES ('Biblioteca');





