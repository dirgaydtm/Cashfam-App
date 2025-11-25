Anggota Kelompok 6 
: 
- Dirga yuditama
- Oracle tio panjaitan
- Yance adhy panjaitan
- Arevanda lazuardi arrayan
- Rajibin putra ilman
  
# 💰 CashFam App

  CashFam is a collaborative financial management application that enables multiple users to manage shared cash books with role-based permissions. Perfect for families, teams, or organizations that need to track shared expenses and income together.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with Laravel Breeze
- Profile management with theme customization
- Secure password update and account deletion
- Multiple theme support (20+ DaisyUI themes)

### � Financial Book Management
- **Create Books** - Start new shared financial books
- **Join Books** - Join existing books via invite code
- **Role-Based Access** - Three roles with different permissions:
  - 👑 **Creator** - Full control including book deletion
  - ⚡ **Admin** - Manage members and transactions
  - 👤 **Member** - View and add transactions
- **Member Management** - Promote, demote, and remove members
- **Leave Books** - Members can leave books they've joined
- **Delete Books** - Creators can permanently delete books

### 💸 Transaction Management
- Add income and expenses with descriptions
- Real-time balance calculation
- Budget tracking
- Filter transactions by type (income/expense)
- Delete transactions (for admins and creators)

## 🎨 Tech Stack

![Tech Stack](https://skillicons.dev/icons?i=react,typescript,laravel,php,vite,tailwindcss)

### Frontend
- **React 18** + **TypeScript** - Type-safe component development
- **Inertia.js** - Modern monolith architecture (no API needed)
- **DaisyUI** - Beautiful Tailwind CSS component library
- **Lucide React** - Modern icon library
- **GSAP** - Professional-grade animation library
- **AOS** - Animate On Scroll library
- **Vite** - Lightning-fast build tool

### Backend
- **Laravel 12** - Robust PHP framework
- **Laravel Breeze** - Minimal authentication scaffolding
- **MySQL/PostgreSQL** - Relational database
- **Inertia Laravel** - Server-side routing with client-side rendering

## � Getting Started

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL or PostgreSQL

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dirgaydtm/Cashfam-App.git
cd Cashfam-App
```

2. **Install PHP dependencies**
```bash
composer install
```

3. **Install Node dependencies**
```bash
npm install
```

4. **Configure environment**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Setup database**
- Create a database in MySQL/PostgreSQL
- Update `.env` with your database credentials
```bash
php artisan migrate
```

6. **Build assets**
```bash
npm run dev
```

7. **Start the server**
```bash
php artisan serve
```

Visit `http://localhost:8000` in your browser.

## 📂 Project Structure

```
├── app/
│   ├── Http/Controllers/    # Laravel controllers
│   ├── Models/              # Eloquent models (User, FinancialBook, Transaction, BookMember)
│   └── Providers/           # Service providers
├── database/
│   └── migrations/          # Database schema
├── resources/
│   ├── js/
│   │   ├── Components/      # React components (Main, Book, Profile, Animations)
│   │   ├── Layouts/         # Layout components (AuthenticatedLayout, GuestLayout)
│   │   ├── Pages/           # Page components (Main, Profile, Auth)
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions (color generator)
│   └── css/                 # Global styles
└── routes/
    ├── web.php              # Web routes
    └── auth.php             # Authentication routes
```

## 🎯 Key Models & Relationships

### User
- Has many FinancialBooks (as creator)
- Has many BookMembers (joined books)

### FinancialBook
- Belongs to User (creator)
- Has many BookMembers
- Has many Transactions

### BookMember
- Belongs to User
- Belongs to FinancialBook
- Has role: creator, admin, or member

### Transaction
- Belongs to FinancialBook
- Belongs to User (who created the transaction)
- Has type: income or expense

## 🎨 Theme System

The app includes a comprehensive theme system with:
- 20+ pre-configured DaisyUI themes
- Theme persistence using localStorage
- Smooth theme transitions with GSAP animations
- Theme preview on selection

Available themes: light, dark, cupcake, bumblebee, emerald, corporate, synthwave, retro, cyberpunk, valentine, halloween, garden, forest, aqua, lofi, pastel, fantasy, wireframe, black, luxury, dracula, cmyk, autumn, business, acid, lemonade, night, coffee, winter, dim, nord, sunset

## 🔧 Development Scripts

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Build for production
php artisan serve    # Start Laravel development server
php artisan migrate  # Run database migrations
```

## 📝 Code Quality

The codebase follows:
- **Clean Code Principles** - Readable, maintainable, and DRY
- **TypeScript Strict Mode** - Type safety throughout
- **Component Composition** - Reusable React components
- **Laravel Best Practices** - MVC architecture, Eloquent ORM

## 📄 License

This project is licensed under the MIT License.
