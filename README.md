# WE4B Project

Flex | WE4B Project in third year at UTBM.

# Installation

## Prerequisites

Before you begin, ensure you have the following software installed on your system:
- [Node.js and npm](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli) - version 13.3.3
- [PHP](https://www.php.net/)
- [Composer](https://getcomposer.org/) (Optional)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) running on the default port 3306

## Installation Steps

1. **Clone the Repository**
   ```sh
   git clone https://github.com/hugoallaine/WE4B_Project
   ```
    ```sh
    cd WE4B_Project
    ```

2. **Install PHP Dependencies**
   You have two options to install the PHP dependencies:

   ### Option A: Download Vendor Archive
   - Download the [vendor archive](https://cloud.allaine.cc/s/EWkS6NZfGk46NZS)
   - Unzip it and place it in the `php` folder inside the `backend` folder. The structure should look like this:
     ```
     backend/php/vendor
     ```

   ### Option B: Use Composer
   - Navigate to the `backend/php` directory and run the following command:
     ```sh
     cd backend/php
     composer update
     ```

3. **Install Angular Dependencies**
   - Navigate to the `angular-app` folder and run the following commands:
     ```sh
     cd angular-app
     npm install
     ng serve
     ```
   - This will start the Angular development server. By default, it runs at `http://localhost:4200`.

4. **Launch PHP Server**
   - Open another terminal and navigate to the `backend/php` directory:
     ```sh
     cd backend/php
     php -S localhost:8000
     ```
   - This will start the PHP server at `http://localhost:8000`.

5. **Set Up MySQL Database**
   - Ensure your MySQL server is running on the default port 3306.
   - Download the database SQL file from [this link](https://cloud.allaine.cc/s/SFGe62G8FrBMteA).
   - Import the SQL file into your MySQL database using a tool like phpMyAdmin or the MySQL command line:
     ```sh
     mysql -u your_username -p your_database_name < path_to_sql_file.sql
     ```
   - **Important**: Ensure you set up a MySQL user with the appropriate privileges to access the database. 

   - Create a `backend/private.json` file with your credentials as follows (don't use localhost for db_host, it may not work):
     ```json
     {
         "mailserver": "mail.server.com",
         "SMTP_port": 465,
         "SMTP_user": "user@server.com",
         "SMTP_password": "smpt_password",
         "SMTP_noreply": "no-reply@server.com",
         "db_host": "127.0.0.1",
         "db_user": "your_username",
         "db_password": "your_password",
         "db_name": "your_database_name",
         "SPOTIFY_CLIENT_ID": "your_spotify_client_id",
         "SPOTIFY_CLIENT_SECRET": "your_spotify_client_secret",
         "tmdb_api_key": "your_tmdb_api_key"
     }
     ```

6. **Configure `php.ini`**

   ### Windows
   - The `php.ini` file is usually located in the PHP installation directory, such as `C:\php\php.ini` or `C:\Program Files\php\php.ini`.
   - Open your `php.ini` file and ensure the following line is uncommented (remove the leading `;` if present):
     ```ini
     extension=gd
     ```

   ### Linux
   - The `php.ini` file is typically located in `/etc/php/php.ini`.
   - Open your `php.ini` file and ensure the following lines are uncommented (remove the leading `;` if present):
     ```ini
     extension=gd
     extension=iconv
     extension=mysqli
     extension=pdo_mysql
     ```
   - Additionally, you may need to install the `php-gd` package. On Debian-based distributions (such as Ubuntu) and Arch-based distributions, you can install it using the package manager:
     ```sh
     sudo apt-get install php-gd   # For Debian-based distributions
     sudo pacman -S php-gd         # For Arch-based distributions
     ```

7. **User Verification Without SMTP Server**
   - If you do not have an SMTP server set up, you can manually verify users by changing the value of the `isverified` column to `1` in the `user` table of the database.

## Additional Notes

- Ensure your file structure matches the expected layout:
  ```
  ├── angular-app/
  │   ├── src/
  │   ├── ...
  ├── backend/
  │   ├── php/
  │   │   ├── vendor/
  │   │   ├── ...
  │   ├── audio/ 
  │   ├── video/
  │   ├── private.json
  │   ├── ...
  ```
  - Put your audio files in the `audio` folder and video files in the `video` folder.

## Module used :

Two-factor authentication :   
- https://github.com/RobThree/TwoFactorAuth

Sending mail using SMTP authentication :   
- https://github.com/PHPMailer/PHPMailer   

Extract metadata from from files :
- https://github.com/JamesHeinrich/getID3

## Developers

- [Hugo Allainé](https://github.com/hugoallaine)
- [Léo Angonnet](https://github.com/ZenT0x)
- [Quentin Balezeau](https://github.com/balezeauquentin)
- [Eliott Speyser](https://github.com/Ettotsu)
