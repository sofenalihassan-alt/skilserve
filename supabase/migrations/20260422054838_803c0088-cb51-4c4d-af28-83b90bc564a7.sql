
-- 1. Verification documents table
CREATE TYPE public.verification_doc_type AS ENUM ('cnic_front', 'cnic_back', 'selfie_with_id', 'license', 'certificate');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL,
  user_id UUID NOT NULL,
  doc_type public.verification_doc_type NOT NULL,
  file_path TEXT NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own documents"
  ON public.verification_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Providers can insert own documents"
  ON public.verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can delete own pending documents"
  ON public.verification_documents FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all documents"
  ON public.verification_documents FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update documents"
  ON public.verification_documents FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete documents"
  ON public.verification_documents FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_verification_documents_updated_at
  BEFORE UPDATE ON public.verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Add verification_status column to service_providers
ALTER TABLE public.service_providers
  ADD COLUMN verification_status public.verification_status NOT NULL DEFAULT 'unverified';

-- 3. Disputes table
CREATE TYPE public.dispute_status AS ENUM ('pending', 'investigating', 'resolved', 'rejected');

CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  raised_by UUID NOT NULL,
  against_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status public.dispute_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  resolution TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking parties can view own disputes"
  ON public.disputes FOR SELECT
  USING (auth.uid() = raised_by OR auth.uid() = against_user_id);

CREATE POLICY "Booking parties can create disputes"
  ON public.disputes FOR INSERT
  WITH CHECK (
    auth.uid() = raised_by AND
    EXISTS (
      SELECT 1 FROM public.bookings b
      LEFT JOIN public.service_providers sp ON sp.id = b.provider_id
      WHERE b.id = disputes.booking_id
        AND (b.user_id = auth.uid() OR sp.user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update disputes"
  ON public.disputes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES ('dispute-evidence', 'dispute-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: verification-docs
CREATE POLICY "Providers can upload own verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Providers can view own verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Providers can delete own verification docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'verification-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Storage policies: dispute-evidence
CREATE POLICY "Users can upload own dispute evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dispute-evidence'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own dispute evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dispute-evidence'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can view all dispute evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dispute-evidence'
    AND public.has_role(auth.uid(), 'admin')
  );
