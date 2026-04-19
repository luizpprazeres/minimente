-- Add unique constraint on source_ref for idempotent question imports
ALTER TABLE questions ADD CONSTRAINT questions_source_ref_unique UNIQUE (source_ref);
