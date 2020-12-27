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
- baza powinna zawierać dane dotyczące atrybutów, których wartość zmienia się w czasie,
- baza powinna zawierać tabele realizujące jeden ze schematów dziedziczenia,
- 10 widoków lub funkcji,
- baza danych powinna być odpowiednio oprogramowana z wykorzystaniem procedur składowanych i wyzwalaczy (co najmniej po 5 procedur i po 5 wyzwalaczy).
- należy zaprojektować strategię pielęgnacji bazy danych (kopie zapasowe),
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

- Obecnosc uczniow
- Wydarzenia
- Kola

------------------------------------------------------------

# Podstawowe założenia projektu

Głównym celem projektu jest stworzenie bazy danych szkoły, która przechowywuje informacje na temat pracowników budynku, informacji na temat uczniów, ich wychowawców, ocen z danego przedmiot i planu zajęć. Projekt jest z założenia ograniczony tylko do pokazania podstawowych fukncji z możliwością rozwoju bazy danych w przyszłości do odpowiednich potrzeb.

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
    ID TINYINT IDENTITY(1,1) PRIMARY KEY,
    [Numer Sali] INT NOT NULL,
    Nazwa VARCHAR(255)
)
-- Stworzenie tabeli Dni Wolne
CREATE TABLE [Dni Wolne] (
    Kiedy DATETIME
)
-- Stworzenie tabeli Pracownicy
CREATE TABLE Pracownicy (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Imie VARCHAR(255) NOT NULL,
    Nazwisko VARCHAR(255) NOT NULL,
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
    ID TINYINT IDENTITY(1,1) PRIMARY KEY,
    [Nazwa Klasy] VARCHAR(10) NOT NULL
);
-- Stworzenie tabeli Uczniowie
CREATE TABLE Uczniowie (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Imie VARCHAR(255) NOT NULL,
    Nazwisko VARCHAR(255) NOT NULL,
    [Numer Telefonu Do Rodzica] VARCHAR(16)
);
-- Stworzenie tabeli Uczniowie Klas
CREATE TABLE [Uczniowie Klas] (
    ID TINYINT PRIMARY KEY REFERENCES Klasy(ID) NOT NULL,
    Uczen INT NOT NULL
);
-- Stworzenie tabeli Uwagi
CREATE TABLE Uwagi (
    UwagaID INT IDENTITY(1,1) PRIMARY KEY,
    UczenID INT REFERENCES Uczniowie(ID) ON DELETE CASCADE NOT NULL,
    Opis TEXT NOT NULL,
    Tworca INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL
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
    Klasa TINYINT REFERENCES Klasy(ID) NOT NULL,
    Dzien TINYINT NOT NULL,
    Kiedy TINYINT REFERENCES [Czas Zajec](ID) NOT NULL,
    Sala TINYINT REFERENCES Sale(ID) NOT NULL
);
-- Stworzenie tabeli Kola
CREATE TABLE Kola (
    Nauczyciel INT REFERENCES Pracownicy(ID) ON DELETE CASCADE NOT NULL,
    Dzien TINYINT NOT NULL,
    Kiedy TINYINT REFERENCES [Czas Zajec](ID) NOT NULL,
    Sala TINYINT REFERENCES Sale(ID) NOT NULL,
    [Nazwa Kola] VARCHAR(255) NOT NULL
);
```
```sql
-- Wstawienie przykładowych rekordów do tabel
INSERT INTO [Typ Pracownika](Nazwa) VALUES
('Dyrektor'), 
('Sekretarz'), 
('Sprzątacz'), 
('Nauczyciel')

INSERT INTO Pracownicy(Imie, Nazwisko, [Numer Telefonu], Typ) VALUES
('Zenek','Martyniuk',NULL,1),
('Władysław','Jagiełło','152512241',2),
('Jan','Seriusz','612613612',2),
('Ken','Damino','125151111',3),
('Jan','Anatomiusz',NULL,3),
('Maciej','Jankowski',NULL,4),
('Karol','Kanodziej',NULL,4),
('Oskar','Przybylski','889741523',4),
('Artur','Krol','352776418',4),
('Henryk','Sienkiewicz','556789921',4),
('Matylda','Nowak','663992881',4),
('Lucyna','Moskowiak','559876543',4),
('Aleksandra','Bytomska','886543112',4),
('Nadia','Milowicz','534665410',4),
('Agnieszka','Lipka','643997612',4),
('Tatiana','Zlotko','559813456',4),
('Honorata','Siemowicz','755086732',4),
('Milena','Anastowicz','901887322',4),
('Urszula','Kinek','654337820',4),
('Irena','Portowicz','998451002',4)

INSERT INTO [Spis Przedmiotów]([Nazwa Przedmiotu]) VALUES
('Jezyk polski'),
('Jezyk angielski'),
('Jezyk niemiecki'),
('Jezyk hiszpanski'),
('Jezyk francuski'),
('Jezyk rosyjski'),
('Jezyk lacinski'),
('Matematyka'),
('Informatyka'),
('Fizyka'),
('Chemia'),
('Biologia'),
('Wf'),
('Historia'),
('Wdz'),
('Edb'),
('Lekcja edukacyjna')

INSERT INTO Uczniowie(Imie, Nazwisko, [Numer Telefonu Do Rodzica]) VALUES
('Carlos','Kelly','674692364'),
('Harold','James','336860628'),
('Henry','Martin','947446770'),
('Earl','Powell','091843778'),
('Martin','Nelson','588758593'),
('Brian','Campbell','480280287'),
('Alice','Bailey','146215678'),
('Barbara','White','978789825'),
('Rachel','Allen','118917758'),
('Jessica','Lee','369744971'),
('Janice','Rivera','676620670'),
('Bruce','Brown','851529601'),
('Lillian','Gonzales','416956734'),
('Lois','Thompson','667584689'),
('Donald','Patterson','165380989'),
('Ernest','Walker','808785659'),
('Jeremy','Evans','306307942'),
('Jerry','Richardson','286621569'),
('Bobby','Sanchez','567016701'),
('Beverly','Rogers','927856982'),
('Steve','Phillips','149301395'),
('Margaret','Hill','192285402'),
('Nicole','Lopez','108147571'),
('Denise','Reed','070305772'),
('Evelyn','Gonzalez','968839327'),
('Charles','Flores','056183065'),
('Donna','Cooper','084331834'),
('Thomas','Howard','690550671'),
('Robert','Johnson','136483652'),
('Sandra','Simmons','172459184'),
('Paula','Ross','578534091'),
('Arthur','Butler','990566697'),
('Jennifer','Smith','658059319'),
('Christine','Hughes','242589622'),
('Martha','Price','903134835'),
('Ann','Bell','321130880'),
('Brenda','Rodriguez','855996933'),
('Frances','Henderson','343704492'),
('Steven','Perez','380962807'),
('Adam','Mitchell','170022668'),
('Tina','Torres','136836629'),
('Eric','Bennett','245601380'),
('Stephen','Collins','097136063'),
('Craig','King','576068325'),
('Sean','Barnes','299614641'),
('Amanda','Murphy','276682154'),
('Jesse','Washington','039871033'),
('Carol','Lewis','612705393'),
('William','Hernandez','543625385'),
('Amy','Baker','937876855'),
('Sharon','Anderson','400787985'),
('Ralph','Long','850675305'),
('Benjamin','Morgan','028749496'),
('Louis','Sanders','737504351'),
('Christopher','Scott','036828998'),
('Irene','Taylor','499721868'),
('Jimmy','Brooks','739276234'),
('Howard','Watson','685506443'),
('Shawn','Hall','801844373'),
('Shirley','Carter','270412554'),
('Tammy','Jenkins','852695724'),
('Jacqueline','Robinson','175075893'),
('Teresa','Williams','365307831'),
('Ronald','Diaz','588627395'),
('Cheryl','Green','825537339'),
('Phillip','Garcia','025539364'),
('Jose','Foster','202597732'),
('Larry','Moore','152841721'),
('Justin','Cook','410065607'),
('Douglas','Harris','826111631'),
('Alan','Adams','807405787'),
('Richard','Ward','061826128'),
('Jonathan','Davis','152742798'),
('Kathy','Alexander','636793893'),
('Joyce','Stewart','519952194'),
('Joe','Parker','712367294'),
('Matthew','Griffin','752504935'),
('Clarence','Martinez','217959941'),
('Judith','Wright','127703896'),
('Diane','Turner','315906352'),
('Elizabeth','Gray','314110379'),
('Ashley','Roberts','485157600'),
('Theresa','Edwards','354455694'),
('Andrew','Bryant','962892057'),
('Sara','Clark','930835550'),
('Ryan','Thomas','437996103'),
('Jane','Ramirez','464529872'),
('Betty','Wilson','235135450'),
('Brandon','Wood','257088478'),
('Angela','Jackson','605317997'),
('Stephanie','Coleman','644422625'),
('Karen','Russell','694693064'),
('Lori','Perry','418412581'),
('Cynthia','Young','333843757'),
('Mary','Cox','982461228'),
('Julia','Morris','595990209'),
('Joseph','Jones','278821560'),
('Peter','Miller','783034865'),
('Wanda','Peterson','190879629')

-- Plan zajęć
-- Uczniowie
-- Przedmioty [ID przedmiotu i nazwa]
-- Oceny [Wszystkie jakie są]
-- Typ ocen [sprawdzian, kartkówka itd.]
-- Uwagi uczniów
-- Urlopy pracowników
-- Dni wolne
-- Sale
-- Obecnosc uczniow
-- Klasy i uczniowie do nich nalezacy
-- Wydarzenia
-- Informacje o rodzicach
-- Kola
-- Tabela oplat za dany miesiac [szkola prywatna]
```

# Typowe zapytania