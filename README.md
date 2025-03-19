# Blogging-Site

## Project Overview

This project is a blogging website where users can create, edit, and delete blog posts. Users can also view posts created by others, comment on them, and like or dislike posts. The website is built using modern web technologies and follows best practices for web development.

## Features

- User authentication and authorization
- Create, edit, and delete blog posts
- View all blog posts
- Comment on blog posts
- Like or dislike blog posts
- User profile management
- AI-based post recommendations

## Technologies Used

- Frontend: HTML, CSS, JavaScript, React
- Backend: Node.js, Express.js
- Database: MongoDB

## API Endpoints

The following API endpoints are used throughout the project:

### User Authentication

- `POST /api/auth/register`: Register a new user
  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword"
  }
  ```
- `POST /api/auth/login`: Login a user
  ```json
  {
    "username": "exampleUser",
    "password": "examplePassword"
  }
  ```
- `POST /api/auth/logout`: Logout a user

### User Profile

- `GET /api/users/:id`: Get user profile by ID
- `PUT /api/users/:id`: Update user profile by ID
  ```json
  {
    "username": "newUsername",
    "bio": "newBio"
  }
  ```
- `DELETE /api/users/:id`: Delete user profile by ID

### Blog Posts

- `GET /api/posts`: Get all blog posts
- `GET /api/posts/:id`: Get a single blog post by ID
- `POST /api/posts`: Create a new blog post
  ```json
  {
    "title": "New Post",
    "content": "This is the content of the new post."
  }
  ```
- `PUT /api/posts/:id`: Update a blog post by ID
  ```json
  {
    "title": "Updated Post Title",
    "content": "Updated content of the post."
  }
  ```
- `DELETE /api/posts/:id`: Delete a blog post by ID

### Comments

- `GET /api/posts/:postId/comments`: Get all comments for a blog post
- `POST /api/posts/:postId/comments`: Add a comment to a blog post
  ```json
  {
    "content": "This is a comment."
  }
  ```
- `DELETE /api/posts/:postId/comments/:commentId`: Delete a comment by ID

### Likes

- `POST /api/posts/:postId/like`: Like a blog post
- `POST /api/posts/:postId/dislike`: Dislike a blog post

### AI Recommendations

- `GET /api/recommendations`: Get AI-based post recommendations

## User Workflow

1. **Registration and Login**: Users register with a username and password. After registration, they can log in to access the website's features.
2. **Profile Management**: Users can view and update their profile information.
3. **Creating Posts**: Logged-in users can create new blog posts by providing a title and content.
4. **Viewing Posts**: Users can view all blog posts or a single post by its ID.
5. **Editing and Deleting Posts**: Users can edit or delete their own posts.
6. **Commenting**: Users can comment on any blog post.
7. **Liking and Disliking**: Users can like or dislike any blog post.
8. **AI Recommendations**: Users can get AI-based recommendations for blog posts they might be interested in.

## Setup and Installation

1. Clone the repository
2. Install dependencies using `npm install`
3. Set up environment variables
4. Run the development server using `npm start`

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
