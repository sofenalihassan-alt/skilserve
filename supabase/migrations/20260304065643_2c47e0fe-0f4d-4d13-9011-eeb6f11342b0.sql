
-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view testimonials"
ON public.testimonials
FOR SELECT
USING (true);

-- Create website_feedback table
CREATE TABLE public.website_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  page TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.website_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feedback"
ON public.website_feedback
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can submit feedback"
ON public.website_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);
