-- Insert default categories
INSERT INTO public.categories (id, name, description, color, icon, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Entertainment', 'Streaming services and entertainment subscriptions', '#FF5733', 'film', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Productivity', 'Tools and services for work and productivity', '#33A1FF', 'briefcase', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Health & Fitness', 'Health and fitness related subscriptions', '#33FF57', 'heart', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Education', 'Learning platforms and educational content', '#F3FF33', 'book', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Gaming', 'Gaming subscriptions and services', '#9B33FF', 'gamepad', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Music', 'Music streaming and services', '#FF33E9', 'music', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'News & Magazines', 'News subscriptions and magazine services', '#33FFE3', 'newspaper', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Other', 'Miscellaneous subscriptions', '#808080', 'package', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default billing cycles
INSERT INTO public.billing_cycles (id, name, interval_count, interval_unit, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Monthly', 1, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Quarterly', 3, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Biannual', 6, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Annual', 12, 'month', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Weekly', 1, 'week', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Biweekly', 2, 'week', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert popular subscription services
INSERT INTO public.subscriptions (id, name, description, website, logo, category_id, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Netflix', 'Streaming service for movies and TV shows', 'https://netflix.com', 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Spotify', 'Music streaming service', 'https://spotify.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Spotify_icon.svg/1982px-Spotify_icon.svg.png', (SELECT id FROM public.categories WHERE name = 'Music' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Amazon Prime', 'Shopping and streaming service', 'https://amazon.com/prime', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Amazon_Prime_Logo.svg/2560px-Amazon_Prime_Logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Disney+', 'Disney streaming service', 'https://disneyplus.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Disney%2B_logo.svg/2560px-Disney%2B_logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'YouTube Premium', 'Ad-free YouTube experience', 'https://youtube.com/premium', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/YouTube_play_buttom_icon_%282013-2017%29.svg/1024px-YouTube_play_buttom_icon_%282013-2017%29.svg.png', (SELECT id FROM public.categories WHERE name = 'Entertainment' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Microsoft 365', 'Productivity suite', 'https://microsoft.com/microsoft-365', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Microsoft_365_%282022%29.svg/2560px-Microsoft_365_%282022%29.svg.png', (SELECT id FROM public.categories WHERE name = 'Productivity' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Adobe Creative Cloud', 'Creative software suite', 'https://adobe.com/creativecloud', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/1024px-Adobe_Creative_Cloud_rainbow_icon.svg.png', (SELECT id FROM public.categories WHERE name = 'Productivity' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Peloton', 'Fitness and workout subscription', 'https://onepeloton.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Peloton_logo.svg/2560px-Peloton_logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Health & Fitness' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Coursera Plus', 'Online learning platform', 'https://coursera.org/plus', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Coursera-Logo_600x600.svg/1200px-Coursera-Logo_600x600.svg.png', (SELECT id FROM public.categories WHERE name = 'Education' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'Xbox Game Pass', 'Gaming subscription service', 'https://xbox.com/gamepass', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/1024px-Xbox_one_logo.svg.png', (SELECT id FROM public.categories WHERE name = 'Gaming' LIMIT 1), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
