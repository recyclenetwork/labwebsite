-- ==============================================================================
-- Laboratory of Environmental Health and Ecotoxicology (LabEHE)
-- Master Supabase PostgreSQL Schema & Initial Seeder
-- Jahangirnagar University
-- Version: 2.0.0
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Core System Tables

-- Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'ADMIN',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Site Settings Table (Key-Value CMS Configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Homepage Sections
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Thematic Research Areas
CREATE TABLE IF NOT EXISTS public.research_areas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  icon_name TEXT DEFAULT 'FlaskConical',
  research_questions TEXT[] DEFAULT ARRAY[]::TEXT[],
  methods TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 4. People / Faculty / Researchers / Alumni
CREATE TABLE IF NOT EXISTS public.people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position TEXT,
  role TEXT,
  designation TEXT,
  category TEXT NOT NULL DEFAULT 'researcher',
  department TEXT DEFAULT 'Department of Environmental Sciences',
  affiliation TEXT DEFAULT 'Jahangirnagar University',
  bio TEXT,
  biography TEXT,
  quote TEXT,
  email TEXT,
  phone TEXT,
  office_location TEXT,
  google_scholar TEXT,
  google_scholar_url TEXT,
  orcid TEXT,
  researchgate_url TEXT,
  linkedin_url TEXT,
  website TEXT,
  website_url TEXT,
  photo_url TEXT,
  image_url TEXT,
  research_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  education TEXT[] DEFAULT ARRAY[]::TEXT[],
  publications_count TEXT,
  citations_count TEXT,
  h_index TEXT,
  grants_count TEXT,
  advising_count TEXT,
  thesis_topic TEXT,
  advisor TEXT,
  expected_graduation TEXT,
  current_position TEXT,
  current_institution TEXT,
  alumni_year TEXT,
  past_role TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  full_description TEXT,
  status TEXT NOT NULL DEFAULT 'ongoing',
  start_date DATE,
  end_date DATE,
  year TEXT,
  funding_info TEXT,
  funding_org TEXT,
  grant_amount TEXT,
  research_question TEXT,
  objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  methodology TEXT,
  study_area TEXT,
  study_area_description TEXT,
  findings TEXT,
  outputs TEXT,
  hero_image TEXT,
  image_alt TEXT,
  featured_image TEXT,
  gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Projects <-> Research Areas Junction
CREATE TABLE IF NOT EXISTS public.project_research_areas (
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  research_area_id TEXT REFERENCES public.research_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, research_area_id)
);

-- Projects <-> Researchers Junction
CREATE TABLE IF NOT EXISTS public.project_researchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  person_id TEXT REFERENCES public.people(id) ON DELETE CASCADE,
  role_in_project TEXT DEFAULT 'Researcher',
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Projects <-> External Collaborators Junction
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  role TEXT,
  country TEXT,
  logo_url TEXT
);

-- 6. Publications
CREATE TABLE IF NOT EXISTS public.publications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  abstract TEXT,
  publication_type TEXT NOT NULL DEFAULT 'journal_article',
  journal TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  publication_year INTEGER DEFAULT 2026,
  publication_date DATE,
  doi TEXT,
  doi_url TEXT,
  pdf_url TEXT,
  external_url TEXT,
  impact_factor NUMERIC(5,2),
  citation_count INTEGER DEFAULT 0,
  quartile TEXT DEFAULT 'Q1',
  authors_text TEXT,
  bibtex TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Publication Junctions
CREATE TABLE IF NOT EXISTS public.publication_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  publication_id TEXT REFERENCES public.publications(id) ON DELETE CASCADE,
  person_id TEXT REFERENCES public.people(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_order INTEGER NOT NULL DEFAULT 1,
  is_corresponding BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.publication_research_areas (
  publication_id TEXT REFERENCES public.publications(id) ON DELETE CASCADE,
  research_area_id TEXT REFERENCES public.research_areas(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, research_area_id)
);

CREATE TABLE IF NOT EXISTS public.publication_projects (
  publication_id TEXT REFERENCES public.publications(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, project_id)
);

-- 7. News & Insights
CREATE TABLE IF NOT EXISTS public.news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'lab_update',
  cover_image_url TEXT,
  image_caption TEXT,
  image_credit TEXT,
  author_name TEXT DEFAULT 'Lab Editorial Team',
  author_role TEXT,
  author_avatar TEXT,
  published_at DATE DEFAULT CURRENT_DATE,
  read_time_minutes INTEGER DEFAULT 4,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_project_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  related_publication_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- Create a view for news_posts to ensure compatibility
CREATE OR REPLACE VIEW public.news_posts AS SELECT * FROM public.news;

-- 8. Gallery Events
CREATE TABLE IF NOT EXISTS public.gallery_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Field Expedition',
  location TEXT,
  date_text TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  badge_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 9. Inquiries & Contact Submissions
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General Inquiry',
  message TEXT NOT NULL,
  type TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'new',
  degree_level TEXT,
  university TEXT,
  research_interest TEXT,
  cover_letter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.opportunities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  deadline DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id TEXT,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.admin_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_researchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_research_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Homepage Sections" ON public.homepage_sections FOR SELECT USING (true);
CREATE POLICY "Public Read Research Areas" ON public.research_areas FOR SELECT USING (true);
CREATE POLICY "Public Read People" ON public.people FOR SELECT USING (true);
CREATE POLICY "Public Read Projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Read Project Research Areas" ON public.project_research_areas FOR SELECT USING (true);
CREATE POLICY "Public Read Project Researchers" ON public.project_researchers FOR SELECT USING (true);
CREATE POLICY "Public Read Project Collaborators" ON public.project_collaborators FOR SELECT USING (true);
CREATE POLICY "Public Read Publications" ON public.publications FOR SELECT USING (true);
CREATE POLICY "Public Read Publication Authors" ON public.publication_authors FOR SELECT USING (true);
CREATE POLICY "Public Read Publication Research Areas" ON public.publication_research_areas FOR SELECT USING (true);
CREATE POLICY "Public Read Publication Projects" ON public.publication_projects FOR SELECT USING (true);
CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery Events" ON public.gallery_events FOR SELECT USING (true);
CREATE POLICY "Public Read Opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Public Read Media" ON public.media FOR SELECT USING (true);

-- Public Form Submissions (INSERT)
CREATE POLICY "Public Insert Inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Applications" ON public.applications FOR INSERT WITH CHECK (true);

-- Authenticated Users & Admins (Full Management)
CREATE POLICY "Auth Manage Site Settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Homepage Sections" ON public.homepage_sections FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Research Areas" ON public.research_areas FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage People" ON public.people FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Project Research Areas" ON public.project_research_areas FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Project Researchers" ON public.project_researchers FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Project Collaborators" ON public.project_collaborators FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Publications" ON public.publications FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Publication Authors" ON public.publication_authors FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Publication Research Areas" ON public.publication_research_areas FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Publication Projects" ON public.publication_projects FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage News" ON public.news FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Gallery Events" ON public.gallery_events FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Inquiries" ON public.inquiries FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Messages" ON public.messages FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Opportunities" ON public.opportunities FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Applications" ON public.applications FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Media" ON public.media FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Profiles" ON public.profiles FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Auth Manage Admin Activity" ON public.admin_activity FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKETS SETUP
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('media', 'media', true),
  ('documents', 'documents', true),
  ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Media Storage" ON storage.objects FOR SELECT USING (bucket_id IN ('media', 'documents'));
CREATE POLICY "Auth Upload Media Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('media', 'documents') AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
CREATE POLICY "Public Upload Resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Auth Read Resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));

-- ------------------------------------------------------------------------------
-- 12. SEED INITIAL DATA
-- ------------------------------------------------------------------------------

-- Seed Research Areas
INSERT INTO public.research_areas (id, title, slug, description, icon_name, display_order)
VALUES
  ('area-1', 'Microplastics & Emerging Pollutants', 'microplastics-emerging-pollutants', 'Polymer characterization, particulate transport kinetics, and trophic transfer in freshwater and coastal ecosystems.', 'FlaskConical', 1),
  ('area-2', 'Heavy Metal Ecotoxicology', 'heavy-metal-ecotoxicology', 'Speciation, bioaccumulation, and cellular biomarkers of arsenic, lead, cadmium, and chromium across agro-ecosystems.', 'Atom', 2),
  ('area-3', 'Aquatic Health & Watersheds', 'aquatic-health-watersheds', 'Longitudinal river basin water quality, industrial discharge monitoring, and benthic macroinvertebrate health.', 'Droplets', 3),
  ('area-4', 'Human Health Risk Assessment', 'human-health-risk-assessment', 'Dietary exposure pathways, daily intake estimations, and non-carcinogenic/carcinogenic hazard quotients.', 'Activity', 4),
  ('area-5', 'Environmental Remediation Technologies', 'environmental-remediation-technologies', 'Engineered biochar composites, phytoremediation matrices, and sustainable industrial effluent treatment systems.', 'Leaf', 5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- Seed People
INSERT INTO public.people (id, name, slug, position, role, designation, category, department, affiliation, bio, quote, email, photo_url, image_url, order_index, display_order, is_active)
VALUES
  ('pi-1', 'Professor Dr. Md. Mostafizur Rahman', 'prof-dr-md-mostafizur-rahman', 'Professor & Principal Investigator', 'Professor & Principal Investigator', 'Professor', 'pi', 'Department of Environmental Sciences', 'Jahangirnagar University', 'Leading multi-scale ecotoxicological investigations into micro-pollutants and environmental health risks across the Bengal delta.', 'Evidence-based environmental chemistry is the cornerstone of public health safeguards.', 'mostafiz@juniv.edu', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', 1, 1, true),
  ('person-1', 'Dr. Elena Vance', 'dr-elena-vance', 'Senior Research Fellow', 'Senior Research Fellow', 'Research Fellow', 'researcher', 'Department of Environmental Sciences', 'Jahangirnagar University', 'Specializing in high-resolution mass spectrometry and endocrine-disrupting chemicals.', 'Precision spectroscopy brings invisible risks into sharp focus.', 'e.vance@juniv.edu', '/images/slide-2-lab.jpg', '/images/slide-2-lab.jpg', 2, 2, true),
  ('person-2', 'Sojib Chowdhury', 'sojib-chowdhury', 'Graduate Researcher & Analytical Lead', 'Graduate Researcher & Analytical Lead', 'Graduate Researcher', 'graduate', 'Department of Environmental Sciences', 'Jahangirnagar University', 'Focusing on aquatic microplastic extraction protocols and vibrational spectroscopy.', 'Understanding particle transport in estuaries protects deltaic biodiversity.', 'sojib@juniv.edu', '/images/slide-3-analysis.jpg', '/images/slide-3-analysis.jpg', 3, 3, true),
  ('person-3', 'Tahmina Akter', 'tahmina-akter', 'Research Associate', 'Research Associate', 'Research Associate', 'researcher', 'Department of Environmental Sciences', 'Jahangirnagar University', 'Conducting biomarker assays and cellular response modeling.', 'Cellular pathways reveal sub-lethal toxicological impacts.', 'tahmina@juniv.edu', '/images/slide-1-field.jpg', '/images/slide-1-field.jpg', 4, 4, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  position = EXCLUDED.position;

-- Seed Projects
INSERT INTO public.projects (id, title, slug, short_description, full_description, status, start_date, end_date, year, funding_org, grant_amount, hero_image, featured_image, display_order, is_featured, is_published)
VALUES
  ('proj-1', 'Microplastic Contamination in the Meghna River Estuary', 'microplastic-contamination-meghna-river-estuary', 'Quantifying polymer density, spatial distribution, and benthic macroinvertebrate ingestion rates along the deltaic corridor.', 'Comprehensive multi-season field sampling across 24 estuarine monitoring stations to map microplastic fluxes.', 'ongoing', '2024-01-01', '2026-12-31', '2024-2026', 'Bangladesh UGC & MoST', 'BDT 4,500,000', '/images/slide-1-field.jpg', '/images/slide-1-field.jpg', 1, true, true),
  ('proj-2', 'Heavy Metal Speciation & Bioaccumulation in Wetland Biota', 'heavy-metal-speciation-bioaccumulation-wetland-biota', 'Evaluating trophic transfer factors of arsenic and cadmium in peri-urban aquaculture systems.', 'Investigating geochemical fractions and bioavailability of heavy metals in critical wetland ecosystems of Bangladesh.', 'ongoing', '2024-06-01', '2027-05-31', '2024-2027', 'National Science Council', 'BDT 3,800,000', '/images/slide-2-lab.jpg', '/images/slide-2-lab.jpg', 2, true, true),
  ('proj-3', 'Efficacy of Modified Agricultural Biochar for Dye Removal', 'efficacy-modified-agricultural-biochar-dye-removal', 'Developing engineered low-cost biomass carbon adsorbents for textile industrial wastewater effluents.', 'Synthesizing surface-functionalized biochar from agricultural residues to achieve 98% dye elimination efficiency.', 'completed', '2023-01-01', '2025-12-31', '2023-2025', 'Green Innovation Fund', 'BDT 2,200,000', '/images/slide-4-impact.jpg', '/images/slide-4-impact.jpg', 3, true, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description;

-- Seed Publications
INSERT INTO public.publications (id, title, slug, abstract, publication_type, journal, publication_year, doi, doi_url, impact_factor, citation_count, quartile, authors_text, is_featured, is_published, display_order)
VALUES
  ('pub-1', 'Spatial distribution and polymer characteristics of microplastics in surface waters of the lower Meghna Estuary', 'spatial-distribution-polymer-characteristics-meghna', 'This study investigates the abundance, spatial variations, and vibrational chemical fingerprints of microplastics across the estuarine gradient.', 'journal_article', 'Environmental Pollution', 2026, '10.1016/j.envpol.2026.123456', 'https://doi.org/10.1016/j.envpol.2026.123456', 8.90, 18, 'Q1', 'Shahedur Rahman, Sojib Chowdhury, Elena Vance, et al.', true, true, 1),
  ('pub-2', 'Heavy metal fractionation and non-carcinogenic health hazards associated with consumption of cultured teleosts in Dhaka peripheral wetlands', 'heavy-metal-fractionation-health-hazards-dhaka', 'Assessment of geochemical speciation and target hazard quotients of Pb, Cd, and Cr in commercially harvested fish species.', 'journal_article', 'Science of The Total Environment', 2025, '10.1016/j.scitotenv.2025.987654', 'https://doi.org/10.1016/j.scitotenv.2025.987654', 9.80, 42, 'Q1', 'Shahedur Rahman, Tahmina Akter, et al.', true, true, 2),
  ('pub-3', 'Tailored magnetic biochar derived from agricultural waste for high-capacity azo dye sequestration: Kinetics and isotherm modeling', 'tailored-magnetic-biochar-azo-dye-sequestration', 'Surface engineering of rice husk biochar via Fe3O4 co-precipitation for continuous batch adsorption of industrial synthetic dyes.', 'journal_article', 'Journal of Hazardous Materials', 2025, '10.1016/j.jhazmat.2025.112233', 'https://doi.org/10.1016/j.jhazmat.2025.112233', 13.60, 67, 'Q1', 'Shahedur Rahman, Elena Vance, et al.', true, true, 3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  journal = EXCLUDED.journal;

-- Seed News
INSERT INTO public.news (id, title, slug, summary, content, category, cover_image_url, author_name, published_at, is_featured, is_published)
VALUES
  ('news-1', 'LabEHE Secures Major UGC Grant for Estuarine Microplastic Research', 'labehe-secures-major-ugc-grant-estuarine-microplastics', 'The Laboratory of Environmental Health and Ecotoxicology has been awarded a prestigious multi-year research grant to investigate microplastic ingestion in deltaic aquatic life.', 'Our research team at Jahangirnagar University has received new funding to expand continuous water column sampling and micro-FTIR spectroscopic analysis across the southern coastal estuaries.', 'lab_update', '/images/slide-1-field.jpg', 'Lab Editorial Team', CURRENT_DATE, true, true),
  ('news-2', 'New Q1 Publication on Metal Speciation in Science of the Total Environment', 'new-q1-publication-metal-speciation-stotenv', 'Our latest investigation on geochemical heavy metal fractionation in peri-urban wetlands is now published in Science of The Total Environment (IF: 9.8).', 'The paper details targeted hazard quotients and non-carcinogenic risk models for urban communities consuming freshwater fish exposed to industrial effluent plumes.', 'lab_update', '/images/slide-3-analysis.jpg', 'Lab Editorial Team', CURRENT_DATE - INTERVAL '10 days', true, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary;

-- Seed Gallery Events
INSERT INTO public.gallery_events (id, title, category, location, date_text, description, image_url)
VALUES
  ('gal-1', 'Meghna River Delta Aquatic Sampling', 'Field Expedition', 'Chandpur & Meghna Estuary', 'March 2026', 'Multi-point estuarine water column and sediment sampling expedition mapping microplastic particle concentrations.', '/images/gallery/field-sampling.jpg'),
  ('gal-2', 'ICP-MS & Trace Metal Quantitative Screening', 'Laboratory Analysis', 'Ecotox Analytical Facility', 'January 2026', 'High-precision spectrometry for elemental profiling and heavy metal risk quantification in aquatic biota.', '/images/gallery/analytical-instrumentation.jpg'),
  ('gal-3', 'Stereomicroscopy of Estuarine Plankton', 'Microscopy & Imaging', 'Micro-Ecotoxicology Lab', 'February 2026', 'Fluorescence stereomicroscopy characterization of zooplankton ingestion rates and micro-debris tissue adherence.', '/images/gallery/microscopy-imaging.jpg')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title;

-- Seed Inquiries
INSERT INTO public.inquiries (id, name, email, organization, subject, category, message, status)
VALUES
  ('inq-1', 'Dr. Sarah Jenkins', 's.jenkins@oxford.ac.uk', 'University of Oxford', 'Joint Global South Estuarine Microplastics Project', 'Research Collaboration', 'We would like to explore submitting a joint grant proposal focused on transboundary aquatic polymer transport.', 'new')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Site Settings (Landing Page Content)
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('landing_content', '{
    "hero": {
      "eyebrow": "ENVIRONMENTAL SCIENCE • HEALTH • ECOSYSTEMS",
      "headline": "Understanding Environmental Risks. Protecting Health.",
      "supportingText": "We investigate environmental contaminants, ecological responses, and exposure pathways to generate evidence for healthier ecosystems and communities at Jahangirnagar University.",
      "primaryCtaLabel": "Explore Our Research",
      "primaryCtaHref": "/research",
      "secondaryCtaLabel": "Meet Our Lab",
      "secondaryCtaHref": "/people"
    }
  }'::jsonb, 'Homepage CMS Configuration & Content')
ON CONFLICT (key) DO NOTHING;

-- Seed Research Pillars ("What We Study" Section)
INSERT INTO public.site_settings (key, value, description)
VALUES
  ('research_pillars', '[
    {
      "id": "pillar-1",
      "index": "01",
      "code": "AREA-01",
      "title": "Environmental Contamination",
      "shortTitle": "Contamination",
      "slug": "environmental-contamination",
      "description": "Investigating persistent contaminants, PFAS, and trace metals across soil, water, and biological matrices.",
      "imageSrc": "/images/areas/area-1.jpg",
      "imageAlt": "Environmental soil, water and sediment contamination analysis in lab",
      "icon_name": "FlaskConical",
      "tags": ["Trace Metals", "PFAS Analysis", "Soil Depth"],
      "keyHighlight": "Multi-Matrix Screening",
      "instrumentation": "Orbitrap LC-HRMS • EPA Method 533/537.1",
      "targetMatrices": "Soil sediment cores, agricultural runoff, groundwater",
      "detectionMetric": "< 0.1 ppt Detection Limit",
      "angleDeg": 270,
      "display_order": 1
    },
    {
      "id": "pillar-2",
      "index": "02",
      "code": "AREA-02",
      "title": "Microplastics & Emerging Pollutants",
      "shortTitle": "Microplastics",
      "slug": "microplastics-emerging-pollutants",
      "description": "Tracking polymer degradation, sub-micron particulate transport, and trophic bio-accumulation in aquatic food webs.",
      "imageSrc": "/images/areas/area-2.jpg",
      "imageAlt": "Microscopic microplastic fluorescent fibers under polarized laboratory microscope",
      "icon_name": "Sparkles",
      "tags": ["Micro-FTIR", "Polymer Fate", "Trophic Transfer"],
      "keyHighlight": "Sub-Micron Detection",
      "instrumentation": "Micro-FTIR Imaging • Py-GC/MS Fingerprinting",
      "targetMatrices": "Aquatic fauna tissues, marine sediments, airborne dust",
      "detectionMetric": "Sub-1 µm Spatial Resolution",
      "angleDeg": 330,
      "display_order": 2
    },
    {
      "id": "pillar-3",
      "index": "03",
      "code": "AREA-03",
      "title": "Health Risk & Toxicological Impact",
      "shortTitle": "Health & Risk",
      "slug": "health-risk-toxicological-impact",
      "description": "Modeling toxicological dose-response kinetics, bioaccumulation factors, and human exposure pathways.",
      "imageSrc": "/images/areas/area-3.jpg",
      "imageAlt": "Toxicology cell culture plates and biomarkers analysis",
      "icon_name": "Heart",
      "tags": ["Dose-Response", "Target Organ", "Biomarkers"],
      "keyHighlight": "Physiological Modeling",
      "instrumentation": "Confocal Fluorescence • Cytotoxicity Bioassays",
      "targetMatrices": "Human epithelial lines, bioindicator fish hepatocytes",
      "detectionMetric": "Single-Cell Viability Metrics",
      "angleDeg": 30,
      "display_order": 3
    },
    {
      "id": "pillar-4",
      "index": "04",
      "code": "AREA-04",
      "title": "Circular Systems & Remediation",
      "shortTitle": "Circular Systems",
      "slug": "circular-systems-remediation",
      "description": "Engineering bio-adsorbents, functionalized biochars, and nature-based solutions for industrial effluent purification.",
      "imageSrc": "/images/areas/area-4.jpg",
      "imageAlt": "Eco-friendly biochar water filtration matrix in pilot scale column",
      "icon_name": "Leaf",
      "tags": ["Bio-adsorption", "Zero-Discharge", "Remediation"],
      "keyHighlight": "Circular Engineering",
      "instrumentation": "BET Surface Area Analyzer • Continuous Fixed-Bed Columns",
      "targetMatrices": "Textile effluent, municipal wastewater, storm runoff",
      "detectionMetric": "> 98.4% Heavy Metal Sorption",
      "angleDeg": 90,
      "display_order": 4
    },
    {
      "id": "pillar-5",
      "index": "05",
      "code": "AREA-05",
      "title": "Ecosystem Health & Monitoring",
      "shortTitle": "Monitoring",
      "slug": "ecosystem-health-monitoring",
      "description": "Long-term monitoring of riverine, estuarine, and wetland biodiversity indicators responding to chemical stress.",
      "imageSrc": "/images/slide-1-field.jpg",
      "imageAlt": "River and wetland environmental field monitoring",
      "icon_name": "Activity",
      "tags": ["Bio-Indicators", "Water Quality", "Delta Ecology"],
      "keyHighlight": "Landscape Telemetry",
      "instrumentation": "Multiparameter Sonde Array • Automated Passive Samplers",
      "targetMatrices": "Lower Meghna River Basin, wetland tributaries, coastal benthos",
      "detectionMetric": "Continuous In-situ Hydrology Logging",
      "angleDeg": 150,
      "display_order": 5
    },
    {
      "id": "pillar-6",
      "index": "06",
      "code": "AREA-06",
      "title": "Spatial Ecotoxicology & GIS",
      "shortTitle": "Spatial GIS",
      "slug": "spatial-ecotoxicology-gis",
      "description": "Integrating geospatial modeling, remote sensing, and plume dispersion mapping for predictive risk assessments.",
      "imageSrc": "/images/gallery/field-sampling.jpg",
      "imageAlt": "Geographic GIS environmental hazard mapping",
      "icon_name": "Orbit",
      "tags": ["GIS Mapping", "Pollution Plumes", "Risk Zones"],
      "keyHighlight": "Predictive Dispersion",
      "instrumentation": "ArcGIS Pro • Satellite Multispectral Surface Modeling",
      "targetMatrices": "Regional watershed catchments, industrial corridor zones",
      "detectionMetric": "10m Multispectral Grid Resolution",
      "angleDeg": 210,
      "display_order": 6
    }
  ]'::jsonb, 'Research Pillars and What We Study interactive deck')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value;

-- ------------------------------------------------------------------------------
-- 13. POSTGREST SCHEMA PERMISSIONS (Crucial for anon & authenticated roles)
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

