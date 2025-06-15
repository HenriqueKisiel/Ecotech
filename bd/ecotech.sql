-- phpMyAdmin SQL Dump
-- version 4.3.7
-- http://www.phpmyadmin.net
--
-- Host: mysql49-farm1.kinghost.net
-- Tempo de geração: 12/06/2025 às 15:35
-- Versão do servidor: 11.4.5-MariaDB-log
-- Versão do PHP: 5.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Banco de dados: `ecotech`
--
CREATE DATABASE IF NOT EXISTS `ecotech` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `ecotech`;

DELIMITER $$
--
-- Funções
--
DROP FUNCTION IF EXISTS `gerar_nome_agendamento`$$
CREATE DEFINER=`ecotech`@`10.%` FUNCTION `gerar_nome_agendamento`(`cod_agendamento` INT) RETURNS varchar(255) CHARSET latin1 COLLATE latin1_swedish_ci
    DETERMINISTIC
BEGIN
    DECLARE nome_ag VARCHAR(255);
    DECLARE cod_ag INT;
    DECLARE nome_pessoa VARCHAR(255);

    SELECT 
        a.cd_agendamento,
        COALESCE(pj.nm_razao_social, pf.nm_pessoa_fisica) AS nome_pessoa
    INTO 
        cod_ag, nome_pessoa
    FROM 
        agendamento a
    LEFT JOIN 
        pessoa_fisica pf ON a.cd_pessoa_fisica = pf.cd_pessoa_fisica
    LEFT JOIN 
        pessoa_juridica pj ON a.cd_pessoa_juridica = pj.cd_pessoa_juridica
    WHERE 

        a.cd_agendamento = cod_agendamento;

    SET nome_ag = CONCAT(cod_ag, ' - ', nome_pessoa);

    RETURN nome_ag;
END$$

DROP FUNCTION IF EXISTS `Obter_Situacao`$$
CREATE DEFINER=`ecotech`@`10.%` FUNCTION `Obter_Situacao`(ie_situacao CHAR(1)) RETURNS varchar(10) CHARSET latin1 COLLATE latin1_swedish_ci
    DETERMINISTIC
BEGIN
    IF ie_situacao = 'A' THEN
        RETURN 'Ativo';
    ELSEIF ie_situacao = 'I' THEN
        RETURN 'Inativo';
    ELSE
        RETURN NULL;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `agendamento`
--

DROP TABLE IF EXISTS `agendamento`;
CREATE TABLE IF NOT EXISTS `agendamento` (
  `cd_agendamento` int(11) NOT NULL,
  `nm_agendamento` text DEFAULT NULL,
  `dt_solicitada` date DEFAULT NULL,
  `dt_coleta` datetime DEFAULT NULL,
  `dt_separacao` date DEFAULT NULL,
  `dt_pesagem` datetime DEFAULT NULL,
  `dt_cancelado` datetime DEFAULT NULL,
  `cd_pessoa_fisica` int(11) DEFAULT NULL,
  `cd_pessoa_juridica` int(11) DEFAULT NULL,
  `ds_endereco` varchar(255) NOT NULL,
  `nm_bairro` varchar(20) DEFAULT NULL,
  `nm_cidade` varchar(20) DEFAULT NULL,
  `uf_estado` varchar(2) DEFAULT NULL,
  `nr_cep` varchar(8) DEFAULT NULL,
  `nr_resid` int(5) DEFAULT NULL,
  `qt_quantidade_prevista_kg` decimal(10,2) NOT NULL,
  `qt_peso_real` decimal(10,2) NOT NULL,
  `volume_agendamento` decimal(10,4) DEFAULT NULL,
  `vlr_previsto_reais` decimal(10,2) DEFAULT NULL,
  `status` enum('ativo','cancelado') DEFAULT 'ativo',
  `ds_motivo` varchar(100) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `agendamento`
--

INSERT INTO `agendamento` (`cd_agendamento`, `nm_agendamento`, `dt_solicitada`, `dt_coleta`, `dt_separacao`, `dt_pesagem`, `dt_cancelado`, `cd_pessoa_fisica`, `cd_pessoa_juridica`, `ds_endereco`, `nm_bairro`, `nm_cidade`, `uf_estado`, `nr_cep`, `nr_resid`, `qt_quantidade_prevista_kg`, `qt_peso_real`, `volume_agendamento`, `vlr_previsto_reais`, `status`, `ds_motivo`) VALUES
(1, '1 - Sophia Melo', '2025-05-30', '2025-05-28 00:00:00', NULL, '2025-06-11 18:58:04', NULL, 87, NULL, 'Rua Antônio Rechetelo', 'Fazendinha', 'Curitiba', 'PR', '81320170', 1487, '128.00', '377.50', '1.2833', NULL, 'ativo', NULL),
(2, '2 - Sandra e Teresinha Publicidade e Propaganda ME', '2025-05-30', '2025-06-11 18:30:17', NULL, NULL, NULL, NULL, 6, 'Rua Giácomo Santoro', 'Campo Comprido', 'Curitiba', 'PR', '81220175', 452, '144.20', '0.00', '0.7081', NULL, 'ativo', NULL),
(3, '3 - Nicolas Natan', '2025-05-30', NULL, NULL, NULL, '2025-06-11 18:30:28', 5, NULL, 'Rua Carlos Klemtz', 'Fazendinha', 'Curitiba', 'PR', '81320000', 1410, '183.70', '0.00', '2.1250', NULL, 'ativo', 'Ausência do responsável'),
(4, '4 - Alceu Henrique Machado', '2025-05-27', '2025-05-27 23:10:49', '2025-05-28', NULL, NULL, 25, NULL, 'Rua Omar Raymundo Picheth', 'Xaxim', 'Curitiba', 'PR', '81810150', 753, '1800.00', '2300.00', '21.0600', NULL, 'ativo', NULL),
(5, '5 - Alceu Henrique Machado', '2025-05-31', NULL, NULL, NULL, NULL, 25, NULL, 'Rua Carlos Klemtz', 'Fazendinha', 'Curitiba', 'PR', '81320000', 1410, '1375.00', '0.00', '14.9875', NULL, 'ativo', NULL),
(6, '6 - Henrique Kisel LTDA', '2024-12-28', '2025-01-02 06:56:21', NULL, NULL, NULL, NULL, 9, 'Rua do Escriturário', 'Boqueirão', 'Curitiba', 'PR', '81730180', 1541, '344.00', '372.00', '3.7300', NULL, 'ativo', NULL),
(7, '7 - Joaquim e Marlene Telecom Ltda', '2025-02-05', '2025-02-12 01:56:24', NULL, NULL, NULL, NULL, 7, 'Rua Waldemar Kost', 'Hauer', 'Curitiba', 'PR', '81630180', 520, '256.00', '260.00', '2.5024', NULL, 'ativo', NULL),
(8, '8 - Guilherme Mendes da Silva', '2025-03-07', '2025-03-03 13:26:12', NULL, NULL, NULL, 35, NULL, 'Rua São Pedro Maria Chanel', 'Cidade Industrial', 'Curitiba', 'PR', '81450180', 147, '76.50', '95.00', '0.3594', NULL, 'ativo', NULL),
(9, '9 - INF informatica e telecom LTDA', '2025-04-15', '2025-04-16 13:56:48', NULL, NULL, NULL, NULL, 8, 'Rua Sérgio Navarro', 'Fazendinha', 'Curitiba', 'PR', '81320160', 1451, '550.00', '600.00', '5.9950', NULL, 'ativo', NULL),
(10, '10 - Henrique Kisiel Rosa', '2025-05-28', '2025-05-28 19:36:02', NULL, NULL, NULL, 91, NULL, 'Rua Omar Raymundo Picheth', 'Xaxim', 'Curitiba', 'PR', '81810150', 753, '198.00', '174.00', '1.1340', NULL, 'ativo', NULL),
(11, '11 - Nicolas Natan', '2025-06-13', '2025-05-28 19:36:07', NULL, NULL, NULL, 5, NULL, 'Rua Alfredo José Pinto', 'Fazendinha', 'Curitiba', 'PR', '81320180', 1410, '372.50', '433.87', '1.8625', NULL, 'ativo', NULL),
(12, '12 - Joaquim e Marlene Telecom Ltda', '2025-05-28', '2025-05-28 19:40:20', NULL, NULL, NULL, NULL, 7, 'Rua Alfredo José Pinto', 'Fazendinha', 'Curitiba', 'PR', '81320180', 1410, '357.00', '341.00', '2.7585', NULL, 'ativo', NULL),
(13, '13 - Alceu Henrique Machado', '2025-05-28', NULL, NULL, NULL, NULL, 25, NULL, 'Rua Zeferino da Costa', 'Xaxim', 'Curitiba', 'PR', '81810030', 243, '626.00', '0.00', '2.5052', NULL, 'ativo', NULL),
(14, '14 - Cauê Noah Caldeira', '2025-05-28', NULL, NULL, NULL, '2025-06-04 00:00:00', 70, NULL, 'Rua João Dembinski', 'Cidade Industrial', 'Curitiba', 'PR', '81240270', 5437, '468.00', '0.00', '3.7764', NULL, 'ativo', 'Ausência do responsável'),
(15, '15 - Guilherme Mendes da Silva', '2025-05-30', NULL, NULL, NULL, NULL, 35, NULL, 'Rua Barão de Santo Ângelo', 'Xaxim', 'Curitiba', 'PR', '81810140', 546, '832.00', '0.00', '9.0324', NULL, 'ativo', NULL),
(16, '16 - Alceu Henrique Machado', '2025-05-28', '2025-05-28 20:02:50', '2025-05-28', NULL, NULL, 25, NULL, 'Rua Frei Gaspar da Madre de Deus', 'Portão', 'Curitiba', 'PR', '81070090', 339, '297.50', '310.00', '3.1168', NULL, 'ativo', NULL),
(17, '17 - Nicolas Natan', '2025-06-10', '2025-06-10 22:03:07', NULL, NULL, NULL, 5, NULL, 'Rua Alfredo José Pinto', 'Fazendinha', 'Curitiba', 'PR', '81320180', 1410, '275.00', '0.00', '2.9975', NULL, 'ativo', NULL),
(18, '18 - Nicolas Natan', '2025-06-11', '2025-06-10 22:12:02', NULL, NULL, NULL, 5, NULL, 'Rua Alfredo José Pinto', 'Fazendinha', 'Curitiba', 'PR', '81320180', 1410, '3.00', '0.00', '0.0090', NULL, 'ativo', NULL),
(19, '19 - Nicolas Natan', '2025-06-10', '2025-06-10 22:23:54', '2025-06-11', '2025-06-11 19:07:48', NULL, 5, NULL, 'Rua Alfredo José Pinto', 'Fazendinha', 'Curitiba', 'PR', '81320180', 1851, '265.00', '275.00', '2.8830', NULL, 'ativo', NULL),
(20, '20 - Nicolas Natan', '2025-06-10', '2025-06-10 22:29:59', '2025-06-11', '2025-06-11 19:01:36', NULL, 5, NULL, 'Rua Carlos Klemtz', 'Fazendinha', 'Curitiba', 'PR', '81320000', 1410, '300.00', '300.00', '3.5100', NULL, 'ativo', NULL),
(21, '21 - Nicolas Natan', '2025-06-11', '2025-06-11 19:55:16', NULL, NULL, NULL, 5, NULL, 'Rua Carlos Klemtz', 'Fazendinha', 'Curitiba', 'PR', '81320000', 1410, '8.00', '0.00', '0.0152', NULL, 'ativo', NULL),
(22, '22 - Alceu Henrique Machado', '2025-06-11', '2025-06-11 20:11:27', '2025-06-11', '2025-06-11 20:12:29', NULL, 25, NULL, 'Rua Mahatma Gandhi', 'Xaxim', 'Curitiba', 'PR', '81810130', 246, '128.00', '140.00', '0.7112', NULL, 'ativo', NULL);

--
-- Gatilhos `agendamento`
--
DROP TRIGGER IF EXISTS `before_agendamento_insert`;
DELIMITER $$
CREATE TRIGGER `before_agendamento_insert` BEFORE INSERT ON `agendamento`
 FOR EACH ROW BEGIN
    SET NEW.nm_agendamento = gerar_nome_agendamento(NEW.cd_agendamento);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `before_agendamento_update`;
DELIMITER $$
CREATE TRIGGER `before_agendamento_update` BEFORE UPDATE ON `agendamento`
 FOR EACH ROW BEGIN
    SET NEW.nm_agendamento = gerar_nome_agendamento(NEW.cd_agendamento);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bairro`
--

DROP TABLE IF EXISTS `bairro`;
CREATE TABLE IF NOT EXISTS `bairro` (
  `cd_bairro` int(11) NOT NULL,
  `nm_bairro` varchar(100) NOT NULL,
  `cd_cidade` int(11) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `bairro`
--

INSERT INTO `bairro` (`cd_bairro`, `nm_bairro`, `cd_cidade`) VALUES
(1, 'Fazendinha', 1),
(2, 'Jurerê Internacional', 2),
(3, 'Moinhos de Vento', 3),
(4, 'Alto Boqueirão', 1),
(5, 'Centro', 1),
(6, 'Centro', 2),
(7, 'Centro', 3),
(8, 'Centro', 4),
(9, 'Portão', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `caminhao`
--

DROP TABLE IF EXISTS `caminhao`;
CREATE TABLE IF NOT EXISTS `caminhao` (
  `id_caminhao` int(11) NOT NULL,
  `nm_modelo` varchar(50) DEFAULT NULL,
  `placa` varchar(10) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `capacidade_kg` decimal(10,2) NOT NULL,
  `capacidade_volume` decimal(10,2) DEFAULT NULL,
  `ano_fabricacao` int(11) NOT NULL,
  `situacao` varchar(1) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `caminhao`
--

INSERT INTO `caminhao` (`id_caminhao`, `nm_modelo`, `placa`, `tipo`, `capacidade_kg`, `capacidade_volume`, `ano_fabricacao`, `situacao`) VALUES
(1, 'Volkswagen', 'ADY9085', 'VUC', '3000.00', '14.00', 2023, 'A'),
(2, 'Volkswagen Constellation 24.280', 'AGV6664', 'TRUCK', '14000.00', '35.00', 2022, 'A'),
(3, 'Hyundai HR', 'AWF7632', 'HR', '1800.00', '9.00', 2018, 'A');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cidade`
--

DROP TABLE IF EXISTS `cidade`;
CREATE TABLE IF NOT EXISTS `cidade` (
  `cd_cidade` int(11) NOT NULL,
  `nm_cidade` varchar(100) NOT NULL,
  `uf_estado` char(2) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `cidade`
--

INSERT INTO `cidade` (`cd_cidade`, `nm_cidade`, `uf_estado`) VALUES
(1, 'Curitiba', 'PR'),
(2, 'Florianópolis', 'SC'),
(3, 'Porto Alegre', 'RS'),
(4, 'Araucaria', 'PR');

-- --------------------------------------------------------

--
-- Estrutura para tabela `estoque`
--

DROP TABLE IF EXISTS `estoque`;
CREATE TABLE IF NOT EXISTS `estoque` (
  `cd_estoque` int(11) NOT NULL,
  `nm_estoque` varchar(100) NOT NULL,
  `cd_planta` int(11) NOT NULL,
  `qt_capacidade_atual` decimal(10,3) DEFAULT NULL,
  `qt_disponivel_volume` decimal(15,8) NOT NULL DEFAULT 0.00000000,
  `qt_volume_total` decimal(15,8) DEFAULT NULL,
  `qt_volume_atual` decimal(15,8) DEFAULT NULL,
  `dt_atualizacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `estoque`
--

INSERT INTO `estoque` (`cd_estoque`, `nm_estoque`, `cd_planta`, `qt_capacidade_atual`, `qt_disponivel_volume`, `qt_volume_total`, `qt_volume_atual`, `dt_atualizacao`) VALUES
(10, 'Estoque Metal', 65, '550.000', '199.94450000', '200.00000000', '0.05550000', '2025-06-11 21:04:22'),
(11, 'Estoque Baterias', 65, '9900.000', '101.17000001', '200.00000000', '98.82999999', '2025-06-11 21:04:50'),
(12, 'Estoque Placas', 13, '0.000', '500.00000000', '500.00000000', '0.00000000', '2025-05-27 09:35:28'),
(13, 'Estoque Metal', 34, '0.000', '500.00000000', '500.00000000', NULL, '2025-05-28 21:09:02'),
(14, 'Estoque Plástico', 54, '0.000', '500.00000000', '500.00000000', NULL, '2025-05-28 21:09:08'),
(16, 'Estoque Descarte', 10, '0.000', '500.00000000', '500.00000000', '0.00000000', '2025-06-11 05:04:37'),
(17, 'Estoque Vidro ', 65, '5000.000', '98.00000000', '100.00000000', '2.00000000', '2025-06-11 23:15:55'),
(24, 'Estoque Metal', 31, '590.000', '79.93400000', '120.00000000', '40.06600000', '2025-06-11 22:08:28'),
(25, 'Estoque Plástico', 31, '0.000', '120.00000000', '120.00000000', '0.00000000', '2025-06-11 05:04:49'),
(26, 'Estoque Cobre', 31, '0.000', '120.00000000', '120.00000000', '0.00000000', '2025-06-11 05:04:41'),
(27, 'Estoque Descarte', 31, '9384.000', '113.91590000', '120.00000000', '6.08410000', '2025-06-11 22:04:49'),
(29, 'Estoque teste hoje', 10, NULL, '1000.00000000', '1000.00000000', NULL, '2025-06-11 02:29:17'),
(30, 'Bloco 1', 31, '140.000', '149.97860000', '150.00000000', '0.02140000', '2025-06-11 23:13:35');

--
-- Gatilhos `estoque`
--
DROP TRIGGER IF EXISTS `trg_estoque_atual_after_delete`;
DELIMITER $$
CREATE TRIGGER `trg_estoque_atual_after_delete` AFTER DELETE ON `estoque`
 FOR EACH ROW BEGIN
  UPDATE planta
    SET
      qt_capacidade_atual_kg = (
        SELECT IFNULL(SUM(qt_capacidade_atual), 0)
        FROM estoque WHERE cd_planta = OLD.cd_planta
      ),
      qt_capacidade_atual_volume = (
        SELECT IFNULL(SUM(qt_volume_atual), 0)
        FROM estoque WHERE cd_planta = OLD.cd_planta
      ),
		qt_capacidade_total_volume = (
        SELECT IFNULL(SUM(qt_volume_total), 0)
        FROM estoque WHERE cd_planta = OLD.cd_planta
      )
    WHERE cd_planta = OLD.cd_planta;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_estoque_atual_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_estoque_atual_after_insert` AFTER INSERT ON `estoque`
 FOR EACH ROW BEGIN
  UPDATE planta
    SET
      qt_capacidade_atual_kg = (
        SELECT IFNULL(SUM(qt_capacidade_atual), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      ),
      qt_capacidade_atual_volume = (
        SELECT IFNULL(SUM(qt_volume_atual), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      ),
		qt_capacidade_total_volume = (
        SELECT IFNULL(SUM(qt_volume_total), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      )
    WHERE cd_planta = NEW.cd_planta;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_estoque_atual_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_estoque_atual_after_update` AFTER UPDATE ON `estoque`
 FOR EACH ROW BEGIN
  -- Atualiza a planta antiga se mudou de planta
  IF OLD.cd_planta <> NEW.cd_planta THEN

    UPDATE planta
      SET
        qt_capacidade_atual_kg = (
          SELECT IFNULL(SUM(qt_capacidade_atual), 0)
          FROM estoque WHERE cd_planta = OLD.cd_planta
        ),
        qt_capacidade_atual_volume = (
          SELECT IFNULL(SUM(qt_volume_atual), 0)
          FROM estoque WHERE cd_planta = OLD.cd_planta
      ),
		qt_capacidade_total_volume = (
        SELECT IFNULL(SUM(qt_volume_total), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      )
      WHERE cd_planta = OLD.cd_planta;
  END IF;

  -- Atualiza a planta nova
  UPDATE planta
    SET
      qt_capacidade_atual_kg = (
        SELECT IFNULL(SUM(qt_capacidade_atual), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      ),
      qt_capacidade_atual_volume = (
        SELECT IFNULL(SUM(qt_volume_atual), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      ),
		qt_capacidade_total_volume = (
        SELECT IFNULL(SUM(qt_volume_total), 0)
        FROM estoque WHERE cd_planta = NEW.cd_planta
      )
    WHERE cd_planta = NEW.cd_planta;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_estoque_disponivel_before_insert`;
DELIMITER $$
CREATE TRIGGER `trg_estoque_disponivel_before_insert` BEFORE INSERT ON `estoque`
 FOR EACH ROW BEGIN
  SET NEW.qt_disponivel_volume = GREATEST(IFNULL(NEW.qt_volume_total,0) - IFNULL(NEW.qt_volume_atual,0), 0);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_estoque_disponivel_before_update`;
DELIMITER $$
CREATE TRIGGER `trg_estoque_disponivel_before_update` BEFORE UPDATE ON `estoque`
 FOR EACH ROW BEGIN
  SET NEW.qt_disponivel_volume = GREATEST(IFNULL(NEW.qt_volume_total,0) - IFNULL(NEW.qt_volume_atual,0), 0);
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `estoque_material`
--

DROP TABLE IF EXISTS `estoque_material`;
CREATE TABLE IF NOT EXISTS `estoque_material` (
  `cd_material_etq` int(11) NOT NULL,
  `cd_material` int(11) DEFAULT NULL,
  `ds_material` varchar(50) DEFAULT NULL,
  `cd_estoque` int(11) DEFAULT NULL,
  `qt_peso` decimal(10,3) DEFAULT NULL,
  `qt_volume` decimal(15,8) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `estoque_material`
--

INSERT INTO `estoque_material` (`cd_material_etq`, `cd_material`, `ds_material`, `cd_estoque`, `qt_peso`, `qt_volume`) VALUES
(5, 85, 'Descarte', 27, '9334.000', '6.06710000'),
(6, 78, 'Metais', 24, '565.000', '0.06570000'),
(7, 79, 'Plásticos', 24, '15.000', '40.00000000'),
(10, 80, 'Vidro', 24, '10.000', '0.00030000'),
(11, 78, 'Metais', 10, '550.000', '0.05550000'),
(14, 80, 'Vidro', 17, '5000.000', '2.00000000'),
(15, 83, 'Produtos químicos', 27, '50.000', '0.01700000'),
(16, 78, 'Metais', 30, '120.000', '0.01400000'),
(17, 81, 'Cerâmicas', 30, '20.000', '0.00740000');

--
-- Gatilhos `estoque_material`
--
DROP TRIGGER IF EXISTS `trg_material_to_estoque_after_delete`;
DELIMITER $$
CREATE TRIGGER `trg_material_to_estoque_after_delete` AFTER DELETE ON `estoque_material`
 FOR EACH ROW BEGIN
  UPDATE estoque
    SET
      qt_capacidade_atual = (
        SELECT IFNULL(SUM(qt_peso),0)
        FROM estoque_material
        WHERE cd_estoque = OLD.cd_estoque
      ),
      qt_volume_atual = (
        SELECT IFNULL(SUM(qt_volume),0)
        FROM estoque_material
        WHERE cd_estoque = OLD.cd_estoque
      )
    WHERE cd_estoque = OLD.cd_estoque;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_to_estoque_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_material_to_estoque_after_insert` AFTER INSERT ON `estoque_material`
 FOR EACH ROW BEGIN
  UPDATE estoque
    SET
      qt_capacidade_atual = (
        SELECT IFNULL(SUM(qt_peso),0)
        FROM estoque_material
        WHERE cd_estoque = NEW.cd_estoque
      ),
      qt_volume_atual = (
        SELECT IFNULL(SUM(qt_volume),0)
        FROM estoque_material
        WHERE cd_estoque = NEW.cd_estoque
      )
    WHERE cd_estoque = NEW.cd_estoque;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_to_estoque_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_material_to_estoque_after_update` AFTER UPDATE ON `estoque_material`
 FOR EACH ROW BEGIN
  -- Atualiza o estoque antigo se mudou de estoque
  IF OLD.cd_estoque <> NEW.cd_estoque THEN
    UPDATE estoque
      SET
        qt_capacidade_atual = (
          SELECT IFNULL(SUM(qt_peso),0)
          FROM estoque_material
          WHERE cd_estoque = OLD.cd_estoque
        ),
        qt_volume_atual = (
          SELECT IFNULL(SUM(qt_volume),0)
          FROM estoque_material
          WHERE cd_estoque = OLD.cd_estoque
        )
      WHERE cd_estoque = OLD.cd_estoque;
  END IF;

  -- Atualiza o estoque novo
  UPDATE estoque
    SET
      qt_capacidade_atual = (
        SELECT IFNULL(SUM(qt_peso),0)
        FROM estoque_material
        WHERE cd_estoque = NEW.cd_estoque
      ),
      qt_volume_atual = (
        SELECT IFNULL(SUM(qt_volume),0)
        FROM estoque_material
        WHERE cd_estoque = NEW.cd_estoque
      )
    WHERE cd_estoque = NEW.cd_estoque;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `Etapas`
--

DROP TABLE IF EXISTS `Etapas`;
CREATE TABLE IF NOT EXISTS `Etapas` (
  `cd_etapa` int(11) NOT NULL,
  `ds_etapa` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `etapas_processamento`
--

DROP TABLE IF EXISTS `etapas_processamento`;
CREATE TABLE IF NOT EXISTS `etapas_processamento` (
  `cd_etapa_processamento` int(11) NOT NULL,
  `cd_material` int(11) NOT NULL,
  `cd_etapa` int(11) NOT NULL,
  `ds_etapa_processamento` varchar(100) NOT NULL,
  `dt_inicio` timestamp NULL DEFAULT NULL,
  `dt_fim` timestamp NULL DEFAULT NULL,
  `Peso` decimal(10,2) DEFAULT NULL,
  `ie_status` char(1) NOT NULL DEFAULT 'P',
  `ds_observacao` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `feedback`
--

DROP TABLE IF EXISTS `feedback`;
CREATE TABLE IF NOT EXISTS `feedback` (
  `cd_feedback` int(11) NOT NULL,
  `cd_agendamento` int(11) NOT NULL,
  `ds_feedback` varchar(255) DEFAULT NULL,
  `nr_nota` int(11) NOT NULL,
  `dt_feedback` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `feedback`
--

INSERT INTO `feedback` (`cd_feedback`, `cd_agendamento`, `ds_feedback`, `nr_nota`, `dt_feedback`) VALUES
(1, 18, 'Boa dms', 5, '2025-06-11 01:20:53'),
(2, 17, 'lixo', 1, '2025-06-11 01:40:16'),
(4, 22, 'Aula ', 5, '2025-06-11 23:18:47');

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_de_linha`
--

DROP TABLE IF EXISTS `itens_de_linha`;
CREATE TABLE IF NOT EXISTS `itens_de_linha` (
  `cd_item` int(11) NOT NULL,
  `ds_item` varchar(500) NOT NULL,
  `cd_linha` int(5) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `itens_de_linha`
--

INSERT INTO `itens_de_linha` (`cd_item`, `ds_item`, `cd_linha`) VALUES
(1, 'Geladeira', NULL),
(2, 'Computadores desktops', NULL),
(3, 'Componentes de Áudio', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `linha`
--

DROP TABLE IF EXISTS `linha`;
CREATE TABLE IF NOT EXISTS `linha` (
  `cd_linha` int(11) NOT NULL,
  `nm_linha` varchar(50) NOT NULL,
  `ie_itens_linha` int(11) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `linha`
--

INSERT INTO `linha` (`cd_linha`, `nm_linha`, `ie_itens_linha`) VALUES
(1, 'Linha Azul', 1),
(2, 'Linha Verde', 2),
(3, 'Linha Laranja', 3),
(4, 'Linha Vermelha', NULL),
(5, 'Matéria Prima', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `materiais`
--

DROP TABLE IF EXISTS `materiais`;
CREATE TABLE IF NOT EXISTS `materiais` (
  `cd_material` int(11) NOT NULL,
  `ds_material` varchar(100) NOT NULL,
  `vl_valor_por_kg` decimal(10,2) NOT NULL,
  `ie_linha` int(11) DEFAULT NULL,
  `dt_cadastro` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `peso_padrao` decimal(10,3) DEFAULT NULL,
  `volume_m3` decimal(7,5) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `materiais`
--

INSERT INTO `materiais` (`cd_material`, `ds_material`, `vl_valor_por_kg`, `ie_linha`, `dt_cadastro`, `peso_padrao`, `volume_m3`) VALUES
(1, 'Geladeira', '20.00', 4, '2025-06-11 04:14:48', '55.000', '0.01090'),
(39, 'Celular', '50.00', 2, '2025-05-25 18:44:34', '0.200', '0.00042'),
(56, 'Secador', '15.00', 1, '2025-05-25 18:44:46', '0.700', '0.00570'),
(57, 'Notebook', '20.00', 2, '2025-05-25 18:44:55', '2.000', '0.00250'),
(58, ' Computador Desktop', '10.00', 2, '2025-05-25 18:47:56', '8.000', '0.00500'),
(60, 'Filmadora', '8.00', 3, '2025-05-25 18:45:49', '0.800', '0.00190'),
(61, 'Freezer', '15.00', 4, '2025-05-25 18:46:07', '60.000', '0.01170'),
(62, 'Maquina de Lavar', '17.00', 4, '2025-05-25 18:48:03', '60.000', '0.01170'),
(63, 'Batedeira', '5.00', 1, '2025-05-25 18:46:35', '3.000', '0.00500'),
(64, 'Centrifuga', '7.00', 1, '2025-05-25 18:46:51', '12.000', '0.00500'),
(65, 'Torradeira', '8.00', 1, '2025-05-25 18:47:02', '1.500', '0.00530'),
(66, 'Maquina de Costura', '9.00', 1, '2025-05-25 18:47:18', '12.000', '0.00580'),
(67, 'Liquidificador', '15.00', 1, '2025-05-25 18:47:27', '2.500', '0.00480'),
(68, 'Brinquedo Eletrônico', '8.00', 1, '2025-05-25 18:48:17', '0.500', '0.00500'),
(70, 'Tablet', '25.00', 2, '2025-05-25 18:48:38', '0.500', '0.00300'),
(71, 'Impressora', '27.00', 2, '2025-05-25 18:48:52', '6.000', '0.00500'),
(73, 'Copiadora', '7.00', 2, '2025-05-25 18:49:06', '50.000', '0.01000'),
(75, 'Projetor', '5.00', 3, '2025-05-25 18:49:14', '3.000', '0.00400'),
(77, 'Micro-ondas', '8.00', 4, '2025-05-25 18:49:21', '13.000', '0.00460'),
(78, 'Metais', '10.00', 5, '2025-05-25 23:05:34', '1.000', '0.00013'),
(79, 'Plásticos', '10.00', 5, '2025-05-25 23:06:25', '1.000', '0.00012'),
(80, 'Vidro', '10.00', 5, '2025-05-25 23:16:12', '1.000', '0.00040'),
(81, 'Cerâmicas', '10.00', 5, '2025-05-25 23:21:14', '1.000', '0.00042'),
(82, 'Materiais Orgânicos', '10.00', 5, '2025-05-25 03:00:00', '1.000', '0.00125'),
(83, 'Produtos químicos', '10.00', 5, '2025-05-25 03:00:00', '1.000', '0.00054'),
(85, 'Descarte', '1.00', 5, '2025-05-26 03:00:00', '1.000', '0.00065');

-- --------------------------------------------------------

--
-- Estrutura para tabela `materiais_agenda`
--

DROP TABLE IF EXISTS `materiais_agenda`;
CREATE TABLE IF NOT EXISTS `materiais_agenda` (
  `cd_mat_agenda` int(11) NOT NULL,
  `ie_agenda` int(11) DEFAULT NULL,
  `ie_material` int(10) DEFAULT NULL,
  `ds_mat_agenda` varchar(100) NOT NULL,
  `ie_linha` int(11) NOT NULL,
  `qt_peso_material_total_kg` decimal(10,4) DEFAULT NULL,
  `qt_peso_final` decimal(10,4) DEFAULT NULL,
  `qtde_material` int(10) DEFAULT NULL,
  `volume_m3_material` decimal(10,4) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `materiais_agenda`
--

INSERT INTO `materiais_agenda` (`cd_mat_agenda`, `ie_agenda`, `ie_material`, `ds_mat_agenda`, `ie_linha`, `qt_peso_material_total_kg`, `qt_peso_final`, `qtde_material`, `volume_m3_material`) VALUES
(1, 1, 1, 'Geladeira', 4, '110.0000', '350.0000', 2, '1.1990'),
(2, 1, 77, 'Micro-ondas', 4, '13.0000', '15.0000', 1, '0.0598'),
(3, 1, 67, 'Liquidificador', 1, '2.5000', '5.1000', 1, '0.0120'),
(4, 1, 68, 'Brinquedo Eletrônico', 1, '2.5000', '7.4000', 5, '0.0125'),
(5, 2, 58, ' Computador Desktop', 2, '120.0000', NULL, 15, '0.6000'),
(6, 2, 71, 'Impressora', 2, '18.0000', NULL, 3, '0.0900'),
(7, 2, 60, 'Filmadora', 3, '3.2000', NULL, 4, '0.0061'),
(8, 2, 75, 'Projetor', 3, '3.0000', NULL, 1, '0.0120'),
(9, 3, 62, 'Maquina de Lavar', 4, '180.0000', NULL, 3, '2.1060'),
(10, 3, 63, 'Batedeira', 1, '3.0000', NULL, 1, '0.0150'),
(11, 3, 56, 'Secador', 1, '0.7000', NULL, 1, '0.0040'),
(12, 4, 62, 'Maquina de Lavar', 4, '900.0000', '1350.0000', 15, '10.5300'),
(13, 4, 62, 'Maquina de Lavar', 4, '900.0000', '950.0000', 15, '10.5300'),
(14, 5, 1, 'Geladeira', 4, '1375.0000', NULL, 25, '14.9875'),
(15, 6, 61, 'Freezer', 4, '300.0000', '325.0000', 5, '3.5100'),
(16, 6, 58, ' Computador Desktop', 2, '32.0000', '35.0000', 4, '0.1600'),
(17, 6, 71, 'Impressora', 2, '12.0000', '12.0000', 2, '0.0600'),
(18, 7, 39, 'Celular', 2, '6.0000', '10.0000', 30, '0.0024'),
(19, 7, 73, 'Copiadora', 2, '250.0000', '250.0000', 5, '2.5000'),
(20, 8, 67, 'Liquidificador', 1, '37.5000', '40.0000', 15, '0.1800'),
(21, 8, 77, 'Micro-ondas', 4, '39.0000', '55.0000', 3, '0.1794'),
(22, 9, 1, 'Geladeira', 4, '550.0000', '600.0000', 10, '5.9950'),
(23, 10, 66, 'Maquina de Costura', 1, '180.0000', '149.0000', 15, '1.0440'),
(24, 11, 68, 'Brinquedo Eletrônico', 1, '12.5000', '72.8700', 25, '0.0625'),
(25, 11, 64, 'Centrifuga', 1, '360.0000', '361.0000', 30, '1.8000'),
(26, 12, 71, 'Impressora', 2, '192.0000', '196.0000', 32, '0.9600'),
(27, 12, 1, 'Geladeira', 4, '165.0000', '145.0000', 3, '1.7985'),
(28, 10, 71, 'Impressora', 2, '18.0000', '25.0000', 3, '0.0900'),
(29, 13, 60, 'Filmadora', 3, '8.0000', NULL, 10, '0.0152'),
(30, 13, 71, 'Impressora', 2, '18.0000', NULL, 3, '0.0900'),
(31, 14, 66, 'Maquina de Costura', 1, '288.0000', NULL, 24, '1.6704'),
(32, 13, 75, 'Projetor', 3, '600.0000', NULL, 200, '2.4000'),
(33, 14, 61, 'Freezer', 4, '180.0000', NULL, 3, '2.1060'),
(34, 15, 1, 'Geladeira', 4, '825.0000', NULL, 15, '8.9925'),
(35, 16, 65, 'Torradeira', 1, '22.5000', '30.0000', 15, '0.1193'),
(36, 16, 1, 'Geladeira', 4, '275.0000', '280.0000', 5, '2.9975'),
(37, 15, 56, 'Secador', 1, '7.0000', NULL, 10, '0.0399'),
(38, 17, 1, 'Geladeira', 4, '275.0000', NULL, 5, '2.9975'),
(39, 18, 70, 'Tablet', 2, '3.0000', NULL, 6, '0.0090'),
(40, 19, 70, 'Tablet', 2, '25.0000', '25.0000', 50, '0.0750'),
(41, 19, 61, 'Freezer', 4, '240.0000', '250.0000', 4, '2.8080'),
(42, 20, 62, 'Maquina de Lavar', 4, '300.0000', '300.0000', 5, '3.5100'),
(43, 21, 60, 'Filmadora', 3, '8.0000', NULL, 10, '0.0152'),
(44, 22, 66, 'Maquina de Costura', 1, '120.0000', '130.0000', 10, '0.6960'),
(45, 22, 60, 'Filmadora', 3, '8.0000', '10.0000', 10, '0.0152');

--
-- Gatilhos `materiais_agenda`
--
DROP TRIGGER IF EXISTS `trg_atualiza_volume_after_delete`;
DELIMITER $$
CREATE TRIGGER `trg_atualiza_volume_after_delete` AFTER DELETE ON `materiais_agenda`
 FOR EACH ROW BEGIN
    UPDATE agendamento
    SET volume_agendamento = (
        SELECT IFNULL(SUM(volume_m3_material), 0)
        FROM materiais_agenda
        WHERE ie_agenda = OLD.ie_agenda
    )
    WHERE cd_agendamento = OLD.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_atualiza_volume_after_insert`;
DELIMITER $$
CREATE TRIGGER `trg_atualiza_volume_after_insert` AFTER INSERT ON `materiais_agenda`
 FOR EACH ROW BEGIN
    UPDATE agendamento
    SET volume_agendamento = (
        SELECT IFNULL(SUM(volume_m3_material), 0)
        FROM materiais_agenda
        WHERE ie_agenda = NEW.ie_agenda
    )
    WHERE cd_agendamento = NEW.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_atualiza_volume_after_update`;
DELIMITER $$
CREATE TRIGGER `trg_atualiza_volume_after_update` AFTER UPDATE ON `materiais_agenda`
 FOR EACH ROW BEGIN
    UPDATE agendamento
    SET volume_agendamento = (
        SELECT IFNULL(SUM(volume_m3_material), 0)
        FROM materiais_agenda
        WHERE ie_agenda = NEW.ie_agenda
    )
    WHERE cd_agendamento = NEW.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_calcula_peso_volume_material`;
DELIMITER $$
CREATE TRIGGER `trg_calcula_peso_volume_material` BEFORE INSERT ON `materiais_agenda`
 FOR EACH ROW BEGIN
    DECLARE v_peso_padrao DECIMAL(10,4) DEFAULT 0;
    DECLARE v_volume_padrao DECIMAL(10,4) DEFAULT 0;

    -- Busca os valores padrão do material
    SELECT peso_padrao, volume_m3
      INTO v_peso_padrao, v_volume_padrao
      FROM materiais
     WHERE cd_material = NEW.ie_material;

    -- Calcula o peso total
    SET NEW.qt_peso_material_total_kg = IFNULL(NEW.qtde_material, 0) * IFNULL(v_peso_padrao, 0);

    -- Calcula o volume: peso total * volume unitário
    SET NEW.volume_m3_material = IFNULL(NEW.qt_peso_material_total_kg, 0) * IFNULL(v_volume_padrao, 0);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_calcula_peso_volume_material_UPDATE`;
DELIMITER $$
CREATE TRIGGER `trg_calcula_peso_volume_material_UPDATE` BEFORE UPDATE ON `materiais_agenda`
 FOR EACH ROW BEGIN
    DECLARE v_peso_padrao DECIMAL(10,4) DEFAULT 0;
    DECLARE v_volume_padrao DECIMAL(10,4) DEFAULT 0;

    -- Busca os valores padrão do material
    SELECT peso_padrao, volume_m3
      INTO v_peso_padrao, v_volume_padrao
      FROM materiais
     WHERE cd_material = NEW.ie_material;

    -- Calcula o peso total
    SET NEW.qt_peso_material_total_kg = IFNULL(NEW.qtde_material, 0) * IFNULL(v_peso_padrao, 0);

    -- Calcula o volume: peso total * volume unitário
    SET NEW.volume_m3_material = IFNULL(NEW.qt_peso_material_total_kg, 0) * IFNULL(v_volume_padrao, 0);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_delete`;
DELIMITER $$
CREATE TRIGGER `trg_material_delete` AFTER DELETE ON `materiais_agenda`
 FOR EACH ROW BEGIN
  UPDATE agendamento
  SET qt_quantidade_prevista_kg = (
    SELECT IFNULL(SUM(qt_peso_material_total_kg), 0)
    FROM materiais_agenda
    WHERE ie_agenda = OLD.ie_agenda
  )
  WHERE cd_agendamento = OLD.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_final_delete`;
DELIMITER $$
CREATE TRIGGER `trg_material_final_delete` AFTER DELETE ON `materiais_agenda`
 FOR EACH ROW BEGIN
  UPDATE agendamento
  SET qt_peso_real = (
    SELECT IFNULL(SUM(qt_peso_final), 0)
    FROM materiais_agenda
    WHERE ie_agenda = OLD.ie_agenda
  )
  WHERE cd_agendamento = OLD.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_final_insert`;
DELIMITER $$
CREATE TRIGGER `trg_material_final_insert` AFTER INSERT ON `materiais_agenda`
 FOR EACH ROW BEGIN
  UPDATE agendamento
  SET qt_peso_real = (
    SELECT IFNULL(SUM(qt_peso_final), 0)
    FROM materiais_agenda
    WHERE ie_agenda = NEW.ie_agenda
  )
  WHERE cd_agendamento = NEW.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_final_update`;
DELIMITER $$
CREATE TRIGGER `trg_material_final_update` AFTER UPDATE ON `materiais_agenda`
 FOR EACH ROW BEGIN
  -- Atualiza o novo agendamento
  UPDATE agendamento
  SET qt_peso_real = (

    SELECT IFNULL(SUM(qt_peso_final), 0)
    FROM materiais_agenda
    WHERE ie_agenda = NEW.ie_agenda
  )
  WHERE cd_agendamento = NEW.ie_agenda;

  -- Se mudou o agendamento, atualiza o antigo também
  IF OLD.ie_agenda <> NEW.ie_agenda THEN
    UPDATE agendamento
    SET qt_peso_real = (
      SELECT IFNULL(SUM(qt_peso_final), 0)
      FROM materiais_agenda
      WHERE ie_agenda = OLD.ie_agenda
    )
    WHERE cd_agendamento = OLD.ie_agenda;
  END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_insert`;
DELIMITER $$
CREATE TRIGGER `trg_material_insert` AFTER INSERT ON `materiais_agenda`
 FOR EACH ROW BEGIN
  UPDATE agendamento
  SET qt_quantidade_prevista_kg = (
    SELECT IFNULL(SUM(qt_peso_material_total_kg), 0)
    FROM materiais_agenda
    WHERE ie_agenda = NEW.ie_agenda
  )
  WHERE cd_agendamento = NEW.ie_agenda;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_material_update`;
DELIMITER $$
CREATE TRIGGER `trg_material_update` AFTER UPDATE ON `materiais_agenda`
 FOR EACH ROW BEGIN
  -- Atualiza o novo agendamento
  UPDATE agendamento
  SET qt_quantidade_prevista_kg = (

    SELECT IFNULL(SUM(qt_peso_material_total_kg), 0)
    FROM materiais_agenda
    WHERE ie_agenda = NEW.ie_agenda
  )
  WHERE cd_agendamento = NEW.ie_agenda;

  -- Se mudou o agendamento, atualiza o antigo também
  IF OLD.ie_agenda <> NEW.ie_agenda THEN
    UPDATE agendamento
    SET qt_quantidade_prevista_kg = (
      SELECT IFNULL(SUM(qt_peso_material_total_kg), 0)
      FROM materiais_agenda
      WHERE ie_agenda = OLD.ie_agenda
    )
    WHERE cd_agendamento = OLD.ie_agenda;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `motorista`
--

DROP TABLE IF EXISTS `motorista`;
CREATE TABLE IF NOT EXISTS `motorista` (
  `id_motorista` int(11) NOT NULL,
  `nm_motorista` varchar(100) DEFAULT NULL,
  `ie_pessoa` int(11) NOT NULL,
  `cnh` varchar(20) NOT NULL,
  `categoria_cnh` char(1) NOT NULL,
  `vencimento_cnh` date NOT NULL,
  `situacao` varchar(1) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `motorista`
--

INSERT INTO `motorista` (`id_motorista`, `nm_motorista`, `ie_pessoa`, `cnh`, `categoria_cnh`, `vencimento_cnh`, `situacao`) VALUES
(1, 'Nicolas Natal', 5, '01545904709', 'D', '2025-09-26', 'A'),
(2, 'Henrique Kisiel Rosa', 91, '63988928238', 'D', '2027-05-31', 'A'),
(3, 'Felipe Enzo Santos', 84, '42274710600', 'C', '2029-04-27', 'A'),
(4, 'Alceu Henrique Machado', 25, '71321751665', 'D', '2025-09-25', 'A');

--
-- Gatilhos `motorista`
--
DROP TRIGGER IF EXISTS `tr_motorista_insert`;
DELIMITER $$
CREATE TRIGGER `tr_motorista_insert` BEFORE INSERT ON `motorista`
 FOR EACH ROW BEGIN
    DECLARE nome_pf VARCHAR(100);
    
    SELECT nm_pessoa_fisica INTO nome_pf
    FROM pessoa_fisica
    WHERE cd_pessoa_fisica = NEW.ie_pessoa;
    
    SET NEW.nm_motorista = nome_pf;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `tr_motorista_update`;
DELIMITER $$
CREATE TRIGGER `tr_motorista_update` BEFORE UPDATE ON `motorista`
 FOR EACH ROW BEGIN
    DECLARE nome_pf VARCHAR(100);
    
    -- Só atualiza se ie_pessoa foi modificado ou se nm_motorista está NULL
    IF NEW.ie_pessoa != OLD.ie_pessoa OR NEW.nm_motorista IS NULL THEN
        SELECT nm_pessoa_fisica INTO nome_pf
        FROM pessoa_fisica
        WHERE cd_pessoa_fisica = NEW.ie_pessoa;
        
        SET NEW.nm_motorista = nome_pf;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `movimentacoes`
--

DROP TABLE IF EXISTS `movimentacoes`;
CREATE TABLE IF NOT EXISTS `movimentacoes` (
  `cd_movimentacao` int(11) NOT NULL,
  `cd_estoque` int(11) NOT NULL,
  `cd_material` int(11) NOT NULL,
  `cd_agendamento` int(11) DEFAULT NULL,
  `qt_volume` decimal(15,8) NOT NULL,
  `qt_peso` decimal(10,3) NOT NULL,
  `tipo_movimentacao` varchar(10) NOT NULL,
  `ds_motivo` varchar(100) DEFAULT NULL,
  `cd_pessoa_fisica` int(11) DEFAULT NULL,
  `cd_pessoa_juridica` int(11) DEFAULT NULL,
  `vl_valor_por_kg` decimal(10,2) DEFAULT NULL,
  `dt_movimentacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `movimentacoes`
--

INSERT INTO `movimentacoes` (`cd_movimentacao`, `cd_estoque`, `cd_material`, `cd_agendamento`, `qt_volume`, `qt_peso`, `tipo_movimentacao`, `ds_motivo`, `cd_pessoa_fisica`, `cd_pessoa_juridica`, `vl_valor_por_kg`, `dt_movimentacao`) VALUES
(1, 16, 68, NULL, '0.00500000', '1.000', 'entrada', 'uhdvughvhjgcxhjvg', NULL, NULL, NULL, '2025-05-28 01:36:03'),
(2, 24, 1, NULL, '54.50000000', '5000.000', 'entrada', 'Correção de Estoque', NULL, NULL, NULL, '2025-05-28 03:10:47'),
(3, 25, 62, NULL, '40.95000000', '3500.000', 'entrada', 'correção de estoque', NULL, NULL, NULL, '2025-05-28 03:11:33'),
(4, 26, 77, NULL, '30.82000000', '6700.000', 'entrada', 'correção de estoque', NULL, NULL, NULL, '2025-05-28 03:12:06'),
(5, 27, 85, NULL, '6.06710000', '9334.000', 'entrada', 'correção de estoque', NULL, NULL, NULL, '2025-05-28 03:14:04'),
(6, 24, 78, 4, '0.00030000', '10.000', 'entrada', 'Gerada pela separação do Agendamento 4', NULL, NULL, NULL, '2025-05-28 03:15:25'),
(7, 24, 1, NULL, '17.09120000', '1568.000', 'venda', NULL, NULL, 7, '31360.00', '2025-01-28 20:06:48'),
(8, 25, 62, NULL, '10.53000000', '900.000', 'venda', NULL, NULL, 9, '15300.00', '2025-02-28 20:07:32'),
(9, 26, 77, NULL, '10.58000000', '2300.000', 'venda', NULL, NULL, 8, '18400.00', '2025-03-28 20:08:16'),
(10, 25, 62, NULL, '17.55000000', '1500.000', 'venda', NULL, 91, NULL, '25500.00', '2025-04-28 20:09:01'),
(11, 26, 77, NULL, '5.52000000', '1200.000', 'venda', NULL, 91, NULL, '9600.00', '2025-05-28 20:09:31'),
(12, 25, 62, NULL, '0.46800000', '40.000', 'saida', 'Correção de Estoque', NULL, NULL, NULL, '2025-05-28 15:16:48'),
(13, 24, 79, 4, '40.00000000', '15.000', 'entrada', 'Gerada pela separação do Agendamento 4', NULL, NULL, NULL, '2025-05-28 16:31:23'),
(19, 24, 78, 4, '0.00030000', '10.000', 'entrada', 'Gerada pela separação do Agendamento 4', NULL, NULL, NULL, '2025-05-28 20:11:30'),
(20, 10, 61, NULL, '17.55000000', '1500.000', 'entrada', 'Correção de estoque', NULL, NULL, NULL, '2025-05-28 20:12:57'),
(22, 24, 78, 4, '0.00030000', '10.000', 'entrada', 'Gerada pela separação do Agendamento 4', NULL, NULL, NULL, '2025-05-28 20:21:32'),
(23, 24, 78, 4, '0.00030000', '10.000', 'entrada', 'Gerada pela separação do Agendamento 4', NULL, NULL, NULL, '2025-05-28 20:29:26'),
(24, 24, 80, 4, '0.00030000', '10.000', 'entrada', 'Gerada pela separação do Agendamento 4', NULL, NULL, NULL, '2025-05-28 20:51:38'),
(25, 24, 78, 6, '0.00030000', '10.000', 'entrada', 'Gerada pela separação do Agendamento 6', NULL, NULL, NULL, '2025-05-28 21:13:24'),
(27, 10, 78, 16, '0.01000000', '200.000', 'entrada', 'Gerada pela separação do Agendamento 16', NULL, NULL, NULL, '2025-05-28 23:08:27'),
(30, 24, 78, NULL, '0.00130000', '10.000', 'venda', NULL, 5, NULL, '100.00', '2025-06-04 21:46:53'),
(31, 24, 1, NULL, '0.34880000', '32.000', 'venda', NULL, 5, NULL, '640.00', '2025-06-04 22:10:42'),
(33, 10, 78, NULL, '0.01300000', '100.000', 'entrada', 'Correção de estoque', NULL, NULL, NULL, '2025-06-11 20:48:08'),
(34, 10, 78, NULL, '0.03900000', '300.000', 'entrada', 'Correção de estoque', NULL, NULL, NULL, '2025-06-11 20:52:01'),
(36, 17, 79, NULL, '0.01200000', '110.000', 'saida', 'Correção de estoque', NULL, NULL, NULL, '2025-06-11 20:58:25'),
(39, 24, 78, 20, '0.03150000', '250.000', 'entrada', 'Gerada pela separação do Agendamento 20', NULL, NULL, NULL, '2025-06-11 22:02:23'),
(40, 27, 83, 20, '0.01700000', '50.000', 'entrada', 'Gerada pela separação do Agendamento 20', NULL, NULL, NULL, '2025-06-11 22:04:49'),
(41, 24, 78, 19, '0.03400000', '275.000', 'entrada', 'Gerada pela separação do Agendamento 19', NULL, NULL, NULL, '2025-06-11 22:08:29'),
(42, 30, 78, 22, '0.01400000', '120.000', 'entrada', 'Gerada pela separação do Agendamento 22', NULL, NULL, NULL, '2025-06-11 23:13:15'),
(43, 30, 81, 22, '0.00740000', '20.000', 'entrada', 'Gerada pela separação do Agendamento 22', NULL, NULL, NULL, '2025-06-11 23:13:35'),
(44, 17, 80, NULL, '2.00000000', '5000.000', 'venda', NULL, 25, NULL, '50000.00', '2025-06-11 23:15:55');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pessoa_fisica`
--

DROP TABLE IF EXISTS `pessoa_fisica`;
CREATE TABLE IF NOT EXISTS `pessoa_fisica` (
  `cd_pessoa_fisica` int(11) NOT NULL,
  `nm_pessoa_fisica` varchar(60) NOT NULL,
  `dt_nascimento` date DEFAULT NULL,
  `ie_sexo` char(1) DEFAULT NULL,
  `nr_cpf` varchar(11) DEFAULT NULL,
  `nr_telefone_celular` varchar(20) DEFAULT NULL,
  `ds_email` varchar(255) DEFAULT NULL,
  `ds_endereco` varchar(255) DEFAULT NULL,
  `nr_endereco` varchar(10) NOT NULL,
  `cd_bairro` int(11) NOT NULL,
  `nm_bairro` varchar(30) NOT NULL,
  `cd_cidade` int(11) NOT NULL,
  `nm_cidade` varchar(50) NOT NULL,
  `uf_estado` varchar(2) NOT NULL,
  `nr_cep` varchar(8) DEFAULT NULL,
  `dt_atualizacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ie_situacao` tinyint(1) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `pessoa_fisica`
--

INSERT INTO `pessoa_fisica` (`cd_pessoa_fisica`, `nm_pessoa_fisica`, `dt_nascimento`, `ie_sexo`, `nr_cpf`, `nr_telefone_celular`, `ds_email`, `ds_endereco`, `nr_endereco`, `cd_bairro`, `nm_bairro`, `cd_cidade`, `nm_cidade`, `uf_estado`, `nr_cep`, `dt_atualizacao`, `ie_situacao`) VALUES
(5, 'Nicolas Natan', '2025-05-25', 'm', '10378144952', '(41) 9852-6368', 'nicolas.natan2503@gmail.com', 'Rua Alfredo José Pinto', '1851', 1, 'Fazendinha', 1, 'Curitiba', 'PR', '81320180', '2025-05-28 01:11:01', 0),
(24, 'Nauhany Melo', '0000-00-00', 'F', '10782824986', '41995393265', 'nauhanyr@hotmail.com', 'Rua Dos Anjos', '', 1, '', 1, '', '', '81330390', '0000-00-00 00:00:00', 0),
(25, 'Alceu Henrique Machado', '2000-02-26', 'M', '10970582958', '41988285571', 'alceu14.ah@gmail.com', 'Rua joão Dembinsk', '', 1, '', 1, '', '', '81249270', '2025-04-18 19:07:30', 0),
(35, 'Guilherme Mendes da Silva', '0000-00-00', 'm', '654.294.116', '(41) 99910-6608', 'guimendes@dye.com.br', 'Travessa Ilma Rosa de Nes', '', 1, '', 1, '', '', '63035040', '2025-05-28 01:43:21', 0),
(60, 'Nauhany M', '1930-02-24', 'm', '881.057.659', '(41) 56329-8656', 'nauhany@hotmail.com', 'Rua dos Anjos', '', 1, '', 1, '', '', '84053050', '2025-05-28 01:47:08', 0),
(68, 'Maitê Márcia Silveira', '2013-07-17', 'f', '05529952313', '(54) 3874-1307', 'maite-silveira87@gruposantin.com.br', 'Rua Giovani Bertassi', '', 1, '', 1, '', '', '95112810', '2025-05-08 01:05:29', 0),
(70, 'Cauê Noah Caldeira', '2025-05-23', 'm', '50009487859', '(81) 3980-4607', 'caue-caldeira85@vpsa.com.br', 'Travessa Ilma Rosa de Nes', '', 1, '', 1, '', '', '65071856', '2025-05-14 01:12:33', 0),
(74, 'Francisco Levi Vicente Viana', '1995-01-17', 'm', '25663748997', '(83) 3502-3439', 'francisco.levi.viana@estadao.com.br', 'Travessa Maria Pereira Brandão', '', 1, '', 1, '', '', '58418042', '2025-05-14 14:01:57', 0),
(84, 'Felipe Enzo Santos', '2001-09-09', 'm', '299.439.952', '(41) 99662-2210', 'felipeenzosantos@live.ca', 'Rua 701', '333', 0, 'Centro', 0, 'Balneário Camboriú', 'SC', '88330711', '2025-05-28 11:37:34', 0),
(87, 'Sophia Melo', '2000-01-05', 'f', '94933956006', '(41) 9827-6465', 'sophiamelo@gmail.com', 'Rua João Gomes', '55', 0, 'Novo Mundo', 0, 'Curitiba', 'PR', '81020030', '2025-05-28 01:01:43', 0),
(88, 'Teresinha Kamilly Emilly Galvo', '1992-02-09', 'f', '42260527140', '(81) 2889-3803', 'teresinhakamillygalvao@compecia.com.br', 'Rua Estácio de Sá', '54', 0, 'Madalena', 0, 'Recife', 'PE', '50610410', '2025-05-28 01:11:05', 0),
(91, 'Henrique Kisiel Rosa', '2002-07-01', 'm', '12778434909', '(41) 99662-2210', 'henrikisiel46@gmail.com', 'Rua Omar Raymundo Picheth', '753', 0, 'Xaxim', 0, 'Curitiba', 'PR', '81810150', '2025-05-28 01:20:43', 0),
(92, 'Felipe Theo Castro', '2001-02-13', 'm', '45734434361', '(88) 2802-0518', 'felipe-castro78@abcautoservice.net', 'Rua Zeferino da Costa', '243', 0, 'Xaxim', 0, 'Curitiba', 'PR', '81810030', '2025-06-08 20:59:46', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `pessoa_juridica`
--

DROP TABLE IF EXISTS `pessoa_juridica`;
CREATE TABLE IF NOT EXISTS `pessoa_juridica` (
  `cd_pessoa_juridica` int(11) NOT NULL,
  `nm_fantasia` varchar(80) NOT NULL,
  `nm_razao_social` varchar(100) NOT NULL,
  `nr_cnpj` varchar(14) NOT NULL,
  `ds_tipo_fornecedor` varchar(100) DEFAULT NULL,
  `ds_endereco` varchar(255) DEFAULT NULL,
  `nr_endereco` varchar(10) NOT NULL,
  `cd_bairro` int(11) NOT NULL,
  `nm_bairro` varchar(50) NOT NULL,
  `cd_cidade` int(11) NOT NULL,
  `nm_cidade` varchar(50) NOT NULL,
  `uf_estado` varchar(2) NOT NULL,
  `nr_cep` varchar(8) DEFAULT NULL,
  `nr_telefone` varchar(20) DEFAULT NULL,
  `ds_email` varchar(255) DEFAULT NULL,
  `dt_atualizacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `pessoa_juridica`
--

INSERT INTO `pessoa_juridica` (`cd_pessoa_juridica`, `nm_fantasia`, `nm_razao_social`, `nr_cnpj`, `ds_tipo_fornecedor`, `ds_endereco`, `nr_endereco`, `cd_bairro`, `nm_bairro`, `cd_cidade`, `nm_cidade`, `uf_estado`, `nr_cep`, `nr_telefone`, `ds_email`, `dt_atualizacao`) VALUES
(1, 'Gabe Pizzaria', 'Gabriel e Sebastiana Pizzaria ME', '91526860000119', NULL, 'Rua Nicanor Acyr Milano', '808', 1, 'Uberaba', 1, 'Curitiba', 'PR', '81580360', '41995199284', 'almoxarifado@gabrielesebastianapizzariame.com.br', '2025-05-28 00:38:56'),
(6, 'Teresinha Consultoria de PP', 'Sandra e Teresinha Publicidade e Propaganda ME', '67036377000171', NULL, 'Rua Giácomo Santoro', '150', 1, 'Campo Comprido', 1, 'Curitiba', 'PR', '81220175', '4235412784', 'suporte@sandraeteresinhapublicidadeepropagandame.com.br', '2025-05-28 00:40:58'),
(7, 'Telecom JM', 'Joaquim e Marlene Telecom Ltda', '36598788000127', NULL, 'Rua Valfrido Ribeiro de Campos', '145', 1, 'Cajuru', 1, 'Curitiba', 'PR', '82900305', '41985263687', 'contato@joaquimemarlenetelecomltda.com.br', '2025-05-28 00:43:40'),
(8, 'INF informatica', 'INF informatica e telecom LTDA', '00006749000146', NULL, 'Rua Luiz Felippe Lopes', '2142', 1, 'Mossunguê', 1, 'Curitiba', 'PR', '81200175', '41985742636', 'INF@gmail.com.br', '2025-05-28 00:50:29'),
(9, 'Kisel Capinhas', 'Henrique Kisel LTDA', '15756764000189', NULL, 'Rua Pastor Walter Kelm', '1487', 1, 'Prado Velho', 1, 'Curitiba', 'PR', '80215196', '41998752146', 'compras@kiselcapinhas.com.br', '2025-05-28 00:57:49'),
(10, 'eadSimples', 'Razão eadSimples', '07791572000185', NULL, 'Rua Ângelo Cúnico', '1851', 1, 'Abranches', 1, 'Curitiba', 'PR', '82220318', '41398046078', 'eadsimples@gmail.com', '2025-05-28 00:59:39'),
(14, 'Flores e café ', 'PROSA E CAFE LTDA', '89530573000130', NULL, 'Rua Farias Brito', '1010', 1, 'Fanny', 1, 'Curitiba', 'PR', '81030120', '41985263498', 'flores@gmail.com', '2025-05-28 01:01:02'),
(22, 'Louise e Renato Financeira ME', 'Louise e Renato Financeira', '69086110000114', NULL, 'Rua Francisco Alves', '888', 0, 'Xaxim', 0, 'Curitiba', 'PR', '81810180', '41997524882', 'contato@louiseerenatofinanceirame.com.br', '2025-05-28 01:01:49');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `Pessoa_Usuario`
--
DROP VIEW IF EXISTS `Pessoa_Usuario`;
CREATE TABLE IF NOT EXISTS `Pessoa_Usuario` (
`cd_usuario` int(11)
,`nm_usuario` varchar(50)
,`cd_pessoa_fisica` int(11)
,`nm_pessoa_fisica` varchar(60)
,`ds_email` varchar(255)
,`ie_situacao` char(1)
,`nr_telefone_celular` varchar(20)
,`dt_atualizacao` timestamp
,`ds_senha` varchar(255)
,`nr_cpf` varchar(11)
);

-- --------------------------------------------------------

--
-- Estrutura para tabela `planta`
--

DROP TABLE IF EXISTS `planta`;
CREATE TABLE IF NOT EXISTS `planta` (
  `cd_planta` int(11) NOT NULL,
  `nm_planta` varchar(100) NOT NULL,
  `qt_capacidade_total_volume` decimal(15,8) NOT NULL,
  `qt_disponivel_volume` decimal(15,8) DEFAULT 0.00000000,
  `qt_capacidade_atual_volume` decimal(15,8) NOT NULL,
  `qt_capacidade_atual_kg` decimal(10,3) DEFAULT NULL,
  `nr_cep` varchar(8) NOT NULL,
  `nr_endereco` int(10) NOT NULL,
  `ds_endereco` varchar(255) NOT NULL,
  `nm_bairro` varchar(20) NOT NULL,
  `nm_cidade` varchar(20) NOT NULL,
  `uf_estado` varchar(2) NOT NULL,
  `dt_criacao` timestamp NULL DEFAULT current_timestamp(),
  `ie_situacao` char(1) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=107 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `planta`
--

INSERT INTO `planta` (`cd_planta`, `nm_planta`, `qt_capacidade_total_volume`, `qt_disponivel_volume`, `qt_capacidade_atual_volume`, `qt_capacidade_atual_kg`, `nr_cep`, `nr_endereco`, `ds_endereco`, `nm_bairro`, `nm_cidade`, `uf_estado`, `dt_criacao`, `ie_situacao`) VALUES
(10, 'Planta EcoTech Matriz', '1000.00000000', '1000.00000000', '0.00000000', '0.000', '80530900', 545, 'Avenida Cândido de Abreu', 'Centro Cívico', 'Curitiba', 'PR', '2025-04-17 03:28:23', 'I'),
(11, 'Planta EcoTech Filial', '2000.00000000', '2000.00000000', '0.00000000', '0.000', '80250903', 987, 'Rua Brigadeiro Franco', 'Centro', 'Curitiba', 'PR', '2025-04-17 03:33:20', 'I'),
(12, 'Planta EcoTech Umbara', '1500.00000000', '1500.00000000', '0.00000000', '800.000', '80230903', 417, 'Avenida Sete de Setembro', 'Rebouças', 'Curitiba', 'PR', '2025-04-17 03:50:25', 'I'),
(13, 'Planta EcoTech Santa Felicidade', '1000.00000000', '1000.00000000', '0.00000000', '0.000', '80610905', 7965, 'Avenida Presidente Kennedy', 'Portão', 'Curitiba', 'PR', '2025-04-18 03:17:07', 'I'),
(30, 'Planta EcoTech Colombo', '1500.00000000', '1500.00000000', '0.00000000', '450.000', '80420000', 852, 'Rua Comendador Araújo', 'Centro', 'Curitiba', 'PR', '2025-04-22 05:52:51', 'I'),
(31, 'Planta EcoTech Hauer', '630.00000000', '583.82850000', '46.17150000', '10114.000', '80420060', 379, 'Alameda Dom Pedro II', 'Batel', 'Curitiba', 'PR', '2025-04-22 07:52:14', 'A'),
(32, 'Planta EcoTech Pilarzinho', '1000.00000000', '1000.00000000', '0.00000000', '1800.000', '80420000', 1087, 'Rua Comendador Araújo', 'Centro', 'Curitiba', 'PR', '2025-04-22 08:04:08', 'I'),
(33, 'Planta EcoTech Pinhais', '1300.00000000', '1300.00000000', '0.00000000', '900.000', '80010010', 9735, 'Rua Marechal Deodoro', 'Centro', 'Curitiba', 'PR', '2025-04-23 23:05:23', 'I'),
(34, 'Planta EcoTech CIC', '1000.00000000', '1000.00000000', '0.00000000', '0.000', '80420170', 7168, 'Rua Coronel Dulcídio', 'Batel', 'Curitiba', 'PR', '2025-04-23 23:14:53', 'I'),
(53, 'Planta EcoTech Portao', '2000.00000000', '2000.00000000', '0.00000000', '2000.000', '80010050', 258, 'Rua Emiliano Perneta', 'Centro', 'Curitiba', 'PR', '2025-05-02 05:25:12', 'I'),
(54, 'Planta EcoTech Alto Boqueirao', '1000.00000000', '1000.00000000', '0.00000000', '0.000', '80040180', 764, 'Rua Camões', 'Hugo Lange', 'Curitiba', 'PR', '2025-05-04 23:00:25', 'I'),
(55, 'Planta EcoTech Centro', '1200.00000000', '1200.00000000', '0.00000000', '1000.000', '80040180', 761, 'Rua Camões', 'Hugo Lange', 'Curitiba', 'PR', '2025-05-04 23:09:04', 'I'),
(65, 'Planta EcoTech Fazendinha', '500.00000000', '399.11450001', '100.88549999', '15450.000', '80410201', 654, 'Rua Visconde de Nacar', 'Centro', 'Curitiba', 'PR', '2025-05-04 23:43:07', 'A');

--
-- Gatilhos `planta`
--
DROP TRIGGER IF EXISTS `trg_planta_disponivel_before_insert`;
DELIMITER $$
CREATE TRIGGER `trg_planta_disponivel_before_insert` BEFORE INSERT ON `planta`
 FOR EACH ROW BEGIN
  SET NEW.qt_disponivel_volume = GREATEST(IFNULL(NEW.qt_capacidade_total_volume,0) - IFNULL(NEW.qt_capacidade_atual_volume,0),0);
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_planta_disponivel_before_update`;
DELIMITER $$
CREATE TRIGGER `trg_planta_disponivel_before_update` BEFORE UPDATE ON `planta`
 FOR EACH ROW BEGIN
  SET NEW.qt_disponivel_volume = GREATEST(
    IFNULL(NEW.qt_capacidade_total_volume,0) - IFNULL(NEW.qt_capacidade_atual_volume,0),
    0
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pontos_coleta`
--

DROP TABLE IF EXISTS `pontos_coleta`;
CREATE TABLE IF NOT EXISTS `pontos_coleta` (
  `cd_ponto_coleta` int(11) NOT NULL,
  `ie_rota` int(11) NOT NULL,
  `nm_ponto` varchar(100) NOT NULL,
  `ds_endereco` varchar(255) NOT NULL,
  `nm_cidade` varchar(30) DEFAULT NULL,
  `nm_bairro` varchar(30) NOT NULL,
  `nr_cep` varchar(8) NOT NULL,
  `cd_planta` int(11) DEFAULT NULL,
  `distancia_km` varchar(10) DEFAULT NULL,
  `peso_kg_ponto` decimal(10,2) DEFAULT NULL,
  `Volume_ponto` decimal(10,2) DEFAULT NULL,
  `cd_agendamento` int(11) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `pontos_coleta`
--

INSERT INTO `pontos_coleta` (`cd_ponto_coleta`, `ie_rota`, `nm_ponto`, `ds_endereco`, `nm_cidade`, `nm_bairro`, `nr_cep`, `cd_planta`, `distancia_km`, `peso_kg_ponto`, `Volume_ponto`, `cd_agendamento`) VALUES
(1, 1, '', 'Rua Antônio Rechetelo', 'Curitiba', 'Fazendinha', '81320170', 53, NULL, '128.00', '1.28', 1),
(2, 1, '', 'Rua Giácomo Santoro', 'Curitiba', 'Campo Comprido', '81220175', 53, NULL, '144.20', '0.71', 2),
(3, 1, '', 'Rua Carlos Klemtz', 'Curitiba', 'Fazendinha', '81320000', 53, NULL, '183.70', '2.13', 3),
(5, 2, '', 'Rua Omar Raymundo Picheth', 'Curitiba', 'Xaxim', '81810150', 31, NULL, '1800.00', '21.06', 4),
(6, 4, '', 'Rua do Escriturário', 'Curitiba', 'Boqueirão', '81730180', 31, NULL, '344.00', '3.73', 6),
(8, 4, '', 'Rua Waldemar Kost', 'Curitiba', 'Hauer', '81630180', 31, NULL, '256.00', '2.50', 7),
(9, 5, '', 'Rua Sérgio Navarro', 'Curitiba', 'Fazendinha', '81320160', 65, NULL, '550.00', '6.00', 9),
(10, 5, '', 'Rua São Pedro Maria Chanel', 'Curitiba', 'Cidade Industrial', '81450180', 65, NULL, '76.50', '0.36', 8),
(11, 6, '', 'Rua Omar Raymundo Picheth', 'Curitiba', 'Xaxim', '81810150', 31, NULL, '180.00', '1.04', 10),
(12, 6, '', 'Rua Alfredo José Pinto', 'Curitiba', 'Fazendinha', '81320180', 31, NULL, '372.50', '1.86', 11),
(13, 7, '', 'Rua Alfredo José Pinto', 'Curitiba', 'Fazendinha', '81320180', 31, NULL, '357.00', '2.76', 12),
(14, 7, '', 'Rua João Dembinski', 'Curitiba', 'Cidade Industrial', '81240270', 31, NULL, '468.00', '3.78', 14),
(15, 8, '', 'Rua Barão de Santo Ângelo', 'Curitiba', 'Xaxim', '81810140', 65, NULL, '825.00', '8.99', 15),
(16, 9, '', 'Rua Frei Gaspar da Madre de Deus', 'Curitiba', 'Portão', '81070090', 65, NULL, '297.50', '3.12', 16),
(17, 10, '', 'Rua Alfredo José Pinto', 'Curitiba', 'Fazendinha', '81320180', 31, NULL, '275.00', '3.00', 17),
(18, 14, '', 'Rua Alfredo José Pinto', 'Curitiba', 'Fazendinha', '81320180', 31, NULL, '3.00', '0.01', 18),
(19, 15, '', 'Rua Alfredo José Pinto', 'Curitiba', 'Fazendinha', '81320180', 31, NULL, '265.00', '2.88', 19),
(20, 16, '', 'Rua Carlos Klemtz', 'Curitiba', 'Fazendinha', '81320000', 31, NULL, '300.00', '3.51', 20),
(21, 17, '', 'Rua Carlos Klemtz', 'Curitiba', 'Fazendinha', '81320000', 31, NULL, '8.00', '0.02', 21),
(22, 18, '', 'Rua Mahatma Gandhi', 'Curitiba', 'Xaxim', '81810130', 31, NULL, '128.00', '0.71', 22);

--
-- Gatilhos `pontos_coleta`
--
DROP TRIGGER IF EXISTS `trg_before_insert_pontos_coleta`;
DELIMITER $$
CREATE TRIGGER `trg_before_insert_pontos_coleta` BEFORE INSERT ON `pontos_coleta`
 FOR EACH ROW BEGIN
    -- Declaração das variáveis
    DECLARE v_ds_endereco VARCHAR(255);
    DECLARE v_nm_bairro VARCHAR(30);
    DECLARE v_nm_cidade VARCHAR(30);
    DECLARE v_nr_cep VARCHAR(20);
    DECLARE v_peso_kg_ponto DECIMAL(10,2);
	DECLARE v_volume_ponto DECIMAL(10,2);
    DECLARE v_cd_planta INT;

    -- Buscar informações do agendamento
    SELECT a.ds_endereco, a.nm_bairro, a.nm_cidade, a.nr_cep, a.qt_quantidade_prevista_kg, a.volume_agendamento
    INTO v_ds_endereco, v_nm_bairro, v_nm_cidade, v_nr_cep, v_peso_kg_ponto, v_volume_ponto
    FROM agendamento a
    WHERE a.cd_agendamento = NEW.cd_agendamento;

    -- Buscar o cd_planta da rota associada
    SELECT r.ie_planta
    INTO v_cd_planta
    FROM rota_coleta r
    WHERE r.cd_rota = NEW.ie_rota;

    -- Atribuir os valores buscados ao novo registro de pontos_coleta
    SET NEW.ds_endereco    = v_ds_endereco;
    SET NEW.nm_bairro      = v_nm_bairro;
    SET NEW.nm_cidade      = v_nm_cidade;
    SET NEW.nr_cep         = v_nr_cep;
    SET NEW.peso_kg_ponto  = v_peso_kg_ponto;
    SET NEW.cd_planta      = v_cd_planta;
	SET NEW.Volume_ponto   = v_volume_ponto;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_delete_pontos_coleta`;
DELIMITER $$
CREATE TRIGGER `trg_delete_pontos_coleta` AFTER DELETE ON `pontos_coleta`
 FOR EACH ROW BEGIN
    UPDATE rota_coleta
    SET qt_peso_total_kg = (
        SELECT IFNULL(SUM(peso_kg_ponto), 0)
        FROM pontos_coleta
        WHERE ie_rota = OLD.ie_rota
    )
    WHERE cd_rota = OLD.ie_rota;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_insert_pontos_coleta`;
DELIMITER $$
CREATE TRIGGER `trg_insert_pontos_coleta` AFTER INSERT ON `pontos_coleta`
 FOR EACH ROW BEGIN
    UPDATE rota_coleta
    SET qt_peso_total_kg = (
        SELECT IFNULL(SUM(peso_kg_ponto), 0)
        FROM pontos_coleta
        WHERE ie_rota = NEW.ie_rota
    )
    WHERE cd_rota = NEW.ie_rota;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_update_pontos_coleta`;
DELIMITER $$
CREATE TRIGGER `trg_update_pontos_coleta` AFTER UPDATE ON `pontos_coleta`
 FOR EACH ROW BEGIN
    -- Atualiza a rota antiga, se mudou de rota
    IF OLD.ie_rota != NEW.ie_rota THEN
        UPDATE rota_coleta
        SET qt_peso_total_kg = (
            SELECT IFNULL(SUM(peso_kg_ponto), 0)
            FROM pontos_coleta
            WHERE ie_rota = OLD.ie_rota
        )
        WHERE cd_rota = OLD.ie_rota;

        UPDATE rota_coleta
        SET qt_peso_total_kg = (
            SELECT IFNULL(SUM(peso_kg_ponto), 0)
            FROM pontos_coleta
            WHERE ie_rota = NEW.ie_rota
        )
        WHERE cd_rota = NEW.ie_rota;
    ELSE
        -- Se não mudou de rota, atualiza apenas essa
        UPDATE rota_coleta
        SET qt_peso_total_kg = (
            SELECT IFNULL(SUM(peso_kg_ponto), 0)
            FROM pontos_coleta
            WHERE ie_rota = NEW.ie_rota
        )
        WHERE cd_rota = NEW.ie_rota;
    END IF;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_update_volume_rota_delete`;
DELIMITER $$
CREATE TRIGGER `trg_update_volume_rota_delete` AFTER DELETE ON `pontos_coleta`
 FOR EACH ROW BEGIN
    UPDATE rota_coleta
    SET volume_rota = (
        SELECT IFNULL(SUM(Volume_ponto), 0)
        FROM pontos_coleta
        WHERE ie_rota = OLD.ie_rota
    )
    WHERE cd_rota = OLD.ie_rota;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_update_volume_rota_insert`;
DELIMITER $$
CREATE TRIGGER `trg_update_volume_rota_insert` AFTER INSERT ON `pontos_coleta`
 FOR EACH ROW BEGIN
    UPDATE rota_coleta
    SET volume_rota = (
        SELECT IFNULL(SUM(Volume_ponto), 0)
        FROM pontos_coleta
        WHERE ie_rota = NEW.ie_rota
    )
    WHERE cd_rota = NEW.ie_rota;
END
$$
DELIMITER ;
DROP TRIGGER IF EXISTS `trg_update_volume_rota_update`;
DELIMITER $$
CREATE TRIGGER `trg_update_volume_rota_update` AFTER UPDATE ON `pontos_coleta`
 FOR EACH ROW BEGIN
    UPDATE rota_coleta
    SET volume_rota = (
        SELECT IFNULL(SUM(Volume_ponto), 0)
        FROM pontos_coleta
        WHERE ie_rota = NEW.ie_rota
    )
    WHERE cd_rota = NEW.ie_rota;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estrutura para tabela `Relatorios`
--

DROP TABLE IF EXISTS `Relatorios`;
CREATE TABLE IF NOT EXISTS `Relatorios` (
  `cd_rel` int(11) NOT NULL,
  `ds_relatorio` varchar(100) NOT NULL,
  `query_sql` text NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `Relatorios`
--

INSERT INTO `Relatorios` (`cd_rel`, `ds_relatorio`, `query_sql`) VALUES
(1, 'Relatório Rotas', 'SELECT\r\n    r.nm_rota AS Rota,\r\n    r.nr_distancia_km AS Distancia_KM,\r\n    r.qt_peso_total_kg AS Peso_Total_KG,\r\n    r.volume_rota AS Volume_Total_M3,\r\n    r.dt_agendada AS Data_Agendada,\r\n    r.nm_motorista AS Motorista,\r\n    r.nm_modelo AS Modelo_Caminhao,\r\n    r.placa AS Placa,\r\n    COUNT(p.cd_ponto_coleta) AS Qtd_Pontos_Coleta\r\nFROM vw_rotas_coleta r\r\nLEFT JOIN pontos_coleta p ON p.ie_rota = r.cd_rota\r\nGROUP BY \r\n    r.nm_rota,\r\n    r.nr_distancia_km,\r\n    r.qt_peso_total_kg,\r\n    r.volume_rota,\r\n    r.dt_agendada,\r\n    r.nm_motorista,\r\n    r.nm_modelo,\r\n    r.placa\r\nORDER BY r.dt_agendada DESC'),
(2, 'Relatório de Produtos Reciclados ', 'SELECT \r\n    m.ds_material,\r\n    SUM(ma.qt_peso_final) AS ''Peso Total Reciclado'',\r\n    COUNT(DISTINCT a.cd_agendamento) AS ''Total Coletas'',\r\n    FORMAT(\r\n      (SELECT IFNULL(SUM(mv.qt_peso * mv.vl_valor_por_kg), 0)\r\n       FROM movimentacoes mv\r\n       WHERE mv.cd_material = m.cd_material\r\n         AND mv.tipo_movimentacao = ''venda''\r\n      ), 2, ''de_DE''\r\n    ) AS ''Valor Arrecadado''\r\nFROM materiais_agenda ma\r\nJOIN materiais m ON ma.ie_material = m.cd_material\r\nJOIN agendamento a ON a.cd_agendamento = ma.ie_agenda\r\nGROUP BY m.ds_material\r\nORDER BY `Peso Total Reciclado` DESC'),
(3, 'Controle de Estoques', 'SELECT \n    nm_estoque AS ''Estoque'',\n    qt_capacidade_atual AS ''Peso Atual(KG)'',\n    qt_volume_atual AS ''Volume Atual(m3)'',\n    qt_volume_total AS ''Capacidade Total{m3)'',\n    ROUND((qt_volume_atual / qt_volume_total) * 100, 2) AS ''Porcentagem Ocupada''\nFROM estoque'),
(4, 'Materiais Mais coletados', 'SELECT\r\n  m.ds_material AS ''Material'',\r\n  SUM(ma.qt_peso_material_total_kg) AS ''Peso Total Coletado (kg)'',\r\n  COUNT(DISTINCT ma.ie_agenda) AS ''Total de Agendamentos''\r\nFROM materiais_agenda ma\r\nJOIN materiais m ON ma.ie_material = m.cd_material\r\nGROUP BY m.ds_material\r\nORDER BY `Peso Total Coletado (kg)` DESC\r\nLIMIT 10;'),
(5, 'Relatório de Plantas', 'SELECT\r\n  cd_planta,\r\n  nm_planta,\r\n  qt_capacidade_total_volume AS ''Capacidade Total (m³)'',\r\n  qt_capacidade_atual_volume AS ''Volume Atual (m³)'',\r\n  qt_disponivel_volume AS ''Volume Disponível (m³)'',\r\n  qt_capacidade_atual_kg AS ''Peso Atual (kg)'',\r\n  uf_estado,\r\n  nm_cidade,\r\n  nm_bairro,\r\n  ie_situacao AS ''Situação''\r\nFROM planta\r\nORDER BY nm_planta;'),
(6, 'Relatório de Agendamentos', 'SELECT\r\n  a.cd_agendamento,\r\n  a.nm_agendamento,\r\n  a.dt_solicitada,\r\n  a.dt_coleta,\r\n  a.qt_quantidade_prevista_kg,\r\n  a.qt_peso_real,\r\n  a.volume_agendamento,\r\n  a.status,\r\n  COALESCE(p.ie_rota, '''') AS cd_rota,\r\n  (SELECT COUNT(*) FROM materiais_agenda ma WHERE ma.ie_agenda = a.cd_agendamento) AS qtd_itens\r\nFROM agendamento a\r\nLEFT JOIN pontos_coleta p ON p.cd_agendamento = a.cd_agendamento\r\nORDER BY a.dt_solicitada DESC'),
(7, 'Materiais mais vendidos', 'SELECT\r\n  m.ds_material,\r\n  SUM(mov.qt_peso) AS peso_vendido_kg,\r\n  SUM(mov.qt_peso * mov.vl_valor_por_kg) AS valor_total,\r\n  AVG(mov.vl_valor_por_kg) AS media_preco_kg\r\nFROM movimentacoes mov\r\nJOIN materiais m ON mov.cd_material = m.cd_material\r\nWHERE mov.tipo_movimentacao = ''venda''\r\nGROUP BY m.ds_material\r\nORDER BY peso_vendido_kg DESC'),
(8, 'Movimentacoes', 'SELECT\r\n  mov.cd_movimentacao,\r\n  mov.dt_movimentacao,\r\n  mov.tipo_movimentacao,\r\n  m.ds_material,\r\n  mov.qt_peso,\r\n  mov.qt_volume,\r\n  mov.vl_valor_por_kg,\r\n  (mov.qt_peso * mov.vl_valor_por_kg) AS valor_total,\r\n  mov.cd_estoque,\r\n  e.nm_estoque,\r\n  mov.cd_agendamento,\r\n  mov.ds_motivo\r\nFROM movimentacoes mov\r\nLEFT JOIN materiais m ON mov.cd_material = m.cd_material\r\nLEFT JOIN estoque e ON mov.cd_estoque = e.cd_estoque\r\nORDER BY mov.dt_movimentacao DESC;'),
(9, 'Relatório de previsões e realizado', 'SELECT \r\n    DATE_FORMAT(a.dt_coleta, ''%Y-%m'') AS mes,\r\n    SUM(ma.qt_peso_material_total_kg) AS peso_previsto,\r\n    SUM(ma.qt_peso_final) AS peso_real\r\nFROM agendamento a\r\nJOIN materiais_agenda ma ON a.cd_agendamento = ma.ie_agenda\r\nWHERE a.status = ''ativo''\r\nGROUP BY mes\r\nORDER BY mes;'),
(10, 'Relatório de Feedback', 'SELECT\r\n  f.cd_feedback AS codigo_feedback,\r\n  f.dt_feedback AS data_feedback,\r\n  f.nr_nota AS nota,\r\n  f.ds_feedback AS comentario,\r\n  COALESCE(pf.nm_pessoa_fisica, pj.nm_razao_social) AS nome_cliente,\r\n  a.dt_coleta AS data_coleta,\r\n  a.nm_cidade,\r\n  a.uf_estado\r\nFROM feedback f\r\nINNER JOIN agendamento a ON f.cd_agendamento = a.cd_agendamento\r\nLEFT JOIN pessoa_fisica pf ON a.cd_pessoa_fisica = pf.cd_pessoa_fisica\r\nLEFT JOIN pessoa_juridica pj ON a.cd_pessoa_juridica = pj.cd_pessoa_juridica\r\nORDER BY f.dt_feedback DESC;');

-- --------------------------------------------------------

--
-- Estrutura para tabela `rota_coleta`
--

DROP TABLE IF EXISTS `rota_coleta`;
CREATE TABLE IF NOT EXISTS `rota_coleta` (
  `ie_situacao` varchar(2) NOT NULL DEFAULT 'A',
  `cd_rota` int(11) NOT NULL,
  `nm_rota` varchar(100) NOT NULL,
  `dt_agendada` date NOT NULL,
  `dt_iniciado` datetime DEFAULT NULL,
  `dt_fim` datetime DEFAULT NULL,
  `qt_peso_total_kg` decimal(10,2) DEFAULT NULL,
  `volume_rota` decimal(10,2) DEFAULT NULL,
  `ie_planta` int(11) NOT NULL,
  `nr_distancia_km` varchar(10) DEFAULT NULL,
  `ie_motorista` int(11) DEFAULT NULL,
  `ie_caminhao` int(11) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `rota_coleta`
--

INSERT INTO `rota_coleta` (`ie_situacao`, `cd_rota`, `nm_rota`, `dt_agendada`, `dt_iniciado`, `dt_fim`, `qt_peso_total_kg`, `volume_rota`, `ie_planta`, `nr_distancia_km`, `ie_motorista`, `ie_caminhao`) VALUES
('A', 1, 'Rota-Henrique', '2025-05-30', '2025-06-11 13:31:19', '2025-06-11 18:30:32', '455.90', '4.12', 53, '32.82', 2, 3),
('A', 2, 'Rota-Nicolas', '2025-05-27', '2025-05-27 23:10:17', '2025-05-27 23:10:52', '1800.00', '21.06', 31, '20.81', 1, 1),
('I', 3, 'Rota-Nicolas', '2025-05-31', NULL, NULL, '0.00', NULL, 65, '', 1, 2),
('A', 4, 'Rota-Henrique', '2025-05-28', '2025-02-12 13:56:17', '2025-04-16 16:56:56', '600.00', '6.23', 31, '26.35', 2, 3),
('A', 5, 'Rota-Felipe', '2025-04-16', '2025-04-16 11:56:45', '2025-04-16 13:56:56', '626.50', '6.36', 65, '27.0499999', 3, 1),
('A', 6, 'Rota-Henrique', '2025-06-01', '2025-05-28 19:35:59', '2025-05-28 19:36:15', '552.50', '2.90', 31, '26.26', 2, 1),
('A', 7, 'Rota-Noturna', '2025-05-28', '2025-05-28 19:40:10', '2025-06-05 21:14:02', '825.00', '6.54', 31, '19.58', 3, 1),
('A', 8, 'Rota-Alceu', '2025-05-28', NULL, NULL, '825.00', '8.99', 65, '23.6', 1, 2),
('A', 9, 'TesteProfessores', '2025-05-28', '2025-05-28 20:02:41', '2025-05-28 20:03:01', '297.50', '3.12', 65, '14.55', 1, 1),
('A', 10, 'Rota-Nicolas', '2025-06-10', '2025-06-10 22:03:05', '2025-06-10 22:03:12', '275.00', '3.00', 31, '14.83', 1, 2),
('A', 14, 'Rota-Nicolas2', '2025-06-11', '2025-06-10 22:11:59', '2025-06-10 22:12:09', '3.00', '0.01', 31, '14.83', 1, 2),
('A', 15, 'Rota-Nicolas3', '2025-06-11', '2025-06-10 22:23:51', '2025-06-10 22:23:58', '265.00', '2.88', 31, '14.83', 1, 2),
('A', 16, 'Rota-Nicolas4', '2025-06-10', '2025-06-10 22:29:52', '2025-06-10 22:30:10', '300.00', '3.51', 31, '16.27', 1, 2),
('A', 17, 'Rota-Henrique', '2025-06-11', '2025-06-11 19:55:07', '2025-06-11 19:55:19', '8.00', '0.02', 31, '16.27', 2, 3),
('A', 18, 'RotaAula', '2025-06-11', '2025-06-11 20:11:24', '2025-06-11 20:11:32', '128.00', '0.71', 31, '5.53', 2, 2);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE IF NOT EXISTS `usuario` (
  `cd_usuario` int(11) NOT NULL,
  `nm_usuario` varchar(50) NOT NULL,
  `ds_senha` varchar(255) NOT NULL,
  `ie_situacao` char(1) NOT NULL DEFAULT 'A',
  `cd_pessoa_fisica` int(11) NOT NULL,
  `dt_atualizacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Fazendo dump de dados para tabela `usuario`
--

INSERT INTO `usuario` (`cd_usuario`, `nm_usuario`, `ds_senha`, `ie_situacao`, `cd_pessoa_fisica`, `dt_atualizacao`) VALUES
(5, 'alceu.teste', '123456789', 'A', 25, '2025-06-08 20:23:50'),
(7, 'nauhany.teste', '12345', 'A', 24, '2025-05-26 22:21:14'),
(9, 'nicolas.teste', '1235', 'A', 5, '2025-04-21 21:48:51'),
(10, 'guilherme.teste', '159357', 'A', 35, '2025-04-23 05:03:08'),
(13, 'Nau_123', 'Nau123', 'A', 60, '2025-04-28 23:59:38'),
(14, 'maite.maite', '1234', 'A', 68, '2025-05-10 23:46:42'),
(16, 'enzo123', '1234', 'A', 84, '2025-05-26 22:28:53'),
(17, 'kisiel', '1234', 'A', 91, '2025-06-11 00:21:32');

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_pontos_coleta`
--
DROP VIEW IF EXISTS `vw_pontos_coleta`;
CREATE TABLE IF NOT EXISTS `vw_pontos_coleta` (
`cd_ponto_coleta` int(11)
,`nm_ponto` varchar(100)
,`cd_rota` int(11)
,`nm_rota` varchar(100)
,`cd_planta` int(11)
,`dt_rota` varchar(6)
,`dt_r_inciada` varchar(6)
,`dt_r_finalizada` varchar(6)
,`cd_agendamento` int(11)
,`nm_agendamento` text
,`dt_agendado` varchar(6)
,`dt_coleta` varchar(6)
,`dt_cancelado` varchar(6)
,`ds_endereco` varchar(255)
,`nm_cidade` varchar(30)
,`nm_bairro` varchar(30)
,`qt_quantidade_prevista_kg` decimal(10,2)
,`peso_real` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estrutura stand-in para view `vw_rotas_coleta`
--
DROP VIEW IF EXISTS `vw_rotas_coleta`;
CREATE TABLE IF NOT EXISTS `vw_rotas_coleta` (
`cd_rota` int(11)
,`nm_rota` varchar(100)
,`nr_distancia_km` varchar(10)
,`qt_peso_total_kg` decimal(10,2)
,`volume_rota` decimal(10,2)
,`dt_agendada` varchar(10)
,`ie_planta` int(11)
,`nm_planta` varchar(100)
,`ie_motorista` int(11)
,`nm_motorista` varchar(100)
,`ie_caminhao` int(11)
,`nm_modelo` varchar(50)
,`placa` varchar(10)
,`capacidade_kg` decimal(10,2)
,`capacidade_volume` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estrutura para view `Pessoa_Usuario`
--
DROP TABLE IF EXISTS `Pessoa_Usuario`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ecotech`@`10.%` SQL SECURITY DEFINER VIEW `Pessoa_Usuario` AS select `a`.`cd_usuario` AS `cd_usuario`,`a`.`nm_usuario` AS `nm_usuario`,`b`.`cd_pessoa_fisica` AS `cd_pessoa_fisica`,`b`.`nm_pessoa_fisica` AS `nm_pessoa_fisica`,`b`.`ds_email` AS `ds_email`,`a`.`ie_situacao` AS `ie_situacao`,`b`.`nr_telefone_celular` AS `nr_telefone_celular`,`a`.`dt_atualizacao` AS `dt_atualizacao`,`a`.`ds_senha` AS `ds_senha`,`b`.`nr_cpf` AS `nr_cpf` from (`usuario` `a` join `pessoa_fisica` `b`) where `a`.`cd_pessoa_fisica` = `b`.`cd_pessoa_fisica`;

-- --------------------------------------------------------

--
-- Estrutura para view `vw_pontos_coleta`
--
DROP TABLE IF EXISTS `vw_pontos_coleta`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ecotech`@`10.%` SQL SECURITY DEFINER VIEW `vw_pontos_coleta` AS select `p`.`cd_ponto_coleta` AS `cd_ponto_coleta`,`p`.`nm_ponto` AS `nm_ponto`,`p`.`ie_rota` AS `cd_rota`,`r`.`nm_rota` AS `nm_rota`,`r`.`ie_planta` AS `cd_planta`,date_format(`r`.`dt_agendada`,'%d%m%y') AS `dt_rota`,date_format(`r`.`dt_iniciado`,'%d%m%y') AS `dt_r_inciada`,date_format(`r`.`dt_fim`,'%d%m%y') AS `dt_r_finalizada`,`p`.`cd_agendamento` AS `cd_agendamento`,`a`.`nm_agendamento` AS `nm_agendamento`,date_format(`a`.`dt_solicitada`,'%d%m%y') AS `dt_agendado`,date_format(`a`.`dt_coleta`,'%d%m%y') AS `dt_coleta`,date_format(`a`.`dt_cancelado`,'%d%m%y') AS `dt_cancelado`,`a`.`ds_endereco` AS `ds_endereco`,`p`.`nm_cidade` AS `nm_cidade`,`p`.`nm_bairro` AS `nm_bairro`,`a`.`qt_quantidade_prevista_kg` AS `qt_quantidade_prevista_kg`,`a`.`qt_peso_real` AS `peso_real` from ((`pontos_coleta` `p` left join `rota_coleta` `r` on(`p`.`ie_rota` = `r`.`cd_rota`)) left join `agendamento` `a` on(`p`.`cd_agendamento` = `a`.`cd_agendamento`));

-- --------------------------------------------------------

--
-- Estrutura para view `vw_rotas_coleta`
--
DROP TABLE IF EXISTS `vw_rotas_coleta`;

CREATE ALGORITHM=UNDEFINED DEFINER=`ecotech`@`10.%` SQL SECURITY DEFINER VIEW `vw_rotas_coleta` AS select `r`.`cd_rota` AS `cd_rota`,`r`.`nm_rota` AS `nm_rota`,`r`.`nr_distancia_km` AS `nr_distancia_km`,`r`.`qt_peso_total_kg` AS `qt_peso_total_kg`,`r`.`volume_rota` AS `volume_rota`,date_format(`r`.`dt_agendada`,'%d/%m/%Y') AS `dt_agendada`,`r`.`ie_planta` AS `ie_planta`,`p`.`nm_planta` AS `nm_planta`,`r`.`ie_motorista` AS `ie_motorista`,`m`.`nm_motorista` AS `nm_motorista`,`r`.`ie_caminhao` AS `ie_caminhao`,`c`.`nm_modelo` AS `nm_modelo`,`c`.`placa` AS `placa`,`c`.`capacidade_kg` AS `capacidade_kg`,`c`.`capacidade_volume` AS `capacidade_volume` from (((`rota_coleta` `r` left join `planta` `p` on(`r`.`ie_planta` = `p`.`cd_planta`)) left join `motorista` `m` on(`r`.`ie_motorista` = `m`.`id_motorista`)) left join `caminhao` `c` on(`r`.`ie_caminhao` = `c`.`id_caminhao`));

--
-- Índices de tabelas apagadas
--

--
-- Índices de tabela `agendamento`
--
ALTER TABLE `agendamento`
  ADD PRIMARY KEY (`cd_agendamento`), ADD KEY `cd_pessoa_fisica` (`cd_pessoa_fisica`), ADD KEY `cd_pessoa_juridica` (`cd_pessoa_juridica`);

--
-- Índices de tabela `bairro`
--
ALTER TABLE `bairro`
  ADD PRIMARY KEY (`cd_bairro`), ADD KEY `cd_cidade` (`cd_cidade`);

--
-- Índices de tabela `caminhao`
--
ALTER TABLE `caminhao`
  ADD PRIMARY KEY (`id_caminhao`), ADD UNIQUE KEY `placa` (`placa`);

--
-- Índices de tabela `cidade`
--
ALTER TABLE `cidade`
  ADD PRIMARY KEY (`cd_cidade`);

--
-- Índices de tabela `estoque`
--
ALTER TABLE `estoque`
  ADD PRIMARY KEY (`cd_estoque`), ADD KEY `cd_planta` (`cd_planta`);

--
-- Índices de tabela `estoque_material`
--
ALTER TABLE `estoque_material`
  ADD PRIMARY KEY (`cd_material_etq`), ADD KEY `cd_material` (`cd_material`), ADD KEY `cd_estoque` (`cd_estoque`);

--
-- Índices de tabela `Etapas`
--
ALTER TABLE `Etapas`
  ADD PRIMARY KEY (`cd_etapa`);

--
-- Índices de tabela `etapas_processamento`
--
ALTER TABLE `etapas_processamento`
  ADD PRIMARY KEY (`cd_etapa_processamento`), ADD KEY `cd_material` (`cd_material`), ADD KEY `cd_etapa` (`cd_etapa`);

--
-- Índices de tabela `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`cd_feedback`), ADD KEY `cd_agendamento` (`cd_agendamento`);

--
-- Índices de tabela `itens_de_linha`
--
ALTER TABLE `itens_de_linha`
  ADD PRIMARY KEY (`cd_item`);

--
-- Índices de tabela `linha`
--
ALTER TABLE `linha`
  ADD PRIMARY KEY (`cd_linha`), ADD UNIQUE KEY `nm_linha` (`nm_linha`), ADD KEY `ie_itens_linha` (`ie_itens_linha`);

--
-- Índices de tabela `materiais`
--
ALTER TABLE `materiais`
  ADD PRIMARY KEY (`cd_material`), ADD KEY `ie_linha` (`ie_linha`);

--
-- Índices de tabela `materiais_agenda`
--
ALTER TABLE `materiais_agenda`
  ADD PRIMARY KEY (`cd_mat_agenda`), ADD KEY `ie_agenda` (`ie_agenda`), ADD KEY `materiais_agenda_ibfk_2` (`ie_linha`), ADD KEY `fk_materiais_agenda_material` (`ie_material`);

--
-- Índices de tabela `motorista`
--
ALTER TABLE `motorista`
  ADD PRIMARY KEY (`id_motorista`), ADD UNIQUE KEY `cnh` (`cnh`), ADD KEY `ie_pessoa` (`ie_pessoa`);

--
-- Índices de tabela `movimentacoes`
--
ALTER TABLE `movimentacoes`
  ADD PRIMARY KEY (`cd_movimentacao`), ADD KEY `movimentacoes_ibfk_1` (`cd_estoque`), ADD KEY `movimentacoes_ibfk_2` (`cd_material`), ADD KEY `movimentacoes_ibfk_3` (`cd_agendamento`);

--
-- Índices de tabela `pessoa_fisica`
--
ALTER TABLE `pessoa_fisica`
  ADD PRIMARY KEY (`cd_pessoa_fisica`), ADD UNIQUE KEY `nr_cpf` (`nr_cpf`), ADD UNIQUE KEY `ds_email` (`ds_email`), ADD KEY `cd_bairro` (`cd_bairro`), ADD KEY `cd_cidade` (`cd_cidade`);

--
-- Índices de tabela `pessoa_juridica`
--
ALTER TABLE `pessoa_juridica`
  ADD PRIMARY KEY (`cd_pessoa_juridica`), ADD UNIQUE KEY `nr_cnpj` (`nr_cnpj`), ADD UNIQUE KEY `ds_email` (`ds_email`), ADD KEY `cd_bairro` (`cd_bairro`), ADD KEY `cd_cidade` (`cd_cidade`);

--
-- Índices de tabela `planta`
--
ALTER TABLE `planta`
  ADD PRIMARY KEY (`cd_planta`), ADD KEY `cd_bairro` (`nm_bairro`), ADD KEY `cd_cidade` (`nm_cidade`);

--
-- Índices de tabela `pontos_coleta`
--
ALTER TABLE `pontos_coleta`
  ADD PRIMARY KEY (`cd_ponto_coleta`), ADD KEY `cd_bairro` (`nm_cidade`), ADD KEY `cd_cidade` (`nm_bairro`), ADD KEY `cd_planta` (`cd_planta`), ADD KEY `ie_rota` (`ie_rota`), ADD KEY `fk_agendamento_ponto` (`cd_agendamento`);

--
-- Índices de tabela `Relatorios`
--
ALTER TABLE `Relatorios`
  ADD PRIMARY KEY (`cd_rel`);

--
-- Índices de tabela `rota_coleta`
--
ALTER TABLE `rota_coleta`
  ADD PRIMARY KEY (`cd_rota`), ADD KEY `fk_rota_planta` (`ie_planta`), ADD KEY `fk_rota_motorista` (`ie_motorista`), ADD KEY `fk_rota_caminhao` (`ie_caminhao`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`cd_usuario`), ADD UNIQUE KEY `nm_usuario` (`nm_usuario`), ADD UNIQUE KEY `cd_pessoa_fisica` (`cd_pessoa_fisica`);

--
-- AUTO_INCREMENT de tabelas apagadas
--

--
-- AUTO_INCREMENT de tabela `agendamento`
--
ALTER TABLE `agendamento`
  MODIFY `cd_agendamento` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT de tabela `bairro`
--
ALTER TABLE `bairro`
  MODIFY `cd_bairro` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT de tabela `caminhao`
--
ALTER TABLE `caminhao`
  MODIFY `id_caminhao` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de tabela `cidade`
--
ALTER TABLE `cidade`
  MODIFY `cd_cidade` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de tabela `estoque`
--
ALTER TABLE `estoque`
  MODIFY `cd_estoque` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=35;
--
-- AUTO_INCREMENT de tabela `estoque_material`
--
ALTER TABLE `estoque_material`
  MODIFY `cd_material_etq` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT de tabela `Etapas`
--
ALTER TABLE `Etapas`
  MODIFY `cd_etapa` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de tabela `etapas_processamento`
--
ALTER TABLE `etapas_processamento`
  MODIFY `cd_etapa_processamento` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT de tabela `feedback`
--
ALTER TABLE `feedback`
  MODIFY `cd_feedback` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de tabela `itens_de_linha`
--
ALTER TABLE `itens_de_linha`
  MODIFY `cd_item` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de tabela `linha`
--
ALTER TABLE `linha`
  MODIFY `cd_linha` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT de tabela `materiais`
--
ALTER TABLE `materiais`
  MODIFY `cd_material` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=103;
--
-- AUTO_INCREMENT de tabela `materiais_agenda`
--
ALTER TABLE `materiais_agenda`
  MODIFY `cd_mat_agenda` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=46;
--
-- AUTO_INCREMENT de tabela `motorista`
--
ALTER TABLE `motorista`
  MODIFY `id_motorista` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT de tabela `movimentacoes`
--
ALTER TABLE `movimentacoes`
  MODIFY `cd_movimentacao` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=45;
--
-- AUTO_INCREMENT de tabela `pessoa_fisica`
--
ALTER TABLE `pessoa_fisica`
  MODIFY `cd_pessoa_fisica` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=93;
--
-- AUTO_INCREMENT de tabela `pessoa_juridica`
--
ALTER TABLE `pessoa_juridica`
  MODIFY `cd_pessoa_juridica` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT de tabela `planta`
--
ALTER TABLE `planta`
  MODIFY `cd_planta` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=107;
--
-- AUTO_INCREMENT de tabela `pontos_coleta`
--
ALTER TABLE `pontos_coleta`
  MODIFY `cd_ponto_coleta` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=23;
--
-- AUTO_INCREMENT de tabela `Relatorios`
--
ALTER TABLE `Relatorios`
  MODIFY `cd_rel` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
--
-- AUTO_INCREMENT de tabela `rota_coleta`
--
ALTER TABLE `rota_coleta`
  MODIFY `cd_rota` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=19;
--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `cd_usuario` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- Restrições para dumps de tabelas
--

--
-- Restrições para tabelas `agendamento`
--
ALTER TABLE `agendamento`
ADD CONSTRAINT `agendamento_ibfk_1` FOREIGN KEY (`cd_pessoa_fisica`) REFERENCES `pessoa_fisica` (`cd_pessoa_fisica`) ON DELETE SET NULL,
ADD CONSTRAINT `agendamento_ibfk_2` FOREIGN KEY (`cd_pessoa_juridica`) REFERENCES `pessoa_juridica` (`cd_pessoa_juridica`) ON DELETE SET NULL;

--
-- Restrições para tabelas `bairro`
--
ALTER TABLE `bairro`
ADD CONSTRAINT `bairro_ibfk_1` FOREIGN KEY (`cd_cidade`) REFERENCES `cidade` (`cd_cidade`) ON DELETE CASCADE;

--
-- Restrições para tabelas `estoque`
--
ALTER TABLE `estoque`
ADD CONSTRAINT `estoque_ibfk_3` FOREIGN KEY (`cd_planta`) REFERENCES `planta` (`cd_planta`) ON DELETE CASCADE;

--
-- Restrições para tabelas `estoque_material`
--
ALTER TABLE `estoque_material`
ADD CONSTRAINT `estoque_material_ibfk_1` FOREIGN KEY (`cd_material`) REFERENCES `materiais` (`cd_material`),
ADD CONSTRAINT `estoque_material_ibfk_2` FOREIGN KEY (`cd_estoque`) REFERENCES `estoque` (`cd_estoque`);

--
-- Restrições para tabelas `etapas_processamento`
--
ALTER TABLE `etapas_processamento`
ADD CONSTRAINT `etapas_processamento_ibfk_1` FOREIGN KEY (`cd_material`) REFERENCES `materiais` (`cd_material`) ON DELETE CASCADE,
ADD CONSTRAINT `etapas_processamento_ibfk_2` FOREIGN KEY (`cd_etapa`) REFERENCES `Etapas` (`cd_etapa`);

--
-- Restrições para tabelas `feedback`
--
ALTER TABLE `feedback`
ADD CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`cd_agendamento`) REFERENCES `agendamento` (`cd_agendamento`) ON DELETE CASCADE;

--
-- Restrições para tabelas `materiais`
--
ALTER TABLE `materiais`
ADD CONSTRAINT `materiais_ibfk_1` FOREIGN KEY (`ie_linha`) REFERENCES `linha` (`cd_linha`) ON DELETE SET NULL;

--
-- Restrições para tabelas `materiais_agenda`
--
ALTER TABLE `materiais_agenda`
ADD CONSTRAINT `fk_materiais_agenda_material` FOREIGN KEY (`ie_material`) REFERENCES `materiais` (`cd_material`),
ADD CONSTRAINT `materiais_agenda_ibfk_1` FOREIGN KEY (`ie_agenda`) REFERENCES `agendamento` (`cd_agendamento`) ON DELETE CASCADE;

--
-- Restrições para tabelas `motorista`
--
ALTER TABLE `motorista`
ADD CONSTRAINT `motorista_ibfk_1` FOREIGN KEY (`ie_pessoa`) REFERENCES `pessoa_fisica` (`cd_pessoa_fisica`) ON UPDATE CASCADE;

--
-- Restrições para tabelas `movimentacoes`
--
ALTER TABLE `movimentacoes`
ADD CONSTRAINT `movimentacoes_ibfk_1` FOREIGN KEY (`cd_estoque`) REFERENCES `estoque` (`cd_estoque`) ON DELETE CASCADE,
ADD CONSTRAINT `movimentacoes_ibfk_2` FOREIGN KEY (`cd_material`) REFERENCES `materiais` (`cd_material`) ON DELETE CASCADE,
ADD CONSTRAINT `movimentacoes_ibfk_3` FOREIGN KEY (`cd_agendamento`) REFERENCES `agendamento` (`cd_agendamento`) ON DELETE CASCADE;

--
-- Restrições para tabelas `pontos_coleta`
--
ALTER TABLE `pontos_coleta`
ADD CONSTRAINT `fk_agendamento_ponto` FOREIGN KEY (`cd_agendamento`) REFERENCES `agendamento` (`cd_agendamento`),
ADD CONSTRAINT `pontos_coleta_ibfk_3` FOREIGN KEY (`cd_planta`) REFERENCES `planta` (`cd_planta`) ON DELETE SET NULL,
ADD CONSTRAINT `pontos_coleta_ibfk_4` FOREIGN KEY (`ie_rota`) REFERENCES `rota_coleta` (`cd_rota`) ON DELETE CASCADE;

--
-- Restrições para tabelas `rota_coleta`
--
ALTER TABLE `rota_coleta`
ADD CONSTRAINT `fk_rota_caminhao` FOREIGN KEY (`ie_caminhao`) REFERENCES `caminhao` (`id_caminhao`) ON UPDATE CASCADE,
ADD CONSTRAINT `fk_rota_motorista` FOREIGN KEY (`ie_motorista`) REFERENCES `motorista` (`id_motorista`) ON UPDATE CASCADE,
ADD CONSTRAINT `fk_rota_planta` FOREIGN KEY (`ie_planta`) REFERENCES `planta` (`cd_planta`);

--
-- Restrições para tabelas `usuario`
--
ALTER TABLE `usuario`
ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`cd_pessoa_fisica`) REFERENCES `pessoa_fisica` (`cd_pessoa_fisica`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
