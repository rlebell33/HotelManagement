# Hotel Management System

A comprehensive hotel management system built with C#/.NET, JavaScript, and MySQL. This system provides a complete solution for managing hotels, rooms, guests, and reservations with a modern web interface.

## Features

- **Hotel Management**: Add, edit, and manage multiple hotels
- **Room Management**: Manage room types, pricing, and availability
- **Guest Management**: Handle guest information and profiles
- **Reservation System**: Complete booking system with check-in/check-out
- **Dashboard**: Real-time overview of hotel operations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **RESTful API**: Full REST API for all operations

## Technology Stack

- **Backend**: ASP.NET Core 9.0, Entity Framework Core
- **Database**: MySQL 8.0+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Icons**: Font Awesome 6
- **Architecture**: RESTful API with SPA frontend

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [MySQL 8.0+](https://dev.mysql.com/downloads/mysql/)
- A modern web browser
- (Optional) [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) for database management

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HotelManagement
```

### 2. Database Setup

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Open the file `Database/setup_database.sql`
4. Execute the script

### 3. Configure Database Connection

Edit the connection string in `HotelManagementAPI/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=HotelManagementDB;User=root;Password=your_password;"
  }
}
```

### 4. Install Dependencies and Run

```bash
cd HotelManagementAPI
dotnet restore
dotnet run
```

The application will start at:
- **Website**: https://localhost:7xxx (HTTPS)
- **API**: https://localhost:7xxx/api
- **OpenAPI/Swagger**: https://localhost:7xxx/openapi/v1.json

## Usage

### Web Interface

1. **Dashboard**: Overview of hotels, rooms, guests, and reservations
2. **Hotels**: Manage hotel properties and view their rooms
3. **Rooms**: Manage room inventory, pricing, and availability
4. **Guests**: Manage guest profiles and view their reservation history
5. **Reservations**: View and manage all bookings with status tracking
6. **New Booking**: Create new reservations with availability checking

## Development

### Building the Project
```bash
dotnet build
```

### Running Tests
```bash
dotnet test
```

### Database Migrations
If you modify the models, create and apply migrations:
```bash
dotnet ef migrations add MigrationName
dotnet ef database update
```

## Configuration

### Database Settings
- Default connection string expects MySQL on localhost:3306
- Database name: `HotelManagementDB`
- Default credentials: root/password (change in production)

### API Settings
- CORS is enabled for all origins (configure for production)
- Static files are served from wwwroot
- OpenAPI documentation is available in development

## Security Considerations

For production deployment:
1. Change default database credentials
2. Configure CORS for specific origins
3. Enable HTTPS only
4. Add authentication and authorization
5. Implement input validation and sanitization
6. Add rate limiting
7. Use secure connection strings (Azure Key Vault, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational and demonstration purposes.