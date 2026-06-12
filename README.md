# SkillMapper 🌿

A full-stack web platform that empowers **rural artisans and skilled workers** by connecting them with employers, government bodies, and self-help communities.

Built with **Django REST Framework** + **React + Material UI**.

---

## ✨ Features

- 🔐 **JWT Authentication** — secure login/register with token persistence
- 👩‍🎨 **Dual Role System** — separate dashboards for artisans and employers
- 🤖 **AI Bio Generator** — uses Google Gemini to write professional bios from simple descriptions
- 💼 **Job Board** — employers post jobs, workers apply directly or via skill quiz
- 📝 **Multi-step Resume Builder** — personal info, experience, skills with autocomplete
- 🧪 **Skill Assessments** — employers create quizzes linked to job postings; auto-graded
- 🖼️ **Portfolio Images** — workers upload work photos stored on Cloudinary
- 👥 **Self-Help Groups** — discover and join local community groups
- 🔍 **Resume Search** — employers search workers by skill
- 📱 **Responsive Design** — works on mobile and desktop

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI framework |
| Material UI 7 | Component library |
| React Router 7 | Client-side routing |
| Axios | API calls |
| JWT Decode | Token parsing |
| React Slick | Homepage carousel |
| Vite | Build tool |

### Backend
| Tech | Purpose |
|------|---------|
| Django 5 | Web framework |
| Django REST Framework | REST API |
| SimpleJWT | JWT authentication |
| PostgreSQL | Database |
| Cloudinary | Image storage |
| Google Gemini API | AI bio generation |
| python-decouple | Environment variables |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL
- A [Cloudinary](https://cloudinary.com) account (free)
- A [Google Gemini](https://aistudio.google.com) API key (free)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/skillmapper.git
cd skillmapper
```

---

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=your_database_name
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_API_KEY=your_gemini_api_key
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py createsuperuser   # optional, for admin panel
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**
Admin panel: **http://127.0.0.1:8000/admin**

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 4. Add Sample Data

Visit the admin panel at **http://127.0.0.1:8000/admin** and add:
- Some `Skill` entries (e.g. Weaving, Tailoring, Pottery)
- A `SelfHelpGroup` or two
- A `BusinessProfile` for an employer user
- A `JobPosting`

---

## 📁 Project Structure

```
skillmapper/
├── backend/
│   ├── api/
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API views
│   │   ├── serializers.py     # DRF serializers
│   │   ├── urls.py            # API routes
│   │   ├── permissions.py     # Custom permissions
│   │   └── admin.py           # Admin config
│   ├── mini_project/
│   │   ├── settings.py
│   │   └── urls.py
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── components/        # Layout, Navbar, Footer
    │   ├── context/           # AuthContext (JWT state)
    │   ├── pages/             # All page components
    │   └── App.jsx            # Routes
    └── package.json
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register/` | Register new user |
| POST | `/api/token/` | Login (get JWT) |
| POST | `/api/token/refresh/` | Refresh token |
| GET/POST | `/api/resumes/` | Resume CRUD |
| GET | `/api/jobs/` | List all jobs |
| POST | `/api/jobs/` | Post a job (employer only) |
| GET | `/api/groups/` | List self-help groups |
| GET | `/api/skills/` | List all skills |
| POST | `/api/generate-bio/` | AI bio generation |
| GET | `/api/quizzes/` | List assessments |
| POST | `/api/quizzes/<id>/submit/` | Submit quiz answers |
| POST | `/api/applications/` | Apply for a job |

---

## 👤 User Roles

| Role | How to create | Access |
|------|--------------|--------|
| **Artisan / Worker** | Register normally | Resume builder, job applications, quizzes, portfolio |
| **Employer** | Register + admin creates `BusinessProfile` | Post jobs, create quizzes, view applications, search resumes |
| **Government** | Register + admin creates `GovtProfile` | Same as employer |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

## 📄 License

MIT License — feel free to use this project for learning or building upon it.

---

## 🙏 Acknowledgements

Built as a mini-project to support rural women artisans in finding dignified employment opportunities.