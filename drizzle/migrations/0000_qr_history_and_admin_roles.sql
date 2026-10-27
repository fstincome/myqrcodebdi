CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
CREATE TABLE public.qr_history (
  id uuid PRIMARY KEY,
  url text NOT NULL CHECK (char_length(url) BETWEEN 1 AND 8192 AND url ~* '^https?://[^[:space:]]+$'),
  kind text NOT NULL CHECK (kind IN ('scanned', 'generated')),
  caption text CHECK (caption IS NULL OR char_length(caption) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.qr_history TO authenticated;
GRANT ALL ON public.qr_history TO service_role;
ALTER TABLE public.qr_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read QR history" ON public.qr_history FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX qr_history_created_at_idx ON public.qr_history (created_at DESC, id);
CREATE INDEX qr_history_kind_created_at_idx ON public.qr_history (kind, created_at DESC);
COMMENT ON TABLE public.qr_history IS 'Private administrator history; public event writes pass through the validated record-qr-event function.';