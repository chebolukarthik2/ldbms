
-- Add department column to students
ALTER TABLE public.students ADD COLUMN department text;

-- Add department column to books
ALTER TABLE public.books ADD COLUMN department text;

-- Allow admins to delete students
CREATE POLICY "Admins can delete students"
ON public.students
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
