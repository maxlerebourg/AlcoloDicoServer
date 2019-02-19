-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  mar. 19 fév. 2019 à 18:52
-- Version du serveur :  5.7.19
-- Version de PHP :  7.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `alcoolodico`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'cartes', '2019-02-16 11:56:56', '2019-02-16 11:56:56'),
(2, 'caps', '2019-02-16 11:56:56', '2019-02-16 11:56:56'),
(3, 'hess', '2019-02-16 11:56:56', '2019-02-16 11:56:56'),
(4, 'balles', '2019-02-16 11:56:56', '2019-02-16 11:56:56');

-- --------------------------------------------------------

--
-- Structure de la table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rate` int(11) DEFAULT NULL,
  `review` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `gameId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `gameId` (`gameId`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `comments`
--

INSERT INTO `comments` (`id`, `rate`, `review`, `createdAt`, `updatedAt`, `userId`, `gameId`) VALUES
(1, 5, 'J\'ai adoré ce jeu, un régal', '2019-02-19 18:50:06', '2019-02-19 18:50:06', 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `games`
--

DROP TABLE IF EXISTS `games`;
CREATE TABLE IF NOT EXISTS `games` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `preview` text,
  `rules` text,
  `images` text,
  `visible` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `games`
--

INSERT INTO `games` (`id`, `name`, `preview`, `rules`, `images`, `visible`, `createdAt`, `updatedAt`, `categoryId`, `userId`) VALUES
(1, 'Menteur', 'Jeu simple pouvant être joué par les petits et les grands, le Menteur vous fera passer un bon moment de rigolade !', 'Toutes les cartes sont distribuées.Chaque joueur joue chacun son tour dans le sens des aiguilles d\'une montre.Chaque carte posée est posée face cachée et est sensé être la même que celle posée précedemment. (Même valeur)Lorsque l\'un d\'entre vous pense que le dernier joueur ayant posé sa carte ment, il dit \\\"Menteur\\\".Si il a juste, le menteur prend toutes les cartes, sinon il les prend toutes.Quand un joueur n\'a plus de cartes, il est sacré gagnant.Tous les autres boivent', 'https://s2.qwant.com/thumbr/0x380/5/c/f06faf2a3ee2b828bae3f410186c9cd061be104d85f1110908e8f9ebb24211/jeu_de_cartes_par_54_ideal_poker_rami_belote_ou_bataille_pas_cher_1000.jpg?u=http%3A%2F%2Fstatic2.promobo.fr%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fimage%2F1200x1000%2F9df78eab33525d08d6e5fb8d27136e95%2Fj%2Fe%2Fjeu_de_cartes_par_54_ideal_poker_rami_belote_ou_bataille_pas_cher_1000.jpg&q=0&b=1&p=0&a=1', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(2, 'Marmotte', 'Un jeu de reflexion plutôt sympa à jouer lors de soirée ou vous êtes vraiment amochés. Se joue à beaucoup vu le peu de cartes à distribuer en début de partie.', 'Quatres cartes sont distribuées par personnes faces cachées et sont disposées en carré.Les joueurs regardent deux de leurs cartes et les reposent.Le reste des cartes non distribuées constitue la pioche.Une carte est posée face visible à côté de celle-ci, elle constitue ce qui sera la defausse.Le but est d\'avoir le moins de points possibles.Chaque joueur joue chacun son tour dans le sens des aiguilles d\'une montre.Il pioche une carte soit sur la pioche, soit sur la deffause.Il choisi alors soit de la conserver en échangeant avec une carte de son jeu, soit de la poser sur la defausse.Lorsqu\'une carte est posée sur la defausse, les joueurs peuvent deffauser la même carte.Quand un joueur pense avoir moins de points que les autres, il dit \\\"Marmotte\\\" à la fin de son tour de jeu, un dernier tour doit être fait.A la fin de ce tour, les joueurs retournent leurs cartes, celui en ayant le moins de points gagne.Si le gagnant n\'est pas celui qui l\'a annoncé, il double ses gorgées à prendre, les autres boivent.Les 10 valent 0. Les têtes valent 10Le valet permet de rejouer.La dame permet d\'échanger deux cartes sur le plateau.Le roi permet de regarder une carte sur le plateau.Bonne pioche autorisée (carte piochée qui peut être joué directement sur vous même).', 'http://jeuxdecartes1.e-monsite.com/medias/images/tamalou-2-.gif', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(3, 'Main Verte', 'Un jeu amusant avec un semblant de stratégie pour boire malin. ', '6-7 cartes sont distribuées à chacun des joueurs suivant le nombre de participants.Le reste des cartes non distribuées constitue la pioche.Une carte est posée face visible à côté de celle-ci, elle constitue ce qui sera la defausse.Le but est d\'avoir le moins de points possibles.Chaque joueur joue chacun son tour dans le sens des aiguilles d\'une montre.Il se defausse d\'ABORD d\'une carte ou plusieurs en envoyant soit une carte simple, un double, un triple, un carré ou une suite de même signe.Puis il pioche soit sur la pioche, soit sur la defausse.Lorsqu\'une carte est posée sur la defausse, les joueurs peuvent deffauser la même carte.Quand un joueur pense avoir moins de points que les autres, il dit \\\"Main Verte\\\" à la fin de son tour de jeu, un dernier tour doit être fait.A la fin de ce tour, les joueurs comptent leurs points.Si le gagnant n\'est pas celui qui l\'a annoncé, il double ses gorgées à prendre, les autres boivent.Les roi rouges valent 0. Les autres têtes valent 10Bonne pioche autorisée (carte piochée qui peut être joué directement sur vous même).', 'https://melusine.eu.org/syracuse/metapost/vrac/cartes/cartes-2.png', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(4, 'Hold\'em Poker Gorgée', 'Dans ce jeu, seul vos couilles s\'exprimeront, un jeu où il vaut mieux être avertie et attention au 70 gorgées qui peuvent tomber.', '2 cartes sont distribuées à chacun. Et 3 cartes sont positionnées au milieu face visibleLe jeu se déroule en 3 phases. Chacune est un tour où les joueurs font augmenter les gorgées en jeuA chaque phase, on pose une carte face visible sur la table.Le gagnant est soit le dernier en jeu, soit selon les règles de classement.Tous les autres boivent le nombre de gorgées qu\'ils ont misé jusqu\'a ce qu\'ils perdent ou qu\'ils abandonnent.', 'http://www.regoledelgioco.com/wp-content/uploads/2011/03/texas_hold_em-1024x603.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(5, 'Pyramide', 'Amusant en début de soirée, la pyramide saura ambiancer vos débuts de soirée difficile.', 'Le jeu se déroule en deux partie. La première où les cartes sont distribuées, et la seconde où la pyramide est visitée.On demande aux joueurs, l\'un après l\'autre : \\\"Rouge ou noir\\\", si il a bon il distribue 1 gorgée, sinon il en prend 1.Puis \\\"Plus ou moins\\\" que la carte précédente, si il a bon il distribue 2 gorgées, sinon il en prend 2.Puis \\\"Intérieur ou extérieur\\\" que les deux cartes précédentes, si il a bon il distribue 3 gorgées, sinon il en prend 3.Et enfin \\\"Carreau, Coeur, Pique ou Trèfle\\\", si il a bon il distribue 4 gorgées, sinon il en prend 4.Les cartes restantes sont disposées en pyramide.Les joueurs doivent retenir leurs cartes et les posées face cachée devant eux.On retournera les cartes une par une de la pyramide.Chaque étage compte pour 2 gorgées supplémentaires, le dernier vaut cul sec.Si un des joueurs possède une carte qui vient d\'être retournée, il désigne quelqu\'un qui doit boire.Le joueur attaqué boit ou dit \\\"Menteur\\\".Si il dit \\\"Menteur\\\" et que le joueur qui attaque a bien menti, l\'attaquant boit le double des gorgées distribuées, sinon c\'est l\'attaqué.A la fin, les joueurs retournent leurs cartes en énonçant leur valeur, c\'est 4 gorgées par faute.', 'https://www.jeux-alcool.com/wp-content/uploads/2013/04/pyramide-732x380.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(6, '81', 'Un jeu pour des soirées posées entre amis. Il mettra tout le monde d\'accord pour sa simplicité.', 'On distribue 2 cartes a chaque joueur.Tour à tour, les joueurs mettent une carte sur la défausse et en pioche une.A chaque carte posée, on incrémente de la valeur de la carte le compteur commun.Il ne faut pas dépasser 81.Vous devez boire à chaque dizaine (10, 20...), celui qui dépasse 81 boit 5 gorgées.L\'as vaut 1 ou 11.Le valet vaut -10La dame change de sens et contre les gorgées en jeu.Le roi passe le compteur à 70.', 'https://melusine.eu.org/syracuse/metapost/vrac/cartes/cartes-2.png', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(7, 'Caps', 'Jeu préféré des étudiants et c\'est le cas de le dire. Des dizaines de tournois sont organisés et finisse par le vomis du perdant.', 'Deux bieres pleines, Trois capsules.Posez une capsule à l\'envers sur la bière de chacun des participants.Tour à tour, lancez la caps pour faire tomber celle des autres.Celui dont la capsule tombe à le droit de contrer, si il n\'y arrive pas, il boit.Officiellement, une bière constitue 8 gorgées, bonne chance.', 'http://les-jeunes-et-lalcool.e-monsite.com/medias/images/1920071-1432387433677629-3326200423773758817-n.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 2, 1),
(8, '2Caps', 'Jeu des soirées où il fait froid, où vous n\'avez vraiment plus d\'idée ou quoique ce soit d\'autre à faire. Un bon jeu presque sans matériel.', 'Deux capsules.Tour à tour, lancez les deux capsules.Si l\'une est face cachée et l\'autre vible, une gorgée est stockée.Si les deux tombent face contre le sol, celui qui a lancé boit le nombre de gorgées stockée.Si les deux tombent face visible, celui qui a lancé distribue le nombre de gorgées stockée.', 'https://biere-boutique.fr/409-tm_large_default/capsules-26-mm-rouge.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 2, 1),
(9, 'Jeux de la hess', 'Un jeu technique et vraiment amusant lorsque la soirée commence à être bien arrosée. Trouvez un signe et c\'est partie pour de longues parties endiablées.', 'Chaque joueur choisi un signe et le montre aux autres.Le perdant ou le désigné lance le rythme des claps.A un moment, il doit faire son signe sur un temps, puis le signe d\'un camarade sur un autre temps.Si la personne ne remarque pas, il boit et relance le rythme.Si il le remarque, il doit faire son signe puis celui d\'un autre sur deux temps différents et ainsi de suite.', 'https://i.kym-cdn.com/entries/icons/original/000/021/012/clap_pzfqtq.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 3, 1),
(10, 'Switch', 'Un jeu simple à prendre en main et ne fera qu\'une bouchée des gens déjà un peu trop bien. A essayer, voir apprécier.', 'Un joueur fait un signe avec une main et dit \\\"Switch\\\".Si la personne ne remarque pas, il boit et relance.Si il remarque, il dit soit \\\"Bang\\\" qui changera le sens, soit \\\"Switch\\\" avec le même signe de main du joueur précédent.Lors de son tour, on peut pointer un joueur et dire \\\"Animals\\\".Si il dit le nom d\'un animal, celui qui l\'a demandé boit le nombre de gorgée qu\'il y a de syllabe. Sinon, il boit 3 gorgées.', 'https://s1.qwant.com/thumbr/700x0/b/1/138074989464a0b09931ffc26d1b7e8c31dea7678b9268503d711d79775807/592857175_640.73223.jpg?u=http%3A%2F%2Fi.amz.mshcdn.com%2FR9W_YTladVpWShfFUQ4Ja6vLZI4%3D%2F1200x630%2F2016%2F09%2F22%2Fb5%2F592857175_640.73223.jpg&q=0&b=1&p=0&a=1', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 3, 1),
(11, 'Le Fuck', 'Un jeu qui mettra tout le monde d\'accord, choisissez une cible et detruisez la. Vous verrez, elle en redemmandera.', '7-8 cartes sont distribuées entre les joueurs.Une carte est retournée et est placée sur la pile de cartes restantes. Cette carte constitue l\'atout.Les joueurs vont pouvoir joué chacun leur tour en disant \\\"Fuck Untel\\\".Les seules cartes pouvant être jouée n\'importe quand sont celles du même signe que l\'atout ou de la même valeur.Les cartes pouvant être joué temporairement sont les autres quand la cartes au dessus de la défausse est du même signe.Si les 4 cartes d\'une même valeur sont sortie, le dernier à s\'être pris le \\\"Fuck\\\" boit 1 gorgée.Lorsque plus personne ne peut joué, le joueur avec le plus de cartes restantes boit son nombre de cartes.', 'https://scontent-cdg2-1.xx.fbcdn.net/v/t1.0-9/21032430_452076498519008_4323735883170994029_n.jpg?_nc_cat=100&_nc_ht=scontent-cdg2-1.xx&oh=5658b6311bd2fdb38cde31f88f1d5034&oe=5CFA6C7C', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(12, 'PMU', 'Un jeu de chance qui se finira par un suicide du perdant, n\'oubliez pas de préparer le seau de vomis.', 'Les 4 valets sont disposés en ligne.Une ligne de 5 cartes est disposées face cachée verticalement à la ligne de valets.Toutes les 2 cartes une rangée parallèle de 4 cartes est posée.Les joueurs peuvent alors choisir leur signe et boire le nombre de gorgées pariées.Le reste de la pioche est retournée une carte par une carte, le signe de la carte détermine quel valet avance d\'une case.Lorsqu\'un valet arrive à l\'un des étages, la carte face cachée devant lui doit être du même signe pour passer.Le signe gagnant est celui arrivant à passer le second étage.Le gagnant distribue 2 fois sa mise.Le deuxieme, 1 fois sa mise.Le troisième boit 1 fois sa mise.Le dernier enchaine avec un bus.', 'http://images.delcampe.com/img_large/auction/000/299/547/818_002.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(13, 'Tour du Monde', 'Un jeu ou les plus chanceux se sentiront bien. Pour les autres, une hécatombe simple et efficace les attend.', 'Les cartes sont étalées en cercle autour d\'une bouteille.A tour de role, les joueurs piochent une carte dans le cercle puis la pose sur le goulot de la bouteille en laissant dépassé deux bords consécutifs.Si le joueur piochant une carte laisse un trou dans le cercle, il boit. Pareil si il fait tomber les cartes du goulot.Les cartes de 1 à 5 font boire leur chiffre, noir : tu prends, rouge : tu donnes.Les 6 lancent une partie de \\\"J\'ai déjà, je n\'ai jamais\\\".Les 7, une partie de \\\"J\'ai dans ma valise\\\".Les 8, une partie de \\\"Qui de vous deux\\\".Les 9, une partie de \\\"Ni oui, ni non\\\".Les 10, un \\\"Freeze\\\".Les valets, les hommes boivent.Les dames, les femmes boivent.Les roi, une partie de \\\"Roi des pouces\\\".', 'https://www.jeux-alcool.com/wp-content/uploads/2014/07/Palmito-732x380.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(14, '8 américain', 'Un jeu de cartes tirés du célèbre UNO qui est reproduit avec des cartes classiques, de bonnes parties vous attendent. ', '7 cartes sont distribuées par personnes, le reste constitue le talon.Le but est de ne plus avoir de cartes.Chaque carte posé doit soit être de la même forme, soit de la même valeur que la précédente.Les 8 se posent n\'importe quand et permet de choisir la forme.Les valets font sauter le tour du joueur suivant.Les as font changer le sens.Les 2 font piocher 2 cartes au suivant.', 'https://s2.qwant.com/thumbr/0x380/7/9/f9e5059858af3a08922667c14eeefc553ca05db0c198d72c8f4f76beb4d649/Play-Crazy-Eights-Step-11.jpg?u=https%3A%2F%2Fwww.wikihow.com%2Fimages%2F8%2F80%2FPlay-Crazy-Eights-Step-11.jpg&q=0&b=1&p=0&a=1', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(15, 'Beer Pong', 'Un jeu fait pour boire des grosse dose tout en s\'amusant. Ce jeu à déjà été testé et approuvé dans plusieurs pays ce qui en fait un jeu à connaitre.', '6 ou 10 verres sont disposés en triangle de chaque coté d\'une longue table.Une verre d\'eau de chaque coté servira a nettoyer la balle.Les verres sont remplis avec l\'alcool que vous voulez.Tour à tour, les deux équipe de joueurs vont lancé la balles pour atteindre un des verres en face.Si une équipe met la balle dans un verre, l\'autre équipe doit boire ce verre.L\'équipe qui n\'a plus de verres devant elle, perd.', 'https://thenypost.files.wordpress.com/2017/02/beerpong.jpg?quality=90&strip=all&w=1286', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 4, 1),
(16, 'Bus', 'Un jeu à faire après une partie de PMU, il donnera au perdant une bonne leçon.', '5 cartes sont alignées sauf une qui est retournée.Le joueur qui subit le Bus doit dire \\\"Plus ou Moins\\\" que la carte en dessous.Il avance une carte après l\'autre.S\'il perd, il se voit à nouveau prendre la sentance sur les cartes du tour précédent.Quand le joueur perd, il boit le nombre de carte(s) découverte(s)En cas d\'égalité, il boit puis passe à la carte suivante.Si l\'as tombe, il choisit si c\'est la plus petite carte ou la plus grande. Le choix du joueur restera le même tout le long du suplice.Le joueur doit deviner la dernière carte sans en avoir connaissance.', 'https://www.jeux-alcool.com/wp-content/uploads/2014/07/rougeounoir-732x380.jpg', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1),
(17, 'Le 21 ', 'Un jeu joué par les gogoles, inventé par un gogole.', 'A tour de rôle, les joueurs disent entre 1 et 3 nombres.Dire 2 nombre provoque un changement de sens.Vous ne devez jamais répété le dernier nombre dit sous peine d\'une gorgée.Celui arrivant à 21 bois et ajoute une règle.', 'https://s2.qwant.com/thumbr/0x380/f/2/6fcaa64bd770a5b171bbd91c0f543c74a5e659a8fa0a807d07d2a8936216e1/21plus.jpg?u=http%3A%2F%2Fwww2.uwstout.edu%2Fcontent%2Fhousing%2FSmart%26HealthyWeb%2Fimages%2F21plus%2F21plus.jpg&q=0&b=1&p=0&a=1', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 3, 1),
(18, 'Picard', 'Similaire à la Marmotte mais des règles différentes', 'Les joueurs jouent chacun leur tour.Ils ont 4 cartes devant eux dont 2 inconnus.Le joueur qui joue pioche une carte.Il décide ensuite, soit de la défausser, soit de la remplacer par l\'une des quatres cartes présentes devant lui.Le joueur qui pense avoir 10 points ou moins dis \\\"STOP\\\".Il reste alors un tour..', 'https://s2.qwant.com/thumbr/0x380/f/7/0fa17c2b9d6bbe7a0bcb11d88d3e4cf8babd88cccc48e5b1329f751ab9fc57/mini-jeu-cartes-p151184~1.jpg?u=http%3A%2F%2Fwww.mega-fetes.fr%2Fimages-produits%2Fmini-jeu-cartes-p151184%7E1.jpg&q=0&b=1&p=0&a=1', 1, '2019-02-19 18:49:18', '2019-02-19 18:49:18', 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pseudo` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pseudo` (`pseudo`),
  UNIQUE KEY `mail` (`mail`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `pseudo`, `firstname`, `lastname`, `mail`, `password`, `admin`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', 'Max', 'Lerebourg', 'maxlerebourg@gmail.com', 'password', 1, '2019-02-16 11:52:23', '2019-02-16 11:52:23'),
(2, 'Clarouille', 'Clara', 'Laumond', 'clara.laumond@gmail.com', 'password', 0, '2019-02-18 22:33:12', '2019-02-18 22:33:12'),
(3, 'JohnDoe', 'John', 'Doe', 'johndoe@gmail.com', 'password', 0, '2019-02-19 11:09:02', '2019-02-19 11:09:02');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`gameId`) REFERENCES `games` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `games`
--
ALTER TABLE `games`
  ADD CONSTRAINT `games_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `games_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
