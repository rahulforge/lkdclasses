create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  category text not null default 'general',
  content text not null,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_category_idx on public.documents(category);
create index if not exists documents_slug_idx on public.documents(slug);
create index if not exists documents_embedding_idx
on public.documents using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.update_updated_at_column();

create or replace function public.match_documents(
  query_embedding vector(1536),
  match_count int default 3
)
returns table (
  id uuid,
  slug text,
  title text,
  category text,
  content text,
  source text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    d.id,
    d.slug,
    d.title,
    d.category,
    d.content,
    d.source,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where d.embedding is not null
  order by d.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

alter table public.documents enable row level security;

drop policy if exists "documents are readable" on public.documents;
create policy "documents are readable" on public.documents
for select
using (true);

insert into public.documents (slug, title, category, content, source, metadata)
values
  (
    'fees-en',
    'Fees Structure English',
    'fees',
    'LKD Classes monthly fees are: Class 6 ₹250, Class 7 ₹250, Class 8 ₹250, Class 9 ₹400, Class 10 ₹500, Class 11 ₹600, Class 12 ₹700, Competition ₹200. Registration or app access charge is ₹50.',
    'website',
    '{"language":"en","channel":"chatbot"}'::jsonb
  ),
  (
    'fees-hi',
    'Fees Structure Hinglish',
    'fees',
    'LKD Classes ki monthly fees: Class 6 ₹250, Class 7 ₹250, Class 8 ₹250, Class 9 ₹400, Class 10 ₹500, Class 11 ₹600, Class 12 ₹700 aur Competition ₹200 hai. Registration ya app access charge ₹50 hai.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'courses-hi',
    'Available Courses',
    'courses',
    'LKD Classes me Class 6 se Class 12 tak coaching available hai. Competition batch bhi available hai. Institute structured learning, regular tests, feedback, expert faculty and result-oriented mentoring par focus karta hai.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'mission-vision',
    'Mission and Vision',
    'about',
    'LKD Classes ka mission classes 6th se 12th tak ke students ko top-quality academic coaching dena hai, concepts strong karna hai, performance improve karna hai aur confidence build karna hai. Vision hai trusted learning hub banna jahan har student ko intellectually aur emotionally grow karne ka equal opportunity mile.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'why-choose-lkd',
    'Why Students Choose LKD Classes',
    'about',
    'Students LKD Classes ko expert faculty, structured learning, regular tests, feedback aur result-oriented approach ki wajah se choose karte hain. Institute personal attention aur mentoring par bhi focus karta hai.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'admission-hi',
    'Admission Process',
    'admission',
    'Admission ke liye direct register page open karein: https://lkdclasses.com/register . Student ko details fill karni hoti hain, class select karni hoti hai, registration ya app access fee pay karni hoti hai, aur uske baad registration complete hota hai.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'contact-hi',
    'Contact Details',
    'contact',
    'LKD Classes ka phone number +91 8002271522 hai, email lkdclasses2007@gmail.com hai, aur address Parsa Road, Sitalpur, Saran, Bihar, India hai. Contact page: https://lkdclasses.com/contact',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'timings-hi',
    'Batch Timings',
    'timings',
    'Website par exact batch timings listed nahi hain. Morning aur evening batches available hone ki information di gayi hai. Latest timing ke liye please contact: +91 8002271522.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'results-hi',
    'Results Information',
    'results',
    'Published results aur TSE result dekhne ke liye direct page open karein: https://lkdclasses.com/result . Agar result page par result na mile to please contact: +91 8002271522.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'founder-overview',
    'Founder Overview',
    'founder',
    'LKD Classes ke founder Mr. Laliteshwar Kumar hain. Unke paas teaching aur mentoring ka over a decade experience hai. Unhone LKD Classes ko is mission ke saath build kiya ki students ke potential aur performance ke beech ka gap bridge kiya ja sake. Unka focus discipline, passion for education, innovative methods aur personal attention par hai.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'founder-message',
    'Founder Message',
    'founder',
    'Founder message ke according, education sirf subjects seekhne ke baare me nahi hai; ye strong character, discipline aur curiosity build karne ke baare me bhi hai. LKD Classes traditional teaching aur modern methods ko combine karta hai taaki students apni full potential tak pahunch saken.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'founder-achievements',
    'Founder Achievements and Milestones',
    'founder',
    'Founder page par achievements aur milestones me 19+ years of excellence, 5700+ students mentored, 500+ top rankers aur 10+ dedicated faculty mention hai.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'founder-timeline',
    'Founder Timeline',
    'founder',
    'Founder timeline ke main milestones ye hain: 2007 me local teaching start kiya in Saran. 2013 me LKD Classes establish hua first batch ke saath. 2017 me coaching expand hui for advanced classes. 2023 me Akash got 1st Rank as Bihar Topper in Matric Special Exam. 2024 me Ravi aur Shambav ko Bihar Topper Verification ke liye call mila. 2025 me Chandan aur Karan ko Bihar Topper Verification ke liye call mila. 2025 me Abhijit aur Kumkum ko DEO Saran ne District Topper ke liye award kiya.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  ),
  (
    'founder-gallery',
    'Founder Gallery Highlights',
    'founder',
    'Founder gallery me leadership aur mentorship ke glimpses dikhaye gaye hain, including DEO office Saran recognition, BPSC officer Jayaram Sir ke through student recognition, aur former minister Surendra Ram dwara founder ko sammanit kiya jana.',
    'website',
    '{"language":"hinglish","channel":"chatbot"}'::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  source = excluded.source,
  metadata = excluded.metadata,
  updated_at = now();
