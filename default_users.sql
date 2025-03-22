-- Insert default users
INSERT INTO public.users (id, name, email, avatar, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'John Doe', 'john@example.com', 'https://ui-avatars.com/api/?name=John+Doe', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Jane Smith', 'jane@example.com', 'https://ui-avatars.com/api/?name=Jane+Smith', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Admin User', 'admin@subtrack.com', 'https://ui-avatars.com/api/?name=Admin+User', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
