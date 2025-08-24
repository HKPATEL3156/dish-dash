# DishDash - A Restaurent Food Ordering Platform 🍽️

**DishDash** is a modern and feature-rich restaurant food ordering platform built using the **MERN stack** (MongoDB, Express.js, React, Node.js). It provides a seamless experience for both customers and administrators, enabling efficient food ordering, management, and delivery.

---

## 🌟 Features

### For Customers:

- **Browse Menu**: Explore a wide variety of dishes with detailed descriptions and images.
- **Order Food**: Add items to the cart and place orders effortlessly.
- **Track Orders**: Stay updated on the status of your orders in real-time.

### For Admins:

- **Manage Menu**: Add, update, or remove menu items with ease.
- **View Orders**: Monitor and manage customer orders.
- **Authentication**: Secure login for admin access.

---

## 🛠️ Tech Stack

### Frontend:

- **React**: For building a dynamic and responsive user interface.
- **Vite**: For fast development and optimized builds.
- **Tailwind CSS**: For modern and customizable styling.

### Backend:

- **Node.js**: For server-side logic.
- **Express.js**: For building RESTful APIs.
- **MongoDB**: For a scalable and flexible NoSQL database.
- **Mongoose**: For object data modeling (ODM).

### Additional Tools:

- **JWT**: For secure authentication.
- **Multer**: For handling file uploads.
- **Stripe**: For payment processing.

---

## 🚀 Installation and Setup

### Prerequisites:

- Node.js (v16 or higher)
- MongoDB (running locally or on a cloud service)

### Steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/HKPATEL3156/dish-dash.git  
   cd dish-dash  
   ```
2. Install dependencies for the backend:

   ```bash
   cd backend  
   npm install  
   ```
3. Install dependencies for the admin panel:

   ```bash
   cd ../admin  
   npm install  
   ```
4. Install dependencies for the frontend:

   ```bash
   cd ../frontend  
   npm install  
   ```
5. Start the backend server:

   ```bash
   cd ../backend  
   npm start  
   ```
6. Start the admin panel:

   ```bash
   cd ../admin  
   npm run dev  
   ```
7. Start the frontend:

   ```bash
   cd ../frontend  
   npm run dev  
   ```

---

## 📂 Project Structure

```
dish-dash/  
├── backend/  
│   ├── config/          # Database configuration  
│   ├── controllers/     # API controllers  
│   ├── middleware/      # Authentication middleware  
│   ├── modals/          # Mongoose models  
│   ├── routes/          # API routes  
│   ├── uploads/         # Uploaded images  
│   └── server.js        # Entry point for the backend  
├── admin/  
│   ├── src/  
│   │   ├── components/  # React components for admin panel  
│   │   ├── assets/      # Static assets  
│   │   └── App.jsx      # Main React app  
│   └── vite.config.js   # Vite configuration  
├── frontend/  
│   ├── src/  
│   │   ├── components/  # React components for customer interface  
│   │   ├── assets/      # Static assets  
│   │   └── App.jsx      # Main React app  
│   └── vite.config.js   # Vite configuration  
└── README.md            # Project documentation  
```

---

## 📸 Screenshots

### Customer Interface:

![Customer Interface](https://via.placeholder.com/800x400?text=Customer+Interface)

### Admin Panel:

![Admin Panel](https://via.placeholder.com/800x400?text=Admin+Panel)

---

## 🛠️ Limitations

### User Side:

- No real-time order tracking after placing the order.
- No option to cancel or modify an order once submitted.
- Lacks user feedback or rating features.
- Limited payment options (Stripe and Cash on Delivery).
- No multi-language support.

### Admin Side:

- No advanced analytics or reporting tools.
- Single admin access; no roles for delivery or kitchen staff.
- No bulk import/export for menu items or orders.

### General:

- Not deployed to a live production server.
- No real-time data sync or socket communication.
- Limited scalability for multi-restaurant setups.

---

## 🌟 Future Enhancements

- **Multi-Restaurant Support**: Allow multiple restaurants to manage their own menus and orders.
- **Order Tracking**: Real-time updates for customers.
- **Admin Roles**: Role-based access for kitchen and delivery staff.
- **UI/UX Improvements**: Add dark mode, loading spinners, and better mobile responsiveness.
- **Security**: Add password reset, email verification, and Google Login.

---

## 🤝 Contributing

Comming soon......

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🌐 Live Demo

Comming soon.........

---
