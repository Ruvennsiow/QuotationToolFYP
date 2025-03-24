-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: testing_database
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `selling_price` decimal(10,2) DEFAULT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `supplier_details` varchar(255) DEFAULT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,'Pliers','Pliers for various hardware applications.',326.90,230.02,'Supplier A','pliers.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(2,'Multimeter','Multimeter for various hardware applications.',52.68,37.57,'Supplier A','multimeter.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(3,'Safety Glasses','Safety Glasses for various hardware applications.',97.61,85.25,'Supplier D','safety_glasses.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(4,'Hex Key Set','Hex Key Set for various hardware applications.',311.00,276.51,'Supplier B','hex_key_set.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(5,'Hammer','Hammer for various hardware applications.',350.36,296.93,'Supplier D','hammer.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(6,'Angle Grinder','Angle Grinder for various hardware applications.',352.94,258.72,'Supplier B','angle_grinder.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(7,'Washers','Washers for various hardware applications.',75.91,56.07,'Supplier D','washers.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(8,'Clamp','Clamp for various hardware applications.',250.60,153.53,'Supplier D','clamp.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(9,'Adjustable Wrench','Adjustable Wrench for various hardware applications.',31.03,21.19,'Supplier A','adjustable_wrench.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(10,'Ratchet','Ratchet for various hardware applications.',497.40,424.27,'Supplier B','ratchet.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(11,'Angle Grinder','Angle Grinder for various hardware applications.',225.74,170.41,'Supplier D','angle_grinder.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(12,'Sander','Sander for various hardware applications.',217.09,155.06,'Supplier A','sander.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(13,'Crowbar','Crowbar for various hardware applications.',344.23,228.22,'Supplier C','crowbar.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(14,'Welding Mask','Welding Mask for various hardware applications.',466.10,392.47,'Supplier A','welding_mask.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(15,'Torque Wrench','Torque Wrench for various hardware applications.',155.34,115.06,'Supplier C','torque_wrench.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(16,'Angle Grinder','Angle Grinder for various hardware applications.',232.68,187.88,'Supplier D','angle_grinder.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(17,'Allen Wrench','Allen Wrench for various hardware applications.',157.36,129.01,'Supplier D','allen_wrench.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(18,'Heat Gun','Heat Gun for various hardware applications.',341.91,280.48,'Supplier B','heat_gun.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(19,'Ratchet','Ratchet for various hardware applications.',202.97,153.83,'Supplier A','ratchet.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(20,'Drill','Drill for various hardware applications.',291.50,229.52,'Supplier B','drill.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(21,'Air Compressor','Air Compressor for various hardware applications.',354.09,279.02,'Supplier D','air_compressor.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(22,'Work Light','Work Light for various hardware applications.',44.74,32.69,'Supplier C','work_light.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(23,'Nail Gun','Nail Gun for various hardware applications.',91.92,72.01,'Supplier D','nail_gun.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(24,'Work Light','Work Light for various hardware applications.',347.66,275.19,'Supplier A','work_light.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(25,'Gloves','Gloves for various hardware applications.',96.87,64.39,'Supplier A','gloves.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(26,'Workbench','Workbench for various hardware applications.',78.62,52.14,'Supplier D','workbench.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(27,'Tile Cutter','Tile Cutter for various hardware applications.',137.44,88.96,'Supplier B','tile_cutter.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(28,'Tape Measure','Tape Measure for various hardware applications.',32.25,23.82,'Supplier C','tape_measure.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(29,'Gloves','Gloves for various hardware applications.',77.01,59.77,'Supplier C','gloves.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(30,'Adjustable Wrench','Adjustable Wrench for various hardware applications.',229.77,191.44,'Supplier B','adjustable_wrench.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(31,'Bolts','Bolts for various hardware applications.',400.56,355.52,'Supplier C','bolts.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(32,'Stud Finder','Stud Finder for various hardware applications.',493.47,442.44,'Supplier C','stud_finder.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(33,'Bolts','Bolts for various hardware applications.',193.07,125.67,'Supplier D','bolts.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(34,'Screws','Screws for various hardware applications.',240.71,194.32,'Supplier A','screws.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(35,'Heat Gun','Heat Gun for various hardware applications.',246.66,178.47,'Supplier C','heat_gun.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(36,'Safety Glasses','Safety Glasses for various hardware applications.',277.00,191.43,'Supplier A','safety_glasses.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(37,'Sandpaper','Sandpaper for various hardware applications.',421.67,335.26,'Supplier A','sandpaper.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(38,'Tile Cutter','Tile Cutter for various hardware applications.',351.55,262.67,'Supplier C','tile_cutter.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(39,'Heat Gun','Heat Gun for various hardware applications.',167.52,111.31,'Supplier C','heat_gun.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(40,'Crowbar','Crowbar for various hardware applications.',381.45,333.50,'Supplier B','crowbar.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(41,'Pipe Cutter','Pipe Cutter for various hardware applications.',194.08,125.73,'Supplier C','pipe_cutter.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(42,'Angle Grinder','Angle Grinder for various hardware applications.',289.12,256.84,'Supplier B','angle_grinder.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(43,'Paint Brushes','Paint Brushes for various hardware applications.',64.79,45.51,'Supplier B','paint_brushes.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(44,'Paint Brushes','Paint Brushes for various hardware applications.',392.91,349.40,'Supplier A','paint_brushes.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(45,'C-clamp','C-clamp for various hardware applications.',347.47,263.52,'Supplier C','c-clamp.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(46,'Bolts','Bolts for various hardware applications.',434.68,377.78,'Supplier D','bolts.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(47,'Adjustable Wrench','Adjustable Wrench for various hardware applications.',328.70,216.81,'Supplier D','adjustable_wrench.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(48,'Nails','Nails for various hardware applications.',339.38,255.68,'Supplier A','nails.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(49,'Sander','Sander for various hardware applications.',43.48,27.07,'Supplier B','sander.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14'),(50,'Screws','Screws for various hardware applications.',88.75,57.73,'Supplier C','screws.jpg','2025-01-12 21:18:14','2025-01-12 21:18:14');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'user1','pass123','2025-01-12 21:03:05'),(2,'user2','pass456','2025-01-12 21:03:05');
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotation_items`
--

DROP TABLE IF EXISTS `quotation_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotation_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quotation_id` int NOT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `supplier_name` varchar(255) DEFAULT NULL,
  `status` enum('not sent','pending','received') DEFAULT 'not sent',
  PRIMARY KEY (`id`),
  KEY `quotation_id` (`quotation_id`),
  CONSTRAINT `quotation_items_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotation_items`
--

LOCK TABLES `quotation_items` WRITE;
/*!40000 ALTER TABLE `quotation_items` DISABLE KEYS */;
INSERT INTO `quotation_items` VALUES (1,1,'wire cutter',10,5.00,'No known supplier','not sent'),(2,1,'Pliers',12,6.00,'No known supplier','not sent'),(3,1,'Washers',1000,7.00,'No known supplier','not sent'),(4,1,'Adjustable Wrench',222,10.00,'No known supplier','not sent'),(5,2,'wire cutter',10,33.00,'No known supplier','not sent'),(6,2,'Washers',1000,44.00,'No known supplier','not sent'),(7,2,'Pliers',12,55.00,'No known supplier','not sent'),(8,2,'Adjustable Wrench',222,11.00,'No known supplier','not sent'),(9,3,'wire cutter',10,NULL,'No known supplier','not sent'),(10,3,'Pliers',12,NULL,'No known supplier','not sent'),(11,3,'Washers',1000,NULL,'No known supplier','not sent'),(12,3,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(13,4,'wire cutter',10,NULL,'No known supplier','not sent'),(14,4,'Washers',1000,NULL,'No known supplier','not sent'),(15,4,'Pliers',12,NULL,'No known supplier','not sent'),(16,4,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(17,5,'Pliers',12,NULL,'No known supplier','not sent'),(18,5,'wire cutter',10,NULL,'No known supplier','not sent'),(19,5,'Washers',1000,NULL,'No known supplier','not sent'),(20,5,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(21,6,'wire cutter',10,NULL,'No known supplier','not sent'),(22,6,'Washers',1000,NULL,'No known supplier','not sent'),(23,6,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(24,6,'Pliers',12,NULL,'No known supplier','not sent'),(25,7,'wire cutter',10,NULL,'No known supplier','not sent'),(26,7,'Washers',1000,NULL,'No known supplier','not sent'),(27,7,'Pliers',12,NULL,'No known supplier','not sent'),(28,7,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(29,8,'wire cutter',10,NULL,'No known supplier','not sent'),(30,8,'Washers',1000,NULL,'No known supplier','not sent'),(31,8,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(32,8,'Pliers',12,NULL,'No known supplier','not sent'),(33,9,'wire cutter',10,NULL,'No known supplier','not sent'),(34,9,'Pliers',12,NULL,'No known supplier','not sent'),(35,9,'Washers',1000,NULL,'No known supplier','not sent'),(36,9,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(37,10,'wire cutter',10,NULL,'No known supplier','not sent'),(38,10,'Pliers',12,NULL,'No known supplier','not sent'),(39,10,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(40,10,'Washers',1000,NULL,'No known supplier','not sent'),(41,11,'Pliers',12,NULL,'No known supplier','not sent'),(42,11,'wire cutter',10,NULL,'No known supplier','not sent'),(43,11,'Washers',1000,NULL,'No known supplier','not sent'),(44,11,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(45,12,'wire cutter',10,NULL,'No known supplier','not sent'),(46,12,'Pliers',12,NULL,'No known supplier','not sent'),(47,12,'Washers',1000,NULL,'No known supplier','not sent'),(48,12,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(49,13,'wire cutter',10,NULL,'No known supplier','not sent'),(50,13,'Washers',1000,NULL,'No known supplier','not sent'),(51,13,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(52,13,'Pliers',12,NULL,'No known supplier','not sent'),(53,14,'wire cutter',10,NULL,'No known supplier','not sent'),(54,14,'Pliers',12,NULL,'No known supplier','not sent'),(55,14,'Washers',1000,NULL,'No known supplier','not sent'),(56,14,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(57,15,'wire cutter',10,NULL,'No known supplier','not sent'),(58,15,'Pliers',12,NULL,'No known supplier','not sent'),(59,15,'Washers',1000,NULL,'No known supplier','not sent'),(60,15,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(61,16,'wire cutter',10,NULL,'No known supplier','not sent'),(62,16,'Pliers',12,NULL,'No known supplier','not sent'),(63,16,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(64,16,'Washers',1000,NULL,'No known supplier','not sent'),(65,17,'wire cutter',10,NULL,'No known supplier','not sent'),(66,17,'Pliers',12,NULL,'No known supplier','not sent'),(67,17,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(68,17,'Washers',1000,NULL,'No known supplier','not sent'),(69,18,'wire cutter',10,NULL,'No known supplier','not sent'),(70,18,'Pliers',12,NULL,'No known supplier','not sent'),(71,18,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(72,18,'Washers',1000,NULL,'No known supplier','not sent'),(73,19,'wire cutter',10,NULL,'No known supplier','not sent'),(74,19,'Pliers',12,NULL,'No known supplier','not sent'),(75,19,'Washers',1000,NULL,'No known supplier','not sent'),(76,19,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(77,20,'wire cutter',10,NULL,'No known supplier','not sent'),(78,20,'Washers',1000,NULL,'No known supplier','not sent'),(79,20,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(80,20,'Pliers',12,NULL,'No known supplier','not sent'),(81,21,'wire cutter',10,NULL,'No known supplier','not sent'),(82,21,'Pliers',12,NULL,'No known supplier','not sent'),(83,21,'Washers',1000,NULL,'No known supplier','not sent'),(84,21,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(85,22,'wire cutter',10,NULL,'No known supplier','not sent'),(86,22,'Pliers',12,NULL,'No known supplier','not sent'),(87,22,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(88,22,'Washers',1000,NULL,'No known supplier','not sent'),(89,23,'wire cutter',10,NULL,'No known supplier','not sent'),(90,23,'Pliers',12,NULL,'No known supplier','not sent'),(91,23,'Washers',1000,NULL,'No known supplier','not sent'),(92,23,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(93,24,'wire cutter',10,NULL,'No known supplier','not sent'),(94,24,'Washers',1000,NULL,'No known supplier','not sent'),(95,24,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(96,24,'Pliers',12,NULL,'No known supplier','not sent'),(97,25,'wire cutter',10,NULL,'No known supplier','not sent'),(98,25,'Pliers',12,NULL,'No known supplier','not sent'),(99,25,'Washers',1000,NULL,'No known supplier','not sent'),(100,25,'Adjustable Wrench',222,NULL,'No known supplier','not sent'),(101,26,'Scissors',12,NULL,'No known supplier','not sent'),(102,27,'Pants',92,NULL,'No known supplier','not sent'),(103,28,'Shoes',24,NULL,'No known supplier','not sent'),(104,29,'Crowbar',266,NULL,'Supplier C','not sent'),(105,30,'Multimeter',24545,NULL,'Supplier A','not sent'),(106,31,'Pliers',10,NULL,'Supplier A','pending'),(107,31,'Scissors',10,NULL,'No known supplier','not sent');
/*!40000 ALTER TABLE `quotation_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotations`
--

DROP TABLE IF EXISTS `quotations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `order_date` date NOT NULL,
  `status` enum('pending','completed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotations`
--

LOCK TABLES `quotations` WRITE;
/*!40000 ALTER TABLE `quotations` DISABLE KEYS */;
INSERT INTO `quotations` VALUES (1,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:45:30','2025-01-12 21:45:30'),(2,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:45:38','2025-01-12 21:45:38'),(3,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:08','2025-01-12 21:46:08'),(4,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:09','2025-01-12 21:46:09'),(5,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:09','2025-01-12 21:46:09'),(6,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:09','2025-01-12 21:46:09'),(7,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:12','2025-01-12 21:46:12'),(8,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:12','2025-01-12 21:46:12'),(9,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:12','2025-01-12 21:46:12'),(10,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:12','2025-01-12 21:46:12'),(11,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:13','2025-01-12 21:46:13'),(12,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:13','2025-01-12 21:46:13'),(13,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:13','2025-01-12 21:46:13'),(14,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:13','2025-01-12 21:46:13'),(15,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:14','2025-01-12 21:46:14'),(16,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:14','2025-01-12 21:46:14'),(17,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:14','2025-01-12 21:46:14'),(18,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:14','2025-01-12 21:46:14'),(19,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:14','2025-01-12 21:46:14'),(20,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:53','2025-01-12 21:46:53'),(21,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:54','2025-01-12 21:46:54'),(22,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:54','2025-01-12 21:46:54'),(23,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:54','2025-01-12 21:46:54'),(24,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:54','2025-01-12 21:46:54'),(25,'john doe pte ltd','2025-01-13','pending','2025-01-12 21:46:55','2025-01-12 21:46:55'),(26,'jeff pte ltd','2025-01-13','pending','2025-01-12 21:52:57','2025-01-12 21:52:57'),(27,'keerr pte ltd','2025-01-13','pending','2025-01-12 22:07:22','2025-01-12 22:07:22'),(28,'john doe','2025-01-13','pending','2025-01-12 22:08:57','2025-01-12 22:08:57'),(29,'phoneyy ','2025-01-13','pending','2025-01-12 22:17:26','2025-01-12 22:17:26'),(30,'geryy pte ltd','2025-01-13','pending','2025-01-12 22:37:16','2025-01-12 22:37:16'),(31,'ruvenn siow <ruvenn12@gmail.com>','2025-01-14','pending','2025-01-13 20:45:42','2025-01-13 20:45:42');
/*!40000 ALTER TABLE `quotations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `supplier_id` int NOT NULL AUTO_INCREMENT,
  `supplier_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `number` varchar(20) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (1,'Supplier A','ruvenn12@gmail.com','1234567890','Specializes in electronic components','2025-01-14 20:30:15','2025-01-14 20:30:15'),(2,'Supplier B','ruvenn69@gmail.com','9876543210','Wholesale supplier for office supplies','2025-01-14 20:30:15','2025-01-14 20:30:15'),(3,'Supplier C','ruvenn12@hotmail.com','5678901234','Manufacturer of industrial tools','2025-01-14 20:30:15','2025-01-14 20:30:15'),(4,'Supplier D','rsiow001@e.ntu.edu.sg','6789012345','Distributor of cleaning equipment','2025-01-14 20:30:15','2025-01-14 20:30:15');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-15  4:40:28
