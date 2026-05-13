# Traveloop

Traveloop is a comprehensive full-stack travel planning application designed to help users organize and manage their trips efficiently. Built with a React frontend and a Flask backend, it offers features like trip creation, city discovery, itinerary management, budget tracking, checklists, notes, and public trip sharing.

## Features

- **User Authentication**: Secure login and registration system.
- **Trip Management**: Create, edit, and delete trips with detailed itineraries.
- **City Discovery**: Explore cities and add them to your trips.
- **Stops and Activities**: Add stops to trips and manage activities within each stop.
- **Checklists and Notes**: Keep track of tasks and add personal notes to trips.
- **Budget Tracking**: Monitor expenses for your trips.
- **Public Sharing**: Share your trips publicly with a unique link.
- **Dashboard**: Overview of all your trips and quick access to features.
- **Dark/Light Theme**: Toggle between themes for better user experience.

## Tech Stack

### Frontend
- React 19.2.6
- Axios for API calls
- React Scripts for build and development

### Backend
- Flask
- PostgreSQL (via psycopg2-binary)
- Flask-CORS for cross-origin requests
- bcrypt for password hashing
- Gunicorn for production deployment

## Installation

### Prerequisites
- Node.js (for frontend)
- Python 3.x (for backend)
- PostgreSQL database

### Backend Setup
1. Navigate to the `Backend` directory:
   ```
   cd Backend
   ```
2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Set up your PostgreSQL database and update the connection details in your environment variables (using `.env` file).
4. Run the database setup scripts if needed (e.g., `traveloop_db.sql`).
5. Start the Flask server:
   ```
   python app.py
   ```

### Frontend Setup
1. Navigate to the `Frontend` directory:
   ```
   cd Frontend
   ```
2. Install Node.js dependencies:
   ```
   npm install
   ```
3. Start the React development server:
   ```
   npm start
   ```

### Running the Application
- Backend will run on `http://localhost:5000` (or as configured).
- Frontend will run on `http://localhost:3000`.
- Access the application through the frontend URL.

## Usage

1. Register or log in to your account.
2. Create a new trip from the dashboard.
3. Add cities, stops, and activities to your trip.
4. Use checklists and notes to organize your plans.
5. Track your budget and view your full itinerary.
6. Share your trip publicly if desired.

## API Endpoints

The backend provides RESTful API endpoints for:
- Users: `/users`
- Cities: `/cities`
- Trips: `/trips`
- Stops: `/stops`
- Activities: `/activities`
- Checklists: `/checklists`
- Notes: `/notes`
- Dashboard: `/dashboard`

Refer to the route files in `Backend/routes/` for detailed endpoint documentation.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for the Odoo Hackathon.
- Thanks to the open-source community for the libraries used.