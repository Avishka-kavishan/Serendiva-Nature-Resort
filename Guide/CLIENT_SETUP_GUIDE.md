# 🌿 Serendiva Nature Resort — Client Laptop Setup Guide (PHP & MySQL)

This guide provides full step-by-step instructions to set up the **Frontend (HTML/CSS/JS)** and **Backend (Pure PHP & MySQL 8.0 / XAMPP)** on a client laptop.

---

## 📋 System Prerequisites

Ensure the client laptop has:
1. **XAMPP** (with **PHP 8.0, 8.1, or 8.2** and Apache)
   - Download link: [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. **MySQL Database**:
   - Either **MySQL 8.0** (installed via MySQL Community Server) OR **XAMPP MySQL** (MariaDB)
3. **Web Browser** (Chrome, Edge, Firefox, or Safari)

---

## 🗂️ Step 1: Copy Project to XAMPP Web Root

1. Copy the entire `Serendiva-Nature-Resort` folder into the XAMPP web root directory:
   ```
   C:\xampp\htdocs\Serendiva-Nature-Resort
   ```

2. Confirm your files are structured as:
   ```
   C:\xampp\htdocs\Serendiva-Nature-Resort\
     ├── api\
     │    ├── config.php
     │    ├── db.php
     │    ├── bookings.php
     │    ├── dining.php
     │    ├── contact.php
     │    └── stats.php
     ├── assets\
     ├── css\
     ├── js\
     ├── index.html
     ├── rooms.html
     ├── dining.html
     ├── admin.html
     └── database_schema.sql
   ```

---

## 🗄️ Step 2: Set Up the MySQL Database

Choose either **Option 1 (phpMyAdmin)** or **Option 2 (MySQL Workbench)**:

### Option 1: Using phpMyAdmin (Web Interface)
1. Open XAMPP Control Panel and click **Start** next to **Apache** and **MySQL**.
2. Open your browser and go to: `http://localhost/phpmyadmin`
3. Click the **Import** tab at the top.
4. Click **Choose File** and select `database_schema.sql` from your project folder.
5. Scroll down and click **Import** (or **Go**).
6. The `serendiva_resort` database and its 3 tables (`bookings`, `dining_reservations`, `contact_inquiries`) will be created automatically with sample data!

### Option 2: Using MySQL Workbench (Native MySQL 8.0)
1. Open **MySQL Workbench** and click your connection (e.g., **Local instance MySQL80**).
2. Click **File** ➔ **Open SQL Script...** (`Ctrl + Shift + O`).
3. Select `database_schema.sql` from the project folder.
4. Click the yellow **Lightning Bolt (⚡)** button (`Ctrl + Shift + Enter`) to execute.
5. In the **Schemas** tab on the left, click **Refresh (🔄)** to verify `serendiva_resort` appears.

> 💡 **Password Tip**: If the client does not know their MySQL root password, right-click `reset_mysql_password.bat` in the project folder and select **"Run as administrator"** to instantly reset it to `root123`.

---

## ⚙️ Step 3: Configure Database Credentials in PHP

Open `api/config.php` in a code editor or Notepad:

```php
// C:\xampp\htdocs\Serendiva-Nature-Resort\api\config.php

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');

// Set the password matching your client's MySQL:
// - If using native MySQL 8.0: 'root123' (or client's root password)
// - If using default XAMPP MySQL: '' (empty string)
define('DB_PASS', 'root123');

define('DB_NAME', 'serendiva_resort');
```

Save the file.

---

## 🚀 Step 4: Start the Server

1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
   *(Note: If using native MySQL 8.0 as a Windows service, ensure the `MySQL80` service is running in `services.msc`. If using XAMPP's database, click **Start** next to MySQL in XAMPP).*

---

## 🌐 Step 5: Open the Application in Browser

Now access the resort website and administration panel:

| Page | URL |
| :--- | :--- |
| **Main Website** | `http://localhost/Serendiva-Nature-Resort/` |
| **Admin Management Console** | `http://localhost/Serendiva-Nature-Resort/admin.html` |
| **Rooms & Chalets Booking** | `http://localhost/Serendiva-Nature-Resort/rooms.html` |
| **Fine Dining Reservations** | `http://localhost/Serendiva-Nature-Resort/dining.html` |
| **Concierge & Inquiries** | `http://localhost/Serendiva-Nature-Resort/contact.html` |

---

## 🧪 Step 6: Client Demonstration & Verification Checklist

1. **Verify Backend & Database Health**:
   - Open `http://localhost/Serendiva-Nature-Resort/admin.html`.
   - Confirm the top banner shows:
     > **Connected: MySQL 8.0 server active (database: `serendiva_resort`)**
   - Confirm statistics cards (Total Bookings, Confirmed, Revenue) are loaded live via `api/stats.php`.

2. **Test Guest Room Reservation**:
   - Open `http://localhost/Serendiva-Nature-Resort/rooms.html` and click **"Reserve Now"**.
   - Complete the form and submit.
   - A confirmation popup displays reference number `SND-XXXXXX`.
   - Go to `admin.html` to see the new reservation appear immediately in the bookings table.

3. **Test Dining Reservation**:
   - Open `http://localhost/Serendiva-Nature-Resort/dining.html` and book a table.
   - Confirm the booking appears under **Dining Table Bookings** on `admin.html`.

4. **Test Status Updates & Deletions**:
   - In `admin.html`, toggle a reservation's status between **Confirmed**, **Pending**, and **Cancelled**.
   - Test deleting a test booking with the red **Delete** button.
   - Confirm changes persist on page refresh.

---

## 🛠️ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **"Backend Offline" banner in admin** | Apache is not running | Open XAMPP Control Panel and click **Start** next to **Apache**. |
| **"Access denied for user 'root'@'localhost'"** | Password mismatch in `api/config.php` | Change `DB_PASS` in `api/config.php` to match MySQL (e.g. `root123` or `''`). |
| **"Unknown database 'serendiva_resort'"** | Schema not imported | Re-import `database_schema.sql` in phpMyAdmin or MySQL Workbench. |
| **Apache Port 80 conflict in XAMPP** | Another service using port 80 | In XAMPP, click **Config** on Apache ➔ `httpd.conf` ➔ change `Listen 80` to `Listen 8080`, then access `http://localhost:8080/Serendiva-Nature-Resort/`. |
