# Szlosek, Barsznica, 01.11.2020 14:18, "Baza danych szkoły" (temat nr 2)

## Co ma być zawarte w PDF

```diff
- podstawowe założenia projektu (cel, główne założenia, możliwości, ograniczenia przyjęte przy projektowaniu),
- diagram ER,
- schemat bazy danych (diagram relacji),
- dodatkowe więzy integralności danych (nie zapisane w schemacie),
- utworzone indeksy,
- opis stworzonych widoków,
- opis procedur składowanych,
- opis wyzwalaczy,
- skrypt tworzący bazę danych,
- typowe zapytania.
```

## Minimalne wymagania dotyczące bazy danych:

```diff
+ 8 poprawnie zaprojektowanych tabel (na osobę), przy czym w bazie danych powinno być minimum 10 tabel,
+ baza powinna zawierać dane dotyczące atrybutów, których wartość zmienia się w czasie,
+ baza powinna zawierać tabele realizujące jeden ze schematów dziedziczenia,
- 10 widoków lub funkcji,
- baza danych powinna być odpowiednio oprogramowana z wykorzystaniem procedur składowanych i wyzwalaczy (co najmniej po 5 procedur i po 5 wyzwalaczy).
+ należy zaprojektować strategię pielęgnacji bazy danych (kopie zapasowe),
- można utworzyć dwa programy klienckie: jeden umożliwiający pracę administratorską (użytkowników ze zwiększonymi uprawnieniami), drugi umożliwiający pracę zwykłych użytkowników.
```

# Tabele

- Typ Pracownika
- Pracownicy
- Przedmioty
- Przedmioty Nauczycieli
- Klasy
- Uczniowie
- Uczniowie Klas
- Uwagi (uczniów)
- Typ ocen (sprawdzian, kartkówka itd.)
- Oceny
- Plan Zajęć
- Sale
- Czas Zajęć
- Dni Wolne
- Urlopy Pracowników
- Koła
- Osoby

------------------------------------------------------------

# Podstawowe założenia projektu

Głównym celem projektu jest stworzenie bazy danych szkoły, która przechowywuje informacje na temat pracowników budynku, informacji na temat uczniów, ich wychowawców, ocen z danego przedmiot i planu zajęć. Projekt jest z założenia ograniczony tylko do pokazania podstawowych fukncji z możliwością rozwoju bazy danych w przyszłości do odpowiednich potrzeb.

# Strategia pielęgnacji bazy danych

- Pełna kopia zapasowa co tydzień
- Różnicowa kopia zapasowa codziennie po północy

# Diagram ER

# Schemat Bazy Danych

# Dodatkowe Więzy intergralności danych

# Utworzone indeksy

# Opis stworzonych widoków

# Opis procedur składowych

# Opis wyzwalaczy

# Skrypt tworzący bazę danych

```sql
-- Usun poprzednia baze danych
USE master
IF EXISTS(select * from sys.databases where name='SzkolaDB')
DROP DATABASE SzkolaDB
-- Stworzenie bazy danych
CREATE DATABASE SzkolaDB;
```
```sql
USE SzkolaDB;
-- Stworzenie tabeli Typ Pracownika
CREATE TABLE [Typ Pracownika] (
    ID TINYINT IDENTITY(1,1) PRIMARY KEY,
    Nazwa VARCHAR(255) NOT NULL
);
-- Stworzenie tabeli Typ Ocen
CREATE TABLE [Typ Ocen] (
    ID TINYINT IDENTITY(1,1) PRIMARY KEY,
    Nazwa VARCHAR(255) NOT NULL,
    Waga TINYINT DEFAULT 1
);
-- Stworzenie tabeli Czas Zajec
CREATE TABLE [Czas Zajec] (
    ID TINYINT IDENTITY(1,1) PRIMARY KEY,
    [Od Kiedy] TIME
)
-- Stworzenie tabeli Sale
CREATE TABLE Sale (
    [Numer Sali] INT PRIMARY KEY NOT NULL,
    Nazwa VARCHAR(255)
)
-- Stworzenie tabeli Dni Wolne
CREATE TABLE [Dni Wolne] (
    Kiedy DATETIME
)
-- Stworzenie tabeli Osoby
CREATE TABLE Osoby (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Imie VARCHAR(255) NOT NULL,
    Nazwisko VARCHAR(255) NOT NULL
)
-- Stworzenie tabeli Pracownicy
CREATE TABLE Pracownicy (
    ID INT REFERENCES Osoby(ID) ON DELETE CASCADE PRIMARY KEY NOT NULL,
    [Numer Telefonu] VARCHAR(16),
    Typ TINYINT REFERENCES [Typ Pracownika](ID) NOT NULL
);
-- Stworzenie tabeli Urlopy
CREATE TABLE Urlopy (
    [ID Pracownika] INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL,
    Od TIME,
    Do TIME
)
-- Stworzenie tabeli Przedmioty
CREATE TABLE [Spis Przedmiotów] (
    ID TINYINT IDENTITY(1,1) PRIMARY KEY,
    [Nazwa Przedmiotu] VARCHAR(255) NOT NULL
);
-- Stworzenie tabeli Przedmioty Nauczycieli
CREATE TABLE [Przedmioty Nauczycieli] (
    ID INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL,
    Przedmiot TINYINT REFERENCES [Spis Przedmiotów](ID) ON DELETE CASCADE NOT NULL
);
-- Stworzenie tabeli Klasy
CREATE TABLE Klasy (
    [Nazwa Klasy] VARCHAR(10) PRIMARY KEY NOT NULL
);
-- Stworzenie tabeli Uczniowie
CREATE TABLE Uczniowie (
    ID INT REFERENCES Osoby(ID) ON DELETE CASCADE PRIMARY KEY NOT NULL,
    [Numer Telefonu Do Rodzica] VARCHAR(16)
);
-- Stworzenie tabeli Uczniowie Klas
CREATE TABLE [Uczniowie Klas] (
    [Nazwa Klasy] VARCHAR(10) PRIMARY KEY REFERENCES Klasy([Nazwa Klasy]) NOT NULL,
    Uczen INT REFERENCES Osoby(ID) NOT NULL
);
-- Stworzenie tabeli Uwagi
CREATE TABLE Uwagi (
    UwagaID INT IDENTITY(1,1) PRIMARY KEY,
    UczenID INT REFERENCES Uczniowie(ID) ON DELETE CASCADE NOT NULL,
    Opis TEXT NOT NULL,
    Tworca INT REFERENCES Pracownicy(ID) NOT NULL
);
-- Stworzenie tabeli Oceny
CREATE TABLE Oceny (
    UczenID INT REFERENCES Uczniowie(ID) NOT NULL,
    Ocena TINYINT NOT NULL,
    [Typ Oceny] TINYINT REFERENCES [Typ Ocen](ID) NOT NULL,
    Przedmiot TINYINT REFERENCES [Spis Przedmiotów](ID) ON DELETE CASCADE NOT NULL,
    Opis TEXT,
    Wpisujacy INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL,
    Kiedy DATETIME2 DEFAULT CURRENT_TIMESTAMP
);
-- Stworzenie tabeli Plan Zajec
CREATE TABLE [Plan Zajec] (
    Przedmiot TINYINT REFERENCES [Spis Przedmiotów](ID) ON DELETE CASCADE NOT NULL,
    Nauczyciel INT REFERENCES Pracownicy(ID) NOT NULL,
    Klasa VARCHAR(10) REFERENCES Klasy([Nazwa Klasy]) NOT NULL,
    Dzien TINYINT NOT NULL,
    Kiedy TINYINT REFERENCES [Czas Zajec](ID) NOT NULL,
    Sala TINYINT REFERENCES Sale([Numer Sali]) NOT NULL
);
-- Stworzenie tabeli Kola
CREATE TABLE Kola (
    Nauczyciel INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL,
    Dzien TINYINT NOT NULL,
    Kiedy TINYINT REFERENCES [Czas Zajec](ID) NOT NULL,
    Sala TINYINT REFERENCES Sale([Numer Sali]) NOT NULL,
    [Nazwa Kola] VARCHAR(255) NOT NULL
);
```
```sql
-- Stworzenie widoku Lista Uczniow

```
```sql
-- Wstawienie przykładowych rekordów do tabel
INSERT INTO [Typ Pracownika](Nazwa) VALUES
('Dyrektor'), 
('Administracja'), 
('Ekipa sprzątająca'), 
('Nauczyciel')

INSERT INTO [Typ Ocen](Nazwa, Wage) VALUES
('Aktywność',1),
('Kartkówka',2),
('Sprawdzian',3),
('Projekt',3),
('Konkurs',2),
('Praca domowa',1),
('Odpytywanie',1)

INSERT INTO [Czas Zajec]([Od Kiedy]) VALUES
('7:10'),
('8:00'),
('8:55'),
('9:50'),
('10:45'),
('11:40'),
('12:45'),
('13:40'),
('14:35'),
('15:30'),
('16:30')

INSERT INTO Sale([Numer Sali], Nazwa) VALUES
('101', 'Sala językowa'),
('102', 'Sala językowa'),
('103', 'Sala językowa'),
('104', 'Sala językowa'),
('105', 'Sala językowa'),
('106', 'Sala od matematki'),
('107', 'Sala od matematki'),
('108', 'Sekretariat'),
('109', 'Dyrekcja'),
('110', 'Sala'),
('201', 'Sala'),
('202', 'Sala'),
('203', 'Sala'),
('204', 'Sala'),
('205', 'Sala'),
('301', 'Sala'),

INSERT INTO [Dni Wolne](Kiedy) VALUES
('20200108'),
('20200121'),
('20200214'),
('20200312'),
('20200421'),
('20200921'),
('20201111'),
('20201224'),
('20201225')

INSERT INTO Osoby(Imie, Nazwisko) VALUES
('Zenek','Martyniuk'),
('Władysław','Jagiełło'),
('Jan','Seriusz'),
('Ken','Damino'),
('Jan','Anatomiusz'),
('Maciej','Jankowski'),
('Karol','Kanodziej'),
('Oskar','Przybylski'),
('Artur','Krol'),
('Henryk','Sienkiewicz'),
('Matylda','Nowak'),
('Lucyna','Moskowiak'),
('Aleksandra','Bytomska'),
('Nadia','Milowicz'),
('Agnieszka','Lipka'),
('Tatiana','Zlotko'),
('Honorata','Siemowicz'),
('Milena','Anastowicz'),
('Urszula','Kinek'),
('Irena','Portowicz')

INSERT INTO Pracownicy(ID, [Numer Telefonu], Typ) VALUES
(1,NULL,1),
(2,'152512241',2),
(3,'612613612',2),
(4,'125151111',3),
(5,NULL,3),
(6,NULL,4),
(7,NULL,4),
(8,'889741523',4),
(9,'352776418',4),
(10,'556789921',4),
(11,'663992881',4),
(12,'559876543',4),
(13,'886543112',4),
(14,'534665410',4),
(15,'643997612',4),
(16,'559813456',4),
(17,'755086732',4),
(18,'901887322',4),
(19,'654337820',4),
(20,'998451002',4)

INSERT INTO [Spis Przedmiotów]([Nazwa Przedmiotu]) VALUES
('Język polski'),
('Język angielski'),
('Język niemiecki'),
('Język hiszpański'),
('Język francuski'),
('Język rosyjski'),
('Język łacińśki'),
('Matematyka'),
('Informatyka'),
('Fizyka'),
('Chemia'),
('Biologia'),
('Wychowanie fizyczne'),
('Historia'),
('Wiedza do życia w rodzinie'),
('Edukacja dla bezpieczeństwa')

INSERT INTO [Przedmioty Nauczycieli](ID, Przedmiot) VALUES
(6, 1),(6, 2),(7, 3),(8, 4),(9, 5),(10, 6),(11, 7),(12, 1),(13, 8),(14, 9),(15, 10),(16, 11),(17, 12),(18, 13),(19, 14),(20, 15),(20, 16)

INSERT INTO Klasy([Nazwa Klasy]) VALUES
('1A'),('1B'),('1C'),('1D'),('1E'),('1F'),
('2A'),('2B'),('2C'),('2D'),('2E'),
('3A'),('3B'),('3C'),('3D'),('3E')

INSERT INTO Uczniowie(ID, Imie, Nazwisko, [Numer Telefonu Do Rodzica]) VALUES
(21,'Carlos','Kelly','674692364'),
(22,'Harold','James','336860628'),
(23,'Henry','Martin','947446770'),
(24,'Earl','Powell','091843778'),
(25,'Martin','Nelson','588758593'),
(26,'Brian','Campbell','480280287'),
(27,'Alice','Bailey','146215678'),
(28,'Barbara','White','978789825'),
(29,'Rachel','Allen','118917758'),
(30,'Jessica','Lee','369744971'),
(31,'Janice','Rivera','676620670'),
(32,'Bruce','Brown','851529601'),
(33,'Lillian','Gonzales','416956734'),
(34,'Lois','Thompson','667584689'),
(35,'Donald','Patterson','165380989'),
(36,'Ernest','Walker','808785659'),
(37,'Jeremy','Evans','306307942'),
(38,'Jerry','Richardson','286621569'),
(39,'Bobby','Sanchez','567016701'),
(40,'Beverly','Rogers','927856982'),
(41,'Steve','Phillips','149301395'),
(42,'Margaret','Hill','192285402'),
(43,'Nicole','Lopez','108147571'),
(44,'Denise','Reed','070305772'),
(45,'Evelyn','Gonzalez','968839327'),
(46,'Charles','Flores','056183065'),
(47,'Donna','Cooper','084331834'),
(48,'Thomas','Howard','690550671'),
(49,'Robert','Johnson','136483652'),
(50,'Sandra','Simmons','172459184'),
(51,'Paula','Ross','578534091'),
(52,'Arthur','Butler','990566697'),
(53,'Jennifer','Smith','658059319'),
(54,'Christine','Hughes','242589622'),
(55,'Martha','Price','903134835'),
(56,'Ann','Bell','321130880'),
(57,'Brenda','Rodriguez','855996933'),
(58,'Frances','Henderson','343704492'),
(59,'Steven','Perez','380962807'),
(60,'Adam','Mitchell','170022668'),
(61,'Tina','Torres','136836629'),
(62,'Eric','Bennett','245601380'),
(63,'Stephen','Collins','097136063'),
(64,'Craig','King','576068325'),
(65,'Sean','Barnes','299614641'),
(66,'Amanda','Murphy','276682154'),
(67,'Jesse','Washington','039871033'),
(68,'Carol','Lewis','612705393'),
(69,'William','Hernandez','543625385'),
(70,'Amy','Baker','937876855'),
(71,'Sharon','Anderson','400787985'),
(72,'Ralph','Long','850675305'),
(73,'Benjamin','Morgan','028749496'),
(74,'Louis','Sanders','737504351'),
(75,'Christopher','Scott','036828998'),
(76,'Irene','Taylor','499721868'),
(77,'Jimmy','Brooks','739276234'),
(78,'Howard','Watson','685506443'),
(79,'Shawn','Hall','801844373'),
(80,'Shirley','Carter','270412554'),
(81,'Tammy','Jenkins','852695724'),
(82,'Jacqueline','Robinson','175075893'),
(83,'Teresa','Williams','365307831'),
(84,'Ronald','Diaz','588627395'),
(85,'Cheryl','Green','825537339'),
(86,'Phillip','Garcia','025539364'),
(87,'Jose','Foster','202597732'),
(88,'Larry','Moore','152841721'),
(89,'Justin','Cook','410065607'),
(90,'Douglas','Harris','826111631'),
(91,'Alan','Adams','807405787'),
(92,'Richard','Ward','061826128'),
(93,'Jonathan','Davis','152742798'),
(94,'Kathy','Alexander','636793893'),
(95,'Joyce','Stewart','519952194'),
(96,'Joe','Parker','712367294'),
(97,'Matthew','Griffin','752504935'),
(98,'Clarence','Martinez','217959941'),
(99,'Judith','Wright','127703896'),
(100,'Diane','Turner','315906352'),
(101,'Elizabeth','Gray','314110379'),
(102,'Ashley','Roberts','485157600'),
(103,'Theresa','Edwards','354455694'),
(104,'Andrew','Bryant','962892057'),
(105,'Sara','Clark','930835550'),
(106,'Ryan','Thomas','437996103'),
(107,'Jane','Ramirez','464529872'),
(108,'Betty','Wilson','235135450'),
(109,'Brandon','Wood','257088478'),
(110,'Angela','Jackson','605317997'),
(111,'Stephanie','Coleman','644422625'),
(112,'Karen','Russell','694693064'),
(113,'Lori','Perry','418412581'),
(114,'Cynthia','Young','333843757'),
(115,'Mary','Cox','982461228'),
(116,'Julia','Morris','595990209'),
(117,'Joseph','Jones','278821560'),
(118,'Peter','Miller','783034865'),
(119,'Wanda','Peterson','190879629')

INSERT INTO [Uczniowie Klas]([Nazwa Klasy], Uczen) VALUES
('3B',21),('3B',22),('3E',23),('3A',24),('2E',25),('2D',26),('2C',27),('2B',28),('2B',29),('1F',30),('3D',31),('3C',32),('1D',33),('2D',34),('2B',35),('1B',36),('3B',37),('2C',38),('2B',39),('3B',40),('1D',41),('1D',42),('3A',43),('3D',44),('2E',45),('1A',46),('3D',47),('1B',48),('3C',49),('1C',50),('1A',51),('1E',52),('1E',53),('1E',54),('3C',55),('3E',56),('1D',57),('1D',58),('2B',59),('1D',60),('3D',61),('3A',62),('2E',63),('2D',64),('2E',65),('1A',66),('1C',67),('1E',68),('1C',69),('3A',70),('1B',71),('2A',72),('2A',73),('3C',74),('1D',75),('3B',76),('3C',77),('3A',78),('1B',79),('1D',80),('1C',81),('1E',82),('1C',83),('3E',84),('2B',85),('2A',86),('3A',87),('3C',88),('1D',89),('2B',90),('3B',91),('1A',92),('1F',93),('2C',94),('2C',95),('1F',96),('1E',97),('1A',98),('2E',99),('3C',100),('3B',101),('3C',102),('2C',103),('2A',104),('2E',105),('2B',106),('3E',107),('3E',108),('3B',109),('1A',110),('3E',111),('3A',112),('1A',113),('1C',114),('2D',115),('3D',116),('2E',117),('3E',118),('2D',119)
```

# Typowe zapytania