# Serendiva Nature Resort - PHP & MySQL 8.0 Backend Guide

You can run the entire backend using **pure PHP and MySQL 8.0 without needing Python**.

---

## 1. How It Works

The PHP backend is located in the [`api/`](file:///c:/assignment/Serendiva-Nature-Resort/api/) folder:
- **[`api/config.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/config.php)**: Database credentials & connection settings.
- **[`api/db.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/db.php)**: PDO connection handler. Automatically creates the database `serendiva_resort` and all tables if they don't already exist.
- **[`api/bookings.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/bookings.php)**: Handles room booking submissions, listings, status updates, and deletions.
- **[`api/dining.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/dining.php)**: Handles dining table reservations.
- **[`api/contact.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/contact.php)**: Handles concierge and contact messages.
- **[`api/stats.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/stats.php)**: Provides real-time metrics for the admin dashboard.

---

## 2. Step 1: Configure Your MySQL Password in PHP

Open [`api/config.php`](file:///c:/assignment/Serendiva-Nature-Resort/api/config.php) and enter your local MySQL 8.0 root password:

```php
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');

// Enter your MySQL 8.0 root password below:
define('DB_PASS', 'YOUR_MYSQL_ROOT_PASSWORD_HERE');

define('DB_NAME', 'serendiva_resort');
```

---

## 3. Step 2: How to Run the Website with PHP

Choose either of the two standard ways:

### Option A: Using XAMPP (Standard Academic Setup)
1. Install [XAMPP](https://www.apachefriends.org/).
2. Copy or move the `Serendiva-Nature-Resort` folder into:
   ```
   C:\xampp\htdocs\Serendiva-Nature-Resort
   ```
3. Open the **XAMPP Control Panel** and click **Start** next to **Apache**.
   *(Note: Since you already have MySQL 8.0 running as a Windows service on port 3306, you don't even need to start MySQL in XAMPP! Apache with PHP will connect straight to your running MySQL 8.0 service).*
4. Open your browser:
   - Website: `http://localhost/Serendiva-Nature-Resort/`
   - Admin Registry: `http://localhost/Serendiva-Nature-Resort/admin.html`

---

### Option B: Using Standalone PHP (No Apache or XAMPP Installation)
If you download PHP for Windows:
1. Download PHP (VS16 x64 Thread Safe zip) from [windows.php.net/download](https://windows.php.net/download).
2. Extract the zip file to `C:\php`.
3. In `C:\php`, rename `php.ini-development` to `php.ini`.
4. Open `php.ini` in Notepad and remove the semicolon `;` from these lines to enable MySQL:
   ```ini
   extension=mysqli
   extension=pdo_mysql
   ```
5. Add `C:\php` to your Windows System Environment Variables `PATH`.
6. Open PowerShell in `c:\assignment\Serendiva-Nature-Resort` and run:
   ```powershell
   php -S localhost:8000
   ```
7. Visit `http://localhost:8000` in your browser!

---

## 4. Testing Your PHP Backend

1. Open your website (`http://localhost/Serendiva-Nature-Resort/` or `http://localhost:8000`).
2. Click **Book Now** or reserve a chalet in `rooms.html`.
3. Fill in the form and submit.
4. Your reservation will be automatically written to your MySQL 8.0 database via `api/bookings.php`.
5. Open `admin.html` to view the saved booking, change its status, or view live analytics!
