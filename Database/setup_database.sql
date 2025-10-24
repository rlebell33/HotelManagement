-- Hotel Management Database Setup Script
-- This script creates the database schema and populates it with test data

-- Create database
DROP DATABASE IF EXISTS HotelManagementDB;
CREATE DATABASE HotelManagementDB;
USE HotelManagementDB;

-- Create Hotels table
CREATE TABLE Hotels (
    HotelId INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(200) NOT NULL,
    City VARCHAR(50) NOT NULL,
    Country VARCHAR(50) NOT NULL,
    Phone VARCHAR(20),
    Email VARCHAR(100) UNIQUE,
    StarRating INT DEFAULT 3 CHECK (StarRating BETWEEN 1 AND 5),
    Description TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Rooms table
CREATE TABLE Rooms (
    RoomId INT AUTO_INCREMENT PRIMARY KEY,
    RoomNumber VARCHAR(20) NOT NULL,
    HotelId INT NOT NULL,
    RoomType VARCHAR(50) NOT NULL,
    Capacity INT CHECK (Capacity BETWEEN 1 AND 10),
    PricePerNight DECIMAL(10,2) NOT NULL,
    Description TEXT,
    HasWifi BOOLEAN DEFAULT TRUE,
    HasAC BOOLEAN DEFAULT TRUE,
    HasTV BOOLEAN DEFAULT TRUE,
    HasMinibar BOOLEAN DEFAULT FALSE,
    IsAvailable BOOLEAN DEFAULT TRUE,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (HotelId) REFERENCES Hotels(HotelId) ON DELETE CASCADE,
    UNIQUE KEY unique_room_per_hotel (HotelId, RoomNumber)
);

-- Create Guests table
CREATE TABLE Guests (
    GuestId INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20),
    Address TEXT,
    City VARCHAR(50),
    Country VARCHAR(50),
    DateOfBirth DATE,
    PassportNumber VARCHAR(20),
    Gender VARCHAR(10),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Reservations table
CREATE TABLE Reservations (
    ReservationId INT AUTO_INCREMENT PRIMARY KEY,
    GuestId INT NOT NULL,
    RoomId INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    NumberOfGuests INT CHECK (NumberOfGuests BETWEEN 1 AND 20),
    TotalAmount DECIMAL(10,2) NOT NULL,
    AmountPaid DECIMAL(10,2) DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Confirmed',
    SpecialRequests TEXT,
    ReservationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CheckInTime TIMESTAMP NULL,
    CheckOutTime TIMESTAMP NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (GuestId) REFERENCES Guests(GuestId) ON DELETE RESTRICT,
    FOREIGN KEY (RoomId) REFERENCES Rooms(RoomId) ON DELETE RESTRICT,
    INDEX idx_room_dates (RoomId, CheckInDate, CheckOutDate)
);

-- Insert test hotels
INSERT INTO Hotels (Name, Address, City, Country, Phone, Email, StarRating, Description) VALUES
('Grand Plaza Hotel', '123 Main Street', 'New York', 'USA', '+1-555-0101', 'info@grandplaza.com', 5, 'Luxury hotel in the heart of Manhattan with world-class amenities and service.'),
('Sunset Beach Resort', '456 Ocean Drive', 'Miami', 'USA', '+1-555-0202', 'reservations@sunsetbeach.com', 4, 'Beautiful beachfront resort with stunning ocean views and tropical atmosphere.'),
('Mountain View Lodge', '789 Alpine Road', 'Denver', 'USA', '+1-555-0303', 'contact@mountainview.com', 3, 'Cozy mountain lodge perfect for outdoor enthusiasts and nature lovers.'),
('City Center Inn', '321 Business District', 'Chicago', 'USA', '+1-555-0404', 'booking@citycenter.com', 3, 'Convenient downtown location ideal for business travelers.'),
('Lakeside Retreat', '654 Lake Shore', 'Seattle', 'USA', '+1-555-0505', 'hello@lakeside.com', 4, 'Peaceful lakeside setting with modern amenities and scenic views.');

-- Insert test rooms for Grand Plaza Hotel (HotelId = 1)
INSERT INTO Rooms (RoomNumber, HotelId, RoomType, Capacity, PricePerNight, Description, HasWifi, HasAC, HasTV, HasMinibar) VALUES
('101', 1, 'Standard Single', 1, 150.00, 'Comfortable single room with city view', TRUE, TRUE, TRUE, FALSE),
('102', 1, 'Standard Double', 2, 200.00, 'Spacious double room with modern amenities', TRUE, TRUE, TRUE, FALSE),
('103', 1, 'Deluxe Double', 2, 250.00, 'Upgraded double room with premium furnishings', TRUE, TRUE, TRUE, TRUE),
('201', 1, 'Executive Suite', 4, 400.00, 'Luxurious suite with separate living area', TRUE, TRUE, TRUE, TRUE),
('202', 1, 'Presidential Suite', 6, 800.00, 'Ultimate luxury suite with panoramic city views', TRUE, TRUE, TRUE, TRUE);

-- Insert test rooms for Sunset Beach Resort (HotelId = 2)
INSERT INTO Rooms (RoomNumber, HotelId, RoomType, Capacity, PricePerNight, Description, HasWifi, HasAC, HasTV, HasMinibar) VALUES
('A101', 2, 'Ocean View', 2, 300.00, 'Room with direct ocean view and balcony', TRUE, TRUE, TRUE, TRUE),
('A102', 2, 'Beach Front', 2, 350.00, 'Premium beachfront room with private access', TRUE, TRUE, TRUE, TRUE),
('B201', 2, 'Family Suite', 4, 450.00, 'Large family suite with kitchenette', TRUE, TRUE, TRUE, TRUE),
('C301', 2, 'Penthouse', 6, 900.00, 'Luxury penthouse with private terrace', TRUE, TRUE, TRUE, TRUE);

-- Insert test rooms for Mountain View Lodge (HotelId = 3)
INSERT INTO Rooms (RoomNumber, HotelId, RoomType, Capacity, PricePerNight, Description, HasWifi, HasAC, HasTV, HasMinibar) VALUES
('1A', 3, 'Standard Room', 2, 120.00, 'Cozy room with mountain views', TRUE, FALSE, TRUE, FALSE),
('1B', 3, 'Standard Room', 2, 120.00, 'Comfortable room with forest views', TRUE, FALSE, TRUE, FALSE),
('2A', 3, 'Deluxe Room', 3, 160.00, 'Spacious room with fireplace', TRUE, FALSE, TRUE, FALSE),
('3A', 3, 'Mountain Suite', 4, 220.00, 'Large suite with panoramic mountain views', TRUE, TRUE, TRUE, FALSE);

-- Insert test rooms for City Center Inn (HotelId = 4)
INSERT INTO Rooms (RoomNumber, HotelId, RoomType, Capacity, PricePerNight, Description, HasWifi, HasAC, HasTV, HasMinibar) VALUES
('100', 4, 'Business Single', 1, 110.00, 'Compact business room with work desk', TRUE, TRUE, TRUE, FALSE),
('101', 4, 'Business Double', 2, 140.00, 'Business room for two guests', TRUE, TRUE, TRUE, FALSE),
('200', 4, 'Executive Room', 2, 180.00, 'Enhanced business room with premium amenities', TRUE, TRUE, TRUE, TRUE);

-- Insert test rooms for Lakeside Retreat (HotelId = 5)
INSERT INTO Rooms (RoomNumber, HotelId, RoomType, Capacity, PricePerNight, Description, HasWifi, HasAC, HasTV, HasMinibar) VALUES
('L1', 5, 'Lake View', 2, 180.00, 'Serene room overlooking the lake', TRUE, TRUE, TRUE, FALSE),
('L2', 5, 'Lake View', 2, 180.00, 'Peaceful room with lake access', TRUE, TRUE, TRUE, FALSE),
('S1', 5, 'Lakeside Suite', 4, 280.00, 'Spacious suite with private lake access', TRUE, TRUE, TRUE, TRUE);

-- Insert test guests
INSERT INTO Guests (FirstName, LastName, Email, Phone, Address, City, Country, DateOfBirth, Gender) VALUES
('John', 'Smith', 'john.smith@email.com', '+1-555-1001', '123 Oak Street', 'Boston', 'USA', '1985-03-15', 'Male'),
('Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-1002', '456 Pine Avenue', 'Los Angeles', 'USA', '1990-07-22', 'Female'),
('Michael', 'Brown', 'michael.brown@email.com', '+1-555-1003', '789 Elm Road', 'Dallas', 'USA', '1982-11-08', 'Male'),
('Emily', 'Davis', 'emily.davis@email.com', '+1-555-1004', '321 Maple Lane', 'Phoenix', 'USA', '1988-05-30', 'Female'),
('David', 'Wilson', 'david.wilson@email.com', '+1-555-1005', '654 Cedar Drive', 'Portland', 'USA', '1975-09-12', 'Male'),
('Lisa', 'Anderson', 'lisa.anderson@email.com', '+1-555-1006', '987 Birch Street', 'San Diego', 'USA', '1992-01-18', 'Female'),
('Robert', 'Taylor', 'robert.taylor@email.com', '+1-555-1007', '147 Spruce Avenue', 'Austin', 'USA', '1980-12-03', 'Male'),
('Jennifer', 'Martinez', 'jennifer.martinez@email.com', '+1-555-1008', '258 Willow Road', 'Tampa', 'USA', '1987-08-25', 'Female');

-- Insert test reservations
INSERT INTO Reservations (GuestId, RoomId, CheckInDate, CheckOutDate, NumberOfGuests, TotalAmount, AmountPaid, Status, SpecialRequests) VALUES
-- Current and future reservations
(1, 1, '2025-11-01', '2025-11-05', 1, 600.00, 600.00, 'Confirmed', 'Late check-in requested'),
(2, 6, '2025-11-02', '2025-11-07', 2, 1500.00, 500.00, 'Confirmed', 'Ocean view preferred'),
(3, 11, '2025-11-03', '2025-11-06', 2, 360.00, 360.00, 'CheckedIn', NULL),
(4, 16, '2025-11-04', '2025-11-08', 1, 440.00, 0.00, 'Confirmed', 'Quiet room please'),
(5, 19, '2025-11-05', '2025-11-10', 2, 900.00, 900.00, 'Confirmed', NULL),

-- Past reservations
(6, 2, '2025-10-15', '2025-10-18', 2, 600.00, 600.00, 'CheckedOut', NULL),
(7, 7, '2025-10-10', '2025-10-14', 2, 1400.00, 1400.00, 'CheckedOut', 'Honeymoon package'),
(8, 12, '2025-10-08', '2025-10-11', 3, 480.00, 480.00, 'CheckedOut', 'Extra towels'),
(1, 5, '2025-10-01', '2025-10-03', 6, 1600.00, 1600.00, 'CheckedOut', 'Corporate booking'),

-- Cancelled reservation
(2, 3, '2025-10-20', '2025-10-23', 2, 750.00, 0.00, 'Cancelled', 'Business trip cancelled');

-- Create indexes for better performance
CREATE INDEX idx_hotels_city ON Hotels(City);
CREATE INDEX idx_hotels_country ON Hotels(Country);
CREATE INDEX idx_rooms_type ON Rooms(RoomType);
CREATE INDEX idx_rooms_price ON Rooms(PricePerNight);
CREATE INDEX idx_guests_email ON Guests(Email);
CREATE INDEX idx_guests_name ON Guests(LastName, FirstName);
CREATE INDEX idx_reservations_dates ON Reservations(CheckInDate, CheckOutDate);
CREATE INDEX idx_reservations_status ON Reservations(Status);

-- Display summary of inserted data
SELECT 'Database Setup Complete!' as Status;
SELECT COUNT(*) as TotalHotels FROM Hotels;
SELECT COUNT(*) as TotalRooms FROM Rooms;
SELECT COUNT(*) as TotalGuests FROM Guests;
SELECT COUNT(*) as TotalReservations FROM Reservations;

-- Show sample data
SELECT 'Sample Hotels:' as Info;
SELECT Name, City, StarRating, Email FROM Hotels LIMIT 3;

SELECT 'Sample Rooms:' as Info;
SELECT h.Name as Hotel, r.RoomNumber, r.RoomType, r.PricePerNight 
FROM Rooms r 
JOIN Hotels h ON r.HotelId = h.HotelId 
LIMIT 5;

SELECT 'Sample Reservations:' as Info;
SELECT CONCAT(g.FirstName, ' ', g.LastName) as Guest, 
       h.Name as Hotel, 
       r.RoomNumber, 
       res.CheckInDate, 
       res.CheckOutDate, 
       res.Status
FROM Reservations res
JOIN Guests g ON res.GuestId = g.GuestId
JOIN Rooms r ON res.RoomId = r.RoomId
JOIN Hotels h ON r.HotelId = h.HotelId
WHERE res.IsActive = TRUE
LIMIT 5;