-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: 360_class
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `idProducts` int NOT NULL AUTO_INCREMENT,
  `prodName` varchar(45) DEFAULT NULL,
  `prodDesc` longtext,
  `price` int DEFAULT NULL,
  `datetime_created` datetime DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL,
  `is_exchanged` tinyint DEFAULT NULL,
  `posted_by` varchar(45) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  PRIMARY KEY (`idProducts`),
  UNIQUE KEY `idProducts_UNIQUE` (`idProducts`),
  KEY `posted_by_idx` (`posted_by`),
  CONSTRAINT `posted_by` FOREIGN KEY (`posted_by`) REFERENCES `users` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (4,'Seeds','For growing flowers and whatnot',7,'2025-04-11 13:23:13',0,0,'Ian',29),(5,'Butter','Made from cow\'s milk, counted in individual sticks',3,'2025-04-12 12:20:08',0,0,'Enoch',97),(6,'Oats','A part of every healthy diet! Measured in pounds',8,'2025-04-12 12:22:10',0,0,'Ian',53),(10,'Socks','Cover up your feet and stay warm!',12,'2025-04-13 13:53:06',0,0,'Enoch',18),(58,'Hats','Silly decorative hats for parties and more!',2,'2025-04-27 20:22:55',0,0,'Partner1',190),(63,'Pants','To keep your legs warm in the cold.',20,'2025-04-27 21:32:11',0,0,'Partner2',180);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `idtransactions` int NOT NULL AUTO_INCREMENT,
  `item_exchanged_1` int DEFAULT NULL,
  `item_exchanged_2` int DEFAULT NULL,
  `party_1` varchar(45) DEFAULT NULL,
  `party_2` varchar(45) DEFAULT NULL,
  `date_started` datetime DEFAULT NULL,
  `date_ended` datetime DEFAULT NULL,
  `hash_key` varchar(45) NOT NULL,
  `via_1` varchar(45) DEFAULT NULL,
  `via_2` varchar(45) DEFAULT NULL,
  `quantity_1` int DEFAULT NULL,
  `quantity_2` int DEFAULT NULL,
  `value_1` int DEFAULT NULL,
  `value_2` int DEFAULT NULL,
  `is_active` tinyint DEFAULT NULL,
  `part_stage` int DEFAULT NULL,
  PRIMARY KEY (`idtransactions`),
  UNIQUE KEY `hash_key_UNIQUE` (`hash_key`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `idusers` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `credit` int DEFAULT NULL,
  `is_admin` tinyint DEFAULT NULL,
  `password` varchar(45) NOT NULL,
  `phone_num` varchar(45) DEFAULT NULL,
  `street_num` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `zip_code` int DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `is_approved` tinyint DEFAULT NULL,
  PRIMARY KEY (`idusers`,`username`),
  UNIQUE KEY `idusers_UNIQUE` (`idusers`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Enoch',NULL,NULL,'Enoch','2088212650','420 s Asbury st #9','Moscow','Id',83843,'Myer9658@vandals.uidaho.edu',1),(3,'Ian',NULL,1,'asdf','5099999999','7717 W B Rd','Moscow','ID',83843,'Here@ian.com',1),(6,'Partner1',NULL,NULL,'asdf','1110001234','500 South Avenue','Seattle','WA',99001,'partner1@gmail.com',1),(7,'Partner2',NULL,NULL,'asdf','1110001212','502 South Avenue','Seattle','WA',99001,'partner2@gmail.com',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-29 13:50:29
