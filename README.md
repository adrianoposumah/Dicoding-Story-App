# Story App

A single-page application (SPA) built with vanilla JavaScript that allows users to share and explore stories.

## Features

- User authentication (sign up, sign in)
- Create, read, update, and delete stories
- Responsive design using Tailwind CSS
- Model-View-Presenter (MVP) architecture

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run start-dev
   ```

### Building for Production

```
npm run build
```

### API Endpoints

The application uses the following API endpoints:

- `/register` - Register a new user
- `/login` - Authenticate a user
- `/stories` - Get all stories

## Project Structure

The project follows the Model-View-Presenter (MVP) architecture:

- **Model**: Handles data and business logic
- **View**: Manages the UI components
- **Presenter**: Connects the Model and View

## Technologies Used

- JavaScript (ES6+)
- Webpack
- Tailwind CSS
- Babel
