# Szlosek, Barsznica, 01.11.2020 14:18, "Baza danych szkoły" (temat nr 2)

## Co ma być zawarte w PDF

```diff
- podstawowe założenia projektu (cel, główne założenia, możliwości, ograniczenia przyjęte przy projektowaniu),
- diagram ER,
- schemat bazy danych (diagram relacji),
- dodatkowe więzy integralności danych (niezapisane w schemacie),
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

```sql
-- wypisanie uczniów w kolejności klas (od 1A licząc), wewnątrz danej klasy sortujemy za nazwiskiem, a następnie za imieniem

CREATE VIEW wyswietlanie_uczniow AS
SELECT O.Imie, O.Nazwisko, U.[Numer Telefonu Do Rodzica], K.[Nazwa Klasy]
FROM Osoby O JOIN Uczniowie U 
ON O.ID = U.ID
JOIN [Uczniowie Klas] K
ON U.ID = K.Uczen
ORDER BY [Nazwa Klasy], Nazwisko, Imie
OFFSET 0 ROWS

```

```sql
-- wyświetla nauczycieli: ich imiona, nazwiska, numery tel., typ (oczywiście 'nauczyciel')

CREATE VIEW wyswietlanie_nauczycieli AS
SELECT O.Imie, O.Nazwisko, P.[Numer Telefonu]
FROM Osoby O LEFT JOIN Pracownicy P 
ON O.ID = P.ID
WHERE P.Typ = 'Nauczyciel'
```

```sql
-- widok "hierarchia" przedstawia pracowników oraz ich stanowiska w kolejności: dyrektor, administracja, nauczyciel, ekipa sprzątająca
-- w zamyśle, widok ten przeznaczony jest do pokazania 'hierarchii ważności stanowiskowej' w szkole


CREATE VIEW hierarchia AS
SELECT T.Nazwa, O.Imie, O.Nazwisko 
FROM Pracownicy P 
JOIN [Typ Pracownika] T
ON P.Typ = T.Nazwa 
JOIN Osoby O
ON O.ID = P.ID
ORDER BY CASE WHEN Typ = 'Dyrektor' THEN 1
			  WHEN Typ = 'Administracja' THEN 2
			  WHEN Typ = 'Nauczyciel' THEN 3
			  WHEN Typ = 'Ekipa Sprzątająca' THEN 4
			  ELSE 5
		END ASC
OFFSET 0 ROWS

```

# Opis procedur składowych

```sql
-- procedura ta dodaje nowego pracownika do naszej bazy,
-- poprzez dodanie do tabel Osoby, Pracownicy (i ewentualnie Przedmioty Nauczycieli) osoby o tym samym numerze ID
GO
CREATE PROC dbo.dodaj_pracownika
 
@Imie VARCHAR(255) = NULL,
@Nazwisko VARCHAR(255) = NULL,
@Numer VARCHAR(16),
@Typ  VARCHAR(255) = NULL,
@Przedmiot TINYINT = 0
 
AS
 
DECLARE @blad AS NVARCHAR(500);
 
IF @Imie IS NULL OR @Nazwisko IS NULL OR @Typ IS NULL
OR (@Typ = 'Nauczyciel' AND @Przedmiot = 0)
BEGIN
     SET @blad = 'Błędne dane, sprawdź podane argumenty.';
     RAISERROR(@blad, 16,1);
     RETURN;
END

DECLARE @cd INT
SELECT @cd = COUNT(*) FROM Osoby
SET @cd = @cd + 1

INSERT INTO Osoby(Imie, Nazwisko)
VALUES (@Imie, @Nazwisko);

INSERT INTO Pracownicy(ID, [Numer Telefonu], Typ)
VALUES(@cd, @Numer, @Typ)

-- jeśli to nauczyciel, to dokładamy jego przedmiot do danej tabeli
IF @Typ = 'Nauczyciel'
INSERT INTO [Przedmioty Nauczycieli](ID, Przedmiot)
VALUES(@cd, @Przedmiot)
 
GO

-- przykładowe wywołanie powyższej procedury, dodanie pracownika (nauczyciela) Tomasza Zauchę:

EXEC dbo.dodaj_pracownika @Imie = 'Tomasz', @Nazwisko = 'Zaucha', 
@Numer = '523456789', @Typ = 'Nauczyciel', @Przedmiot = 5
GO
```

```sql
-- procedura dodaje nowego ucznia do naszej bazy posiadającego swoje dane osobiste oraz klasę

CREATE PROC dbo.dodaj_ucznia
 
@Imie VARCHAR(255) = NULL,
@Nazwisko VARCHAR(255) = NULL,
@Numer VARCHAR(16),
@Klasa  VARCHAR(10) = NULL

AS
 
DECLARE @blad AS NVARCHAR(500);
 
IF @Imie IS NULL OR @Nazwisko IS NULL OR @Klasa IS NULL

BEGIN
	SET @blad = 'Błędne dane, sprawdź podane argumenty.';
	RAISERROR(@blad, 16,1);
    RETURN;
END
 
DECLARE @cd INT
SELECT @cd = COUNT(*) FROM Osoby
SET @cd = @cd + 1

INSERT INTO Osoby(Imie, Nazwisko)
VALUES (@Imie, @Nazwisko);

INSERT INTO Uczniowie(ID, [Numer Telefonu Do Rodzica])
VALUES(@cd, @Numer)

INSERT INTO [Uczniowie Klas]([Nazwa Klasy], Uczen)
VALUES(@Klasa,@cd)

GO

-- przykładowe wywołanie powyższej procedury (dodanie ucznia Tomka Mikulskiego z klasy 2A)

EXEC dbo.dodaj_ucznia @Imie = 'Tomek', @Nazwisko = 'Mikulski', 
@Numer = '123456789', @Klasa = '2A'
GO

```

```sql
-- procedura dodająca ocenę uczniowi o danym ID
GO
CREATE PROC dbo.dodaj_ocene
 
@ID INT = NULL,
@Ocena TINYINT = NULL,
@Typ TINYINT = NULL,
@Przedmiot TINYINT = NULL,
@Opis TEXT = NULL,
@Wpisujacy INT = NULL

AS
 
DECLARE @blad AS NVARCHAR(500);
 
IF @ID IS NULL OR @Ocena IS NULL OR @Typ IS NULL
OR @Przedmiot IS NULL OR @Wpisujacy IS NULL

BEGIN
	SET @blad = 'Błędne dane, sprawdź podane argumenty.';
	RAISERROR(@blad, 16,1);
    RETURN;
END

IF @Ocena > 6 OR @Ocena < 1

BEGIN
	SET @blad = 'Zła wartość oceny';
	RAISERROR(@blad, 16,1);
    RETURN;
END
 
INSERT INTO Oceny(UczenID, Ocena, [Typ Oceny], Przedmiot, Opis, Wpisujacy, Kiedy)
VALUES (@ID, @Ocena, @Typ, @Przedmiot, @Opis, @Wpisujacy, GETDATE());

GO


-- przykład, dodajemy uczniowi o ID = 21 ocenę 4 z podanymi innymi danymi, daty nie trzeba podawać:

EXEC dbo.dodaj_ocene @ID = 21, @Ocena = 4, @Typ = 2, @Przedmiot = 3,
@Opis = 'Opis oceny', @Wpisujacy = 2
GO
```

# Opis wyzwalaczy

Proste przykładowe wyzwalacze. Głównie informują o zdarzeniach zrealizowanych przez użytkownika, takich jak np. dodanie nowego ucznia (poprzez automatyczne wypisanie komunikatu - brak wymagań szczegółowych w zasadach projektu). Dodatkowo wyświetlany jest komunikat o liczebności danej tabeli (np. o aktualnej liczbie uczniów w bazie) Podobna realizacja dostępna była w niektórych starszych wersjach dzienników elektronicznych. Oczywiście bardziej szczegółowy opis będzie napisany na końcu. \
Podane niżej triggery są bardzo proste, można pomyśleć o nowych, bardziej zaawansowanych w przyszłości (chociaż nie wiem w jakim celu bardziej by się przydały).

```sql
IF OBJECT_ID('dodano_ucznia', 'TR') IS NOT NULL
	DROP TRIGGER dodano_ucznia
GO

CREATE TRIGGER dodano_ucznia ON Uczniowie
AFTER INSERT
AS BEGIN

DECLARE @msg NVARCHAR(55) = NULL
DECLARE @nr INT
SELECT @nr = COUNT(*) FROM dbo.Uczniowie
SET @msg = 'Mamy obecnie ' + CAST(@nr AS VARCHAR(10)) + ' uczniów w naszej bazie danych.'
SELECT 'POMYŚLNIE DODANO UCZNIA' [Komunikat 1], @msg [Komunikat 2]

END
GO

```
```sql
IF OBJECT_ID('dodano_pracownika', 'TR') IS NOT NULL
	DROP TRIGGER dodano_pracownika
GO

CREATE TRIGGER dodano_pracownika ON Pracownicy
AFTER INSERT
AS BEGIN

DECLARE @msg NVARCHAR(55) = NULL
DECLARE @nr INT
SELECT @nr = COUNT(*) FROM dbo.Pracownicy
SET @msg = 'Mamy obecnie ' + CAST(@nr AS VARCHAR(10)) + ' pracowników w naszej bazie danych.'
SELECT 'POMYŚLNIE DODANO PRACOWNIKA' [Komunikat 1], @msg [Komunikat 2]

END
GO
```
```sql
IF OBJECT_ID('dodano_ocene', 'TR') IS NOT NULL
	DROP TRIGGER dodano_ocene
GO

CREATE TRIGGER dodano_ocene ON Oceny
AFTER INSERT
AS BEGIN
SELECT 'POMYŚLNIE DODANO NOWĄ OCENĘ'
END
GO
```

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
    Nazwa VARCHAR(255) NOT NULL PRIMARY KEY
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
    Typ VARCHAR(255) REFERENCES [Typ Pracownika](Nazwa) NOT NULL
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
    Uczen INT REFERENCES Osoby(ID) PRIMARY KEY NOT NULL,
    [Nazwa Klasy] VARCHAR(10) REFERENCES Klasy([Nazwa Klasy]) NOT NULL
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
    Sala INT REFERENCES Sale([Numer Sali]) NOT NULL
);
-- Stworzenie tabeli Kola
CREATE TABLE Kola (
    Nauczyciel INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL,
    Dzien TINYINT NOT NULL,
    Kiedy TINYINT REFERENCES [Czas Zajec](ID) NOT NULL,
    Sala INT REFERENCES Sale([Numer Sali]) NOT NULL,
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

INSERT INTO [Typ Ocen](Nazwa, Waga) VALUES
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
('301', 'Sala')

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
('Irena','Portowicz'),
('Carlos','Kelly'),
('Harold','James'),
('Henry','Martin'),
('Earl','Powell'),
('Martin','Nelson'),
('Brian','Campbell'),
('Alice','Bailey'),
('Barbara','White'),
('Rachel','Allen'),
('Jessica','Lee'),
('Janice','Rivera'),
('Bruce','Brown'),
('Lillian','Gonzales'),
('Lois','Thompson'),
('Donald','Patterson'),
('Ernest','Walker'),
('Jeremy','Evans'),
('Jerry','Richardson'),
('Bobby','Sanchez'),
('Beverly','Rogers'),
('Steve','Phillips'),
('Margaret','Hill'),
('Nicole','Lopez'),
('Denise','Reed'),
('Evelyn','Gonzalez'),
('Charles','Flores'),
('Donna','Cooper'),
('Thomas','Howard'),
('Robert','Johnson'),
('Sandra','Simmons'),
('Paula','Ross'),
('Arthur','Butler'),
('Jennifer','Smith'),
('Christine','Hughes'),
('Martha','Price'),
('Ann','Bell'),
('Brenda','Rodriguez'),
('Frances','Henderson'),
('Steven','Perez'),
('Adam','Mitchell'),
('Tina','Torres'),
('Eric','Bennett'),
('Stephen','Collins'),
('Craig','King'),
('Sean','Barnes'),
('Amanda','Murphy'),
('Jesse','Washington'),
('Carol','Lewis'),
('William','Hernandez'),
('Amy','Baker'),
('Sharon','Anderson'),
('Ralph','Long'),
('Benjamin','Morgan'),
('Louis','Sanders'),
('Christopher','Scott'),
('Irene','Taylor'),
('Jimmy','Brooks'),
('Howard','Watson'),
('Shawn','Hall'),
('Shirley','Carter'),
('Tammy','Jenkins'),
('Jacqueline','Robinson'),
('Teresa','Williams'),
('Ronald','Diaz'),
('Cheryl','Green'),
('Phillip','Garcia'),
('Jose','Foster'),
('Larry','Moore'),
('Justin','Cook'),
('Douglas','Harris'),
('Alan','Adams'),
('Richard','Ward'),
('Jonathan','Davis'),
('Kathy','Alexander'),
('Joyce','Stewart'),
('Joe','Parker'),
('Matthew','Griffin'),
('Clarence','Martinez'),
('Judith','Wright'),
('Diane','Turner'),
('Elizabeth','Gray'),
('Ashley','Roberts'),
('Theresa','Edwards'),
('Andrew','Bryant'),
('Sara','Clark'),
('Ryan','Thomas'),
('Jane','Ramirez'),
('Betty','Wilson'),
('Brandon','Wood'),
('Angela','Jackson'),
('Stephanie','Coleman'),
('Karen','Russell'),
('Lori','Perry'),
('Cynthia','Young'),
('Mary','Cox'),
('Julia','Morris'),
('Joseph','Jones'),
('Peter','Miller'),
('Wanda','Peterson')

INSERT INTO Pracownicy(ID, [Numer Telefonu], Typ) VALUES
(1,NULL,'Dyrektor'),
(2,'152512241','Administracja'),
(3,'612613612','Administracja'),
(4,'125151111','Ekipa sprzątająca'),
(5,NULL,'Ekipa sprzątająca'),
(6,NULL,'Nauczyciel'),
(7,NULL,'Nauczyciel'),
(8,'889741523','Nauczyciel'),
(9,'352776418','Nauczyciel'),
(10,'556789921','Nauczyciel'),
(11,'663992881','Nauczyciel'),
(12,'559876543','Nauczyciel'),
(13,'886543112','Nauczyciel'),
(14,'534665410','Nauczyciel'),
(15,'643997612','Nauczyciel'),
(16,'559813456','Nauczyciel'),
(17,'755086732','Nauczyciel'),
(18,'901887322','Nauczyciel'),
(19,'654337820','Nauczyciel'),
(20,'998451002','Nauczyciel')

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

INSERT INTO Uczniowie(ID, [Numer Telefonu Do Rodzica]) VALUES
(21,'674692364'),
(22,'336860628'),
(23,'947446770'),
(24,'091843778'),
(25,'588758593'),
(26,'480280287'),
(27,'146215678'),
(28,'978789825'),
(29,'118917758'),
(30,'369744971'),
(31,'676620670'),
(32,'851529601'),
(33,'416956734'),
(34,'667584689'),
(35,'165380989'),
(36,'808785659'),
(37,'306307942'),
(38,'286621569'),
(39,'567016701'),
(40,'927856982'),
(41,'149301395'),
(42,'192285402'),
(43,'108147571'),
(44,'070305772'),
(45,'968839327'),
(46,'056183065'),
(47,'084331834'),
(48,'690550671'),
(49,'136483652'),
(50,'172459184'),
(51,'578534091'),
(52,'990566697'),
(53,'658059319'),
(54,'242589622'),
(55,'903134835'),
(56,'321130880'),
(57,'855996933'),
(58,'343704492'),
(59,'380962807'),
(60,'170022668'),
(61,'136836629'),
(62,'245601380'),
(63,'097136063'),
(64,'576068325'),
(65,'299614641'),
(66,'276682154'),
(67,'039871033'),
(68,'612705393'),
(69,'543625385'),
(70,'937876855'),
(71,'400787985'),
(72,'850675305'),
(73,'028749496'),
(74,'737504351'),
(75,'036828998'),
(76,'499721868'),
(77,'739276234'),
(78,'685506443'),
(79,'801844373'),
(80,'270412554'),
(81,'852695724'),
(82,'175075893'),
(83,'365307831'),
(84,'588627395'),
(85,'825537339'),
(86,'025539364'),
(87,'202597732'),
(88,'152841721'),
(89,'410065607'),
(90,'826111631'),
(91,'807405787'),
(92,'061826128'),
(93,'152742798'),
(94,'636793893'),
(95,'519952194'),
(96,'712367294'),
(97,'752504935'),
(98,'217959941'),
(99,'127703896'),
(100,'315906352'),
(101,'314110379'),
(102,'485157600'),
(103,'354455694'),
(104,'962892057'),
(105,'930835550'),
(106,'437996103'),
(107,'464529872'),
(108,'235135450'),
(109,'257088478'),
(110,'605317997'),
(111,'644422625'),
(112,'694693064'),
(113,'418412581'),
(114,'333843757'),
(115,'982461228'),
(116,'595990209'),
(117,'278821560'),
(118,'783034865'),
(119,'190879629')

INSERT INTO [Uczniowie Klas]([Nazwa Klasy], Uczen) VALUES
('3B',21),('3B',22),('3E',23),('3A',24),('2E',25),('2D',26),('2C',27),('2B',28),('2B',29),('1F',30),('3D',31),('3C',32),('1D',33),('2D',34),('2B',35),('1B',36),('3B',37),('2C',38),('2B',39),('3B',40),('1D',41),('1D',42),('3A',43),('3D',44),('2E',45),('1A',46),('3D',47),('1B',48),('3C',49),('1C',50),('1A',51),('1E',52),('1E',53),('1E',54),('3C',55),('3E',56),('1D',57),('1D',58),('2B',59),('1D',60),('3D',61),('3A',62),('2E',63),('2D',64),('2E',65),('1A',66),('1C',67),('1E',68),('1C',69),('3A',70),('1B',71),('2A',72),('2A',73),('3C',74),('1D',75),('3B',76),('3C',77),('3A',78),('1B',79),('1D',80),('1C',81),('1E',82),('1C',83),('3E',84),('2B',85),('2A',86),('3A',87),('3C',88),('1D',89),('2B',90),('3B',91),('1A',92),('1F',93),('2C',94),('2C',95),('1F',96),('1E',97),('1A',98),('2E',99),('3C',100),('3B',101),('3C',102),('2C',103),('2A',104),('2E',105),('2B',106),('3E',107),('3E',108),('3B',109),('1A',110),('3E',111),('3A',112),('1A',113),('1C',114),('2D',115),('3D',116),('2E',117),('3E',118),('2D',119)
```

# Funkcje (sekcja robocza)

```sql

-- funkcja wypisuje pracowników o typie podanym w argumencie
GO
CREATE FUNCTION dbo.wypisz_typem (@Typ AS VARCHAR(255))
RETURNS TABLE

AS
 
RETURN
SELECT O.Imie, O.Nazwisko, P.[Numer Telefonu], Typ
FROM Osoby O LEFT JOIN Pracownicy P 
ON O.ID = P.ID
WHERE Typ = @Typ
 
GO


-- przykładowe wywołanie powyższej funkcji:

SELECT * FROM dbo.wypisz_typem('Administracja')
```

```sql
-- funkcja wypisująca oceny ucznia o ID danym argumentem, wraz ze szczegółami danych ocen

GO
CREATE FUNCTION dbo.wypisz_oceny (@ID AS INT)
RETURNS TABLE

AS

RETURN
SELECT Oc.Ocena [Typ Oceny], T.Nazwa, T.Waga, Oc.Opis, S.[Nazwa Przedmiotu], 
Os.Imie [Imie Nauczyciela], Os.Nazwisko[Nazwisko Nauczyciela], Oc.Kiedy
FROM Osoby O
LEFT JOIN Oceny Oc
ON Oc.UczenID = O.ID
LEFT JOIN [Typ Ocen] T
ON T.ID = Oc.[Typ Oceny]
LEFT JOIN [Spis Przedmiotów] S
ON S.ID = Oc.Przedmiot
LEFT JOIN Osoby Os
ON Os.ID = Oc.Wpisujacy
WHERE O.ID = @ID AND Oc.Ocena IS NOT NULL

GO


-- przykładowe wywołanie funkcji, wypisujemy dane ucznia o ID = 21, wraz z jego ocenami:

SELECT * FROM dbo.wypisz_oceny(21)

```
```sql
-- funkcja obliczająca średnią ważoną ocen danego ucznia z danego przedmiotu 
-- (argumenty to ID ucznia i nazwa przedmiotu)

GO
CREATE FUNCTION dbo.srednia_wazona (@ID AS INT, @Przedmiot AS NVARCHAR(255))
RETURNS TABLE

AS
RETURN
SELECT (1. * SUM(Ocena * W)/SUM(W)) as Srednia FROM
(
SELECT O.ID iden, O.Imie, O.Nazwisko, Oc.Ocena Ocena, T.Nazwa, T.Waga W, S.[Nazwa Przedmiotu] naz
FROM (Osoby O
LEFT JOIN Oceny Oc
ON Oc.UczenID = O.ID
LEFT JOIN [Typ Ocen] T
ON T.ID = Oc.[Typ Oceny]
LEFT JOIN [Spis Przedmiotów] S
ON S.ID = OC.Przedmiot)
) x
WHERE (iden = @ID AND naz = @Przedmiot)
GO


-- przykład wyświetlający średnią ważoną ocen ucznia o ID = 21 z języka niemieckiego:

SELECT * FROM dbo.srednia_wazona(21, 'Język niemiecki')

```
```sql
-- funkcja odpowiedzialna za wypisanie wszystkich uwag danego ucznia (którego ID podamy w argumencie) 
-- wraz z jej opisem i danymi autora

GO
CREATE FUNCTION dbo.wypisz_uwagi (@ID AS INT)
RETURNS TABLE

AS
 
RETURN
SELECT O.Imie, O.Nazwisko, G.Opis [Opis Uwagi], 
P.Imie [Imie Nauczyciela], P.Nazwisko [Nazwisko Nauczyciela]
FROM Osoby O 
LEFT JOIN Uczniowie U
ON O.ID = U.ID
LEFT JOIN Uwagi G
ON O.ID = G.UczenID
LEFT JOIN Osoby P
ON G.Tworca = P.ID
WHERE O.ID = @ID
 
GO


-- przykład wywołania funkcji, wypisze uwagi ucznia o ID = 23:

SELECT * FROM dbo.wypisz_uwagi(23)
```

# Typowe zapytania
