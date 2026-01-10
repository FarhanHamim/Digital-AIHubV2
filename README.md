# UNDP Digital & AI Hub

A modern, responsive website for the UNDP Digital & AI Hub, showcasing digital transformation initiatives, projects, learning resources, events, and team information. Built with React, Tailwind CSS, and Supabase.

## 🚀 Features

### Public Features
- **Home Page**: Hero slider with featured content, mission & purpose, and key highlights
- **Initiatives**: Year-based filtering (2026-2023), serial list view, detail pages with full information
- **Projects**: Year-based filtering, support request system for regular users, detail pages
- **Learning & Capacity**: Accordion-style learning modules with downloadable resources
- **Events & Archive**: Upcoming events with countdown, archived events by year, event details
- **Standards & Best Practices**: DPI and LGI sections with PDF downloads
- **Team & Advisory**: Team member profiles with advisory section

### Admin Features
- **Complete CMS**: Full content management system for all sections
- **Admin Dashboard**: Statistics overview and quick actions
- **CRUD Operations**: Create, Read, Update, Delete for all content types
- **File Management**: Image and document uploads via Supabase Storage
- **Support Request Management**: Approve or decline user support requests
- **Role-Based Access**: Admin-only access for content management

### User Features
- **User Dashboard**: Personalized dashboard for logged-in users
- **Support Requests**: Submit support requests for projects (requires login)
- **Resource Access**: View and download PDFs from Standards and Learning pages

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.2 with Vite 7.2
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router DOM 7.11
- **Carousel**: Swiper.js 12.0
- **PDF Generation**: jsPDF & html2canvas

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account ([Sign up here](https://supabase.com))

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Digital&AIHub_V2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under API.

### 4. Set Up Supabase Database

#### Create Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  support_type TEXT,
  document_url TEXT,
  duration TEXT,
  impact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initiatives Table
CREATE TABLE initiatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  document_url TEXT,
  document_name TEXT,
  type TEXT,
  result TEXT,
  impact TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Modules Table
CREATE TABLE learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  resources TEXT[],
  curriculum TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  outcome TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('upcoming', 'archive')),
  location TEXT,
  video_urls TEXT[],
  gallery_images TEXT[],
  documents JSONB[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Standards Table
CREATE TABLE standards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('DPI', 'LGI')),
  description TEXT,
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Table
CREATE TABLE team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  linkedin TEXT,
  section TEXT CHECK (section IN ('advisory', 'team')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support Requests Table
CREATE TABLE support_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  support_type TEXT,
  document_url TEXT,
  duration TEXT,
  impact TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (for admin tracking)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Set Up Row Level Security (RLS)

Enable RLS and create policies:

```sql
-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies for reading published content (public access)
CREATE POLICY "Public can read published projects" ON projects
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published initiatives" ON initiatives
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published learning_modules" ON learning_modules
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published events" ON events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published standards" ON standards
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read published team" ON team
  FOR SELECT USING (status = 'published');

-- Policies for authenticated users
CREATE POLICY "Authenticated users can insert support_requests" ON support_requests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can read their own support_requests" ON support_requests
  FOR SELECT USING (auth.uid()::text = user_email OR auth.jwt()->>'is_admin' = 'true');

-- Policies for admin users (requires is_admin flag in JWT)
-- Note: You'll need to set up a function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admins can manage all content" ON projects
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all content" ON initiatives
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all content" ON learning_modules
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all content" ON events
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all content" ON standards
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all content" ON team
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage support_requests" ON support_requests
  FOR ALL USING (is_admin());
```

### 5. Set Up Supabase Storage

1. Go to Storage in your Supabase dashboard
2. Create a bucket named `files`
3. Set bucket to public (or configure policies for public read)
4. Create folders:
   - `projects/documents`
   - `initiatives/images`
   - `initiatives/documents`
   - `events/gallery`
   - `events/documents`
   - `support_requests/documents`

### 6. Create Admin User

1. Sign up a user through the `/admin` page
2. In Supabase SQL Editor, run:

```sql
-- Replace 'admin@example.com' with your admin email
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'admin@example.com';
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── Footer.jsx          # Site footer
│   ├── LoadingSpinner.jsx  # Loading indicator
│   ├── Navbar.jsx          # Main navigation
│   ├── ProtectedRoute.jsx # Route protection
│   └── SkeletonLoader.jsx  # Loading skeletons
│
├── contexts/               # React contexts
│   └── AuthContext.jsx     # Authentication context
│
├── pages/                 # Page components
│   ├── Home.jsx           # Landing page
│   ├── Initiatives.jsx    # Initiatives listing
│   ├── InitiativeDetail.jsx # Initiative detail page
│   ├── Learning.jsx        # Learning modules
│   ├── Projects.jsx        # Projects listing
│   ├── ProjectDetail.jsx   # Project detail page
│   ├── Events.jsx          # Events & archive
│   ├── Standards.jsx       # Standards & best practices
│   ├── Team.jsx            # Team members
│   ├── admin/              # Admin pages
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ManageProjects.jsx
│   │   ├── ManageInitiatives.jsx
│   │   ├── ManageLearning.jsx
│   │   ├── ManageEvents.jsx
│   │   ├── ManageStandards.jsx
│   │   ├── ManageTeam.jsx
│   │   └── ManageSupportRequests.jsx
│   └── user/               # User pages
│       └── UserDashboard.jsx
│
├── supabase/              # Supabase configuration
│   └── config.js          # Supabase client setup
│
├── utils/                  # Utility functions
│   ├── cache.js           # Client-side caching
│   ├── requireAuth.js     # Auth requirement helper
│   ├── supabaseHelpers.js # Supabase query helpers
│   └── pdfUtils.js        # PDF generation utilities
│
├── App.jsx                # Main app component with routing
└── main.jsx               # Application entry point
```

## 🎨 UNDP Branding

The site follows UNDP visual identity guidelines:

- **Primary Color**: UNDP Blue (#006EB0)
- **Secondary Colors**: 
  - White (#FFFFFF)
  - Light Grey (#F7F7F7)
  - Dark Blue (#003D6B)
- **Typography**: Open Sans / Roboto (via Google Fonts)
- **Layout**: Clean, minimalist design with abundant whitespace
- **Responsive**: Mobile-first approach with breakpoints for tablet and desktop

## 🔐 Authentication & Authorization

### User Roles

- **Public Users**: Can view published content, download PDFs, submit support requests (requires login)
- **Authenticated Users**: Can access user dashboard, submit support requests
- **Admin Users**: Full access to CMS, can manage all content, approve/decline support requests

### Protected Routes

- `/admin/*` - Admin-only routes
- `/user/dashboard` - Authenticated users only

## 📱 Key Features Explained

### Year-Based Filtering

Initiatives, Projects, and Events support year-based filtering:
- Years 2026, 2025, 2024, 2023 are always visible (even if empty)
- Additional years are shown if content exists
- Years displayed in descending order

### Detail Pages

- **Initiatives**: `/initiatives/:id` - Opens in new tab
- **Projects**: `/projects/:id` - Opens in new tab
- Full information display with images, documents, and metadata

### Support Request System

- Regular users can submit support requests for projects
- Requires login before submission
- Admins can approve or decline requests
- Requests stored in `support_requests` table

### File Uploads

- Images: JPG, PNG, GIF (max 10MB)
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT (max 10MB)
- Files stored in Supabase Storage
- Public URLs generated for display

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Sign up at [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Deploy!

3. **Configure Vercel**
   - The `vercel.json` is pre-configured
   - SPA routing is enabled
   - Asset caching is optimized

### Environment Variables for Production

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style

- ESLint configured for React
- Follow existing code patterns
- Use functional components with hooks
- Maintain UNDP branding consistency

## 📝 Database Schema Reference

### Projects
- `title` (TEXT, required)
- `support_type` (TEXT)
- `document_url` (TEXT)
- `duration` (TEXT)
- `impact` (TEXT)
- `status` (TEXT: 'pending' | 'published')

### Initiatives
- `title` (TEXT, required)
- `description` (TEXT, required)
- `image_url` (TEXT)
- `document_url` (TEXT)
- `document_name` (TEXT)
- `type` (TEXT)
- `result` (TEXT)
- `impact` (TEXT, required)
- `status` (TEXT: 'pending' | 'published')

### Events
- `title` (TEXT, required)
- `description` (TEXT, required)
- `outcome` (TEXT, required)
- `date` (DATE, required)
- `type` (TEXT: 'upcoming' | 'archive')
- `location` (TEXT)
- `video_urls` (TEXT[])
- `gallery_images` (TEXT[])
- `documents` (JSONB[])
- `status` (TEXT: 'pending' | 'published')

## 🐛 Troubleshooting

### Common Issues

**Issue**: Supabase connection errors
- **Solution**: Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Issue**: RLS policies blocking access
- **Solution**: Check that RLS policies are correctly set up and `is_admin()` function exists

**Issue**: File uploads failing
- **Solution**: Verify Storage bucket exists, is public (or policies allow uploads), and file size is under 10MB

**Issue**: Admin access not working
- **Solution**: Ensure user exists in `users` table with `is_admin = TRUE`

**Issue**: Detail pages not loading
- **Solution**: Check that the record exists and has `status = 'published'`

## 📄 License

This project is created for UNDP Digital & AI Hub.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Check browser console for errors
4. Contact the development team

## 🔄 Recent Updates

- ✅ Year-based filtering for Initiatives, Projects, and Events
- ✅ Detail pages for Initiatives and Projects (opens in new tab)
- ✅ Support request system for regular users
- ✅ Admin-only content submission
- ✅ Public access to PDFs on Standards and Learning pages
- ✅ Team page with Advisory section
- ✅ Improved file upload handling
- ✅ Enhanced caching for better performance

---

**Built with ❤️ for UNDP Digital & AI Hub**
