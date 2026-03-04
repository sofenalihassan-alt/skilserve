
-- Add new service categories to the enum
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'roofing';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'pest_control';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'appliance_repair';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'moving';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'security';
ALTER TYPE public.service_category ADD VALUE IF NOT EXISTS 'tiling';
