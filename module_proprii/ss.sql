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



--ex 11


BEGIN
   DECLARE 
   X VARCHAR2(3) := 'PQRS';
   BEGIN
      dbms_output.put_line(X)
      EXCEPTION 
      WHEN VALUE_ERROR THEN 
      dbms_output.put_line('INVALID STRING LENGTH');
   END;
EXCEPTION
WHEN VALUE_ERROR THEN
dbms_output.put_line('STRING LENGTH IS GREATER THAN THE SIZE OF VARIABLE X');
END;
/


 --ex 12
 --- PL/SQL blocks and subprograms should raise an exception only when an error makes it undesirable or impossible to finish processing. 
 -- You can place RAISE statements for a given exception anywhere within the scope of that exception.
 -- In the following example, you alert your PL/SQL block to a user-defined exception named out_of_stock:

 DECLARE
   out_of_stock   EXCEPTION;
   numar NUMBER := 0;
BEGIN
   IF numar < 1 THEN
      RAISE out_of_stock; -- ridica exceptia pe care am definit-o
   END IF;
EXCEPTION
   WHEN out_of_stock THEN
      -- trateaza eroarea
      dbms_output.put_line('Am intampinat eroare out_of_stock');
END;
/




--You can also raise a predefined exception explicitly. 
--That way, an exception handler written for the predefined exception can process other errors, as the following example shows:
DECLARE
   acct_type INTEGER := 7;
BEGIN
   IF acct_type NOT IN (1, 2, 3) THEN
      RAISE INVALID_NUMBER;  -- ridica exceptia predefinita
   END IF;
EXCEPTION
   WHEN INVALID_NUMBER THEN
      dbms_output.put_line('Tratam inputul invalid prin rolling back');
      ROLLBACK;
END;
/