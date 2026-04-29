CREATE TABLE public.clinic_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) <= 120),
  price TEXT NOT NULL CHECK (char_length(price) <= 40),
  duration TEXT NOT NULL CHECK (char_length(duration) <= 40),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.clinic_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) <= 120),
  service TEXT NOT NULL CHECK (char_length(service) <= 120),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  system_prompt TEXT NOT NULL DEFAULT 'You are BookingAgent Pro, a professional AI assistant for a modern dental clinic. Help patients understand services and book appointments clearly and politely.',
  mode TEXT NOT NULL DEFAULT 'information_only' CHECK (mode IN ('information_only', 'full_booking')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clinic services"
ON public.clinic_services
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clinic services"
ON public.clinic_services
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own clinic services"
ON public.clinic_services
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own clinic services"
ON public.clinic_services
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own clinic bookings"
ON public.clinic_bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clinic bookings"
ON public.clinic_bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own clinic bookings"
ON public.clinic_bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own clinic bookings"
ON public.clinic_bookings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own agent settings"
ON public.agent_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent settings"
ON public.agent_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit their own agent settings"
ON public.agent_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clinic_services_updated_at
BEFORE UPDATE ON public.clinic_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clinic_bookings_updated_at
BEFORE UPDATE ON public.clinic_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_settings_updated_at
BEFORE UPDATE ON public.agent_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_clinic_services_user_id ON public.clinic_services(user_id);
CREATE INDEX idx_clinic_bookings_user_id ON public.clinic_bookings(user_id);
CREATE INDEX idx_agent_settings_user_id ON public.agent_settings(user_id);