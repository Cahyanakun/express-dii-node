# Express Multi-Role & Multi-Menu System

## Features

- **Multi-Role RBAC**: Users can have multiple roles (e.g., Admin, Finance).
- **Role Selection**: Login provides a list of roles; choosing one issues a JWT and a role-specific menu tree.
- **Hierarchical Menus**: Support for nested menus using a **Materialized Path** strategy.
- **Menu Management CRUD**: Full control over menus with automatic path recalculation.
- **Database Synchronization**: Integrated with TypeORM for easy schema management.
- **Swagger Documentation**: Interactive API testing available at `/api-docs`.

## Tech Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Security**: JWT, Bcrypt
- **Documentation**: Swagger UI

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Cahyanakun/express-dii-node.git
   cd ExpressDII
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=expressdii
   JWT_SECRET=your_super_secret_key
   ```

4. **Run the Application**:
   ```bash
   npm run dev
   ```

## Database Seeding

To quickly populate the database with test users, roles, and hierarchical menus:

```bash
npx ts-node src/seed.ts
```

_Note: This will truncate existing data in the users, roles, and menus tables!_

## API Documentation

**[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

## Postman & ERD Documentation

Detailed documentation for API testing and database schema can be found in the [docs](docs/) folder:

- **Postman Collection**: [Download/View Here](./docs/Express%20Multi-Role%20API.postman_collection.json)
- **ERD Diagram**: [View Schema Image](./docs/express-dii-ERD.jpg)

## Endpoints

- `POST http://localhost:3000/api/auth/login`: Authenticate and list available roles (or auto-select if single role).
- `POST http://localhost:3000/api/auth/select-role`: Select role and get JWT + Menu Tree.
- `POST http://localhost:3000/api/auth/logout`: Logout endpoint.
- `GET http://localhost:3000/api/menus`: Get all menus as a tree.
- `POST http://localhost:3000/api/menus`: Create menu (Requires Token).
- `PUT http://localhost:3000/api/menus/:id`: Update menu (Requires Token).
- `DELETE http://localhost:3000/api/menus/:id`: Delete menu & children (Requires Token).
- `GET http://localhost:3000/api-docs`: Swagger API Documentation.
