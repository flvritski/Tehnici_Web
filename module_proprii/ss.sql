CREATE VIEW Salarii_nume_si_departament AS
SELECT nume, salariu,departament
FROM angajati
WHERE Status = "Aprobat"
--View-ul de mai sus returneaza doar numele, salariul si departamentul pentru toti angajatii aprobati. In cazul acesta, limitam accesul la alte date 
--personale(CNP, status_casatorie) prin folosirea unui View.


SELECT TOP 15 id,nume,adresa
from angajati
order by nume

SELECT TOP 15 id,nume,adresa
from angajati
order by nume

--selectul de mai sus poate produce rezultate diferite deoarece nu este specificata ordinea implicita dupa care sa se ordoneze (asc sau desc). In combinatie cu selectorul TOP, rezultatele celor 2 query-ului rulat de 2 ori pot fi diferite
--In SQL databases, the sort is not stable. A stable sort is one that preserves the original ordering of values with the same key. Because the sort is not stable, the results -- for identical keys -- can come out in any order.
--Why isn't the sort stable? That is easy in retrospect. SQL tables and result sets represent unordered sets. There is no initial ordering, so the sorting is not stable.
--The normal way to address this is to include a unique id as the final key in the order by: order by address, id. With your data, though, it is unclear what the unique key is.


-- trigger
CREATE TRIGGER trg_notes_minlength
BEFORE INSERT OR UPDATE ON comanda
FOR EACH ROW
WHEN (length(NEW.descriere) < 7)
BEGIN
    IF TG_OP = 'UPDATE'
   AND OLD.descriere IS NOT DISTINCT FROM NEW.descriere THEN
      -- do nothing
   ELSE
      RAISE EXCEPTION 'Noua valoare pentru coloana "descriere" nu poate sa fie mai mare de 6 caractere.';
   END IF;
END


--bitmap index

create bitmap index idx_sex_angajati on Angajati(sex)

 

--usage

select * from Angajati

where sex = 'F'