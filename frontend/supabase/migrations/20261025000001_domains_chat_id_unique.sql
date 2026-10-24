-- Migration B: Add unique constraint on domains(chat_id)
-- Timestamp: 20261025000001

DO $$
BEGIN
  IF EXISTS (
    SELECT chat_id FROM public.domains GROUP BY chat_id HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add unique constraint: duplicate chat_id values exist in domains table';
  END IF;
END $$;

ALTER TABLE public.domains ADD CONSTRAINT domains_chat_id_key UNIQUE (chat_id);
