-- Drop existing objects (optional, for a clean slate if re-running schema)
-- Run these manually if needed, be cautious in production.
/*
DROP TRIGGER IF EXISTS after_donation_delete_update_total ON public.donations;
DROP TRIGGER IF EXISTS after_donation_insert_update_total ON public.donations;
DROP FUNCTION IF EXISTS public.update_user_total_donations_on_delete();
DROP FUNCTION IF EXISTS public.update_user_total_donations();

DROP TABLE IF EXISTS public.borrow_requests CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.user_book_hearts CASCADE;
DROP TABLE IF EXISTS public.books CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE; -- This is your public user profile table

DROP FUNCTION IF EXISTS public.trigger_set_timestamp();
*/

-- Helper function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- USERS Table (public profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'librarian', 'admin')),
  total_donations NUMERIC DEFAULT 0 CHECK (total_donations >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
-- RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins/Librarians can view all user profiles." ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'admin' OR u.role = 'librarian'))
);
CREATE POLICY "Allow public read access to user names and donation amounts for donor list." ON public.users FOR SELECT USING (true); -- For donors page, refine if more specific access is needed.


-- CATEGORIES Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
-- RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins/Librarians can manage categories." ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'admin' OR u.role = 'librarian'))
);


-- BOOKS Table
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'available' NOT NULL CHECK (status IN ('available', 'borrowed', 'maintenance')),
  publication_year INTEGER,
  publisher TEXT,
  pages INTEGER,
  location TEXT, -- e.g., "Section A, Shelf 3"
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_books_updated_at ON public.books;
CREATE TRIGGER set_books_updated_at
BEFORE UPDATE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
-- RLS for books
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are viewable by everyone." ON public.books FOR SELECT USING (true);
CREATE POLICY "Admins/Librarians can manage books." ON public.books FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'admin' OR u.role = 'librarian'))
);


-- USER_BOOK_HEARTS Table
CREATE TABLE IF NOT EXISTS public.user_book_hearts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, book_id)
);
-- RLS for user_book_hearts
ALTER TABLE public.user_book_hearts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own hearts." ON public.user_book_hearts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Heart counts are public." ON public.user_book_hearts FOR SELECT USING (true); -- Needed for `hearts_count:user_book_hearts(count)`


-- BORROW_REQUESTS Table
CREATE TABLE IF NOT EXISTS public.borrow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  request_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  librarian_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- User who approved/rejected
  approved_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_borrow_requests_updated_at ON public.borrow_requests;
CREATE TRIGGER set_borrow_requests_updated_at
BEFORE UPDATE ON public.borrow_requests
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
-- RLS for borrow_requests
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own borrow requests." ON public.borrow_requests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins/Librarians can manage all borrow requests." ON public.borrow_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'admin' OR u.role = 'librarian'))
);


-- DONATIONS Table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_donations_updated_at ON public.donations;
CREATE TRIGGER set_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();
-- RLS for donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations are public record." ON public.donations FOR SELECT USING (true);
CREATE POLICY "Admins can manage donations." ON public.donations FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND (u.role = 'admin' OR u.role = 'librarian'))
);

-- Function and Triggers to update total_donations on users table
CREATE OR REPLACE FUNCTION public.update_user_total_donations()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.users
    SET total_donations = COALESCE((SELECT SUM(amount) FROM public.donations WHERE user_id = OLD.user_id), 0)
    WHERE id = OLD.user_id;
    RETURN OLD;
  ELSE
    UPDATE public.users
    SET total_donations = COALESCE((SELECT SUM(amount) FROM public.donations WHERE user_id = NEW.user_id), 0)
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_donation_change_update_total ON public.donations;
CREATE TRIGGER after_donation_change_update_total
AFTER INSERT OR UPDATE OF amount OR DELETE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_user_total_donations();

GRANT EXECUTE ON FUNCTION public.trigger_set_timestamp TO supabase_admin;
GRANT EXECUTE ON FUNCTION public.update_user_total_donations TO supabase_admin;
