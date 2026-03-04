# iBag

React Native Course Project — E-commerce mobile application

> **Disclaimer:** This project is developed solely for educational purposes as part of a SoftUni React Native course. It is inspired by the [eBag.bg] online store. All product data, branding, and assets are used for demonstration only. This application is not affiliated with or endorsed by eBag.bg and is not intended for commercial use. The repository and all associated resources will be removed after the course evaluation is completed.

## Link to APK


## Walkthrough Tutorial

1. **Login / Register** — Open the app and sign in with email and password, or create a new account. If biometric login is enabled (after initial sign-in), the app will authenticate you automatically.
2. **Home** — Landing screen with promotional banners and product sliders grouped by category.
3. **Categories** — Browse all categories, select one, and view its products. Tap a product for details.
4. **Search** — Search products by name using the search bar.
5. **Favorites** — Add products to favorites (heart icon) and find them here.
6. **Cart** — Add products to the cart, adjust quantities, and proceed to checkout.
7. **Checkout** — Select a delivery address, add a note, and confirm the order.
8. **Profile** — Tap the profile icon in the top-right corner. From here, manage orders, addresses, complaints, and edit your profile.

## Installation Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Steps
```bash
git clone https://github.com/webdevpetrov/ibag-app.git
cd ibag-app
npm install
npx expo start
```
Scan the QR code with Expo Go (Android) or the Camera app (iOS).

---

## Functional Guide

### 1. Project Overview
- **Application Name**: iBag
- **Application Category / Topic**: E-commerce / Online Shopping
- **Main Purpose**: Mobile shopping application featuring a product catalog, cart, orders, favorites, complaints, and profile management. Built with React Native (Expo SDK 55), React 19, React Navigation v7, and React Native Paper.

---

### 2. User Access & Permissions

**Guest (Not Authenticated)**
- Access limited to Login and Register screens only

**Authenticated User**
- **5 main tabs**: Home, Categories, Search, Favorites, Cart
- **Profile section** (accessible from the header icon):
  - View and edit profile (name)
  - Change password
  - Manage addresses (CRUD)
  - Order list and details
  - Complaints — view and create (with attached images)
  - Enable/disable biometric login
  - Sign out

---

### 3. Authentication & Session Handling

**Authentication Flow**
1. On app launch, the app checks SecureStore for a saved JWT token
2. If a token exists and biometric login is enabled → shows biometric prompt (fingerprint / face)
3. On successful biometric auth → validates the token via `GET /user`
4. If no token or validation fails → shows the Login screen
5. On successful Login/Register → server returns a token → saved to SecureStore → user profile is loaded → navigates to the main screen

**Session Persistence**
- JWT token is stored in `expo-secure-store` (key `auth_token`)
- Biometric preference is stored under the key `biometric_enabled` in SecureStore
- On restart, the token is automatically loaded and validated

**Logout**
- If biometric login is enabled: clears only local state (token remains for future biometric sign-in)
- Otherwise: calls `POST /logout` on the server, deletes the token from SecureStore, and navigates to Login

---

### 4. Navigation Structure

**Root Navigation Logic**
- Auth Navigator (`AuthNavigator`) ↔ Main Navigator (`MainNavigator`) — switches automatically based on token and user presence in AuthContext

**Main Navigation — Bottom Tabs (5 tabs)**

| Tab | Navigator | Screens |
|-----|-----------|---------|
| Home | HomeNavigator | HomeScreen → CategoryScreen → ProductScreen |
| Categories | CategoriesNavigator | CategoriesScreen → CategoryScreen → ProductScreen |
| Search | SearchNavigator | SearchScreen → ProductScreen |
| Favorites | FavoritesNavigator | FavoritesScreen → ProductScreen |
| Cart | CartNavigator | CartScreen → ProductScreen, CheckoutScreen → OrderConfirmationScreen |

**Nested Navigation — ProfileNavigator** (accessible from the Home tab header)
- ProfileScreen
  - ProfileEditScreen
  - ChangePasswordScreen
  - AddressListScreen → AddressFormScreen (create/edit)
  - OrderListScreen → OrderDetailScreen
  - ComplaintListScreen → ComplaintFormScreen / ComplaintDetailScreen

**Header**
- Left: iBag logo (navigates to Home)
- Right: Profile icon (opens ProfileNavigator)

---

### 5. List → Details Flow

| List Screen | Details Screen | Data |
|-------------|---------------|------|
| CategoriesScreen | CategoryScreen → ProductScreen | Categories → products in category → product details |
| SearchScreen | ProductScreen | Search results → product details |
| FavoritesScreen | ProductScreen | Favorite products → product details |
| CartScreen | ProductScreen | Cart items → product details |
| OrderListScreen | OrderDetailScreen | Orders → order details (items, status, address) |
| ComplaintListScreen | ComplaintDetailScreen | Complaints → details (description, images, status) |

Navigation is triggered via `navigation.navigate()` passing an `id` as a route parameter. Detail screens fetch full data via an API call using the provided ID.

---

### 6. Data Source & Backend

- **Backend Type**: Real backend — custom Laravel REST API
- **Base URL**: `https://api.car-gears.com/api/v1`
- **HTTP Client**: Axios with 10s timeout
- **Authentication**: Laravel Sanctum — Bearer token in the `Authorization` header
- **Device Info**: Sends `device_name` (brand + model via expo-device) on login/register for Sanctum token identification

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | Sign in with email, password, device_name → returns token |
| POST | `/register` | Register a new account → returns token |
| POST | `/logout` | Sign out — revokes the current token |
| GET | `/user` | Current user profile (session validation) |
| PUT | `/user/profile` | Update user name |
| PUT | `/user/password` | Change password |
| GET | `/categories` | List categories |
| GET | `/products` | Products with pagination, filter by `category`, search by `q` |
| GET | `/products/{id}` | Product details |
| GET | `/orders` | User orders (paginated) |
| GET | `/orders/{id}` | Order details |
| POST | `/orders` | Create order (address_id, notes, items) |
| PATCH | `/orders/{id}/cancel` | Cancel order |
| GET | `/user/addresses` | User addresses |
| POST | `/user/addresses` | Add address |
| PUT | `/user/addresses/{id}` | Update address |
| DELETE | `/user/addresses/{id}` | Delete address |
| GET | `/user/favorites` | Favorite products (paginated) |
| POST | `/user/favorites` | Add to favorites |
| DELETE | `/user/favorites/{id}` | Remove from favorites |
| GET | `/complaints` | Complaints (paginated) |
| GET | `/complaints/{id}` | Complaint details |
| POST | `/complaints` | Create complaint (multipart/form-data with up to 3 images) |

**API Client Error Handling:**
- No server response → `{ message: 'No connection to server.', network: true }`
- HTTP 422 → field-level validation errors
- HTTP 401/403 → automatic logout and token deletion
- Other errors → `{ status, message, errors }`

---

### 7. Data Operations (CRUD)

**Read (GET)**
- Categories: `GET /categories`
- Products: `GET /products` (with pagination, category filter, search)
- Product details: `GET /products/{id}`
- Orders: `GET /orders` (paginated), `GET /orders/{id}`
- Addresses: `GET /user/addresses`
- Favorites: `GET /user/favorites` (paginated)
- Complaints: `GET /complaints` (paginated), `GET /complaints/{id}`
- User profile: `GET /user`

**Create (POST)**
- Registration: `POST /register`
- Login: `POST /login`
- Order: `POST /orders` (address_id, notes, items)
- Address: `POST /user/addresses`
- Favorite: `POST /user/favorites`
- Complaint: `POST /complaints` (multipart/form-data with up to 3 images)

**Update (PUT/PATCH)**
- Profile (name): `PUT /user/profile`
- Password: `PUT /user/password`
- Address: `PUT /user/addresses/{id}`
- Cancel order: `PATCH /orders/{id}/cancel`
- Cart: Local (AsyncStorage) — quantity adjustments

**Delete (DELETE)**
- Address: `DELETE /user/addresses/{id}`
- Favorite: `DELETE /user/favorites/{id}`
- Cart item: Local (AsyncStorage)

UI is updated after each mutation — either by re-fetching from the server or via optimistic state updates (Favorites).

---

### 8. Forms & Validation

**Login Form**
- Fields: `email`, `password`
- Validation: Server-side; errors displayed below each field and as inline text above the submit button

**Register Form**
- Fields: `name`, `email`, `password`, `password_confirmation`
- Client-side validation:
  - `name` — required, max 255 characters
  - `email` — required, regex email format validation
  - `password` — required, min 8 characters
  - `password_confirmation` — must match password

**Address Form**
- Required: `city`, `contact_first_name`, `contact_last_name`, `contact_phone`
- Optional: `postal_code`, `district`, `street`, `block`, `entrance`, `floor`, `apartment`, `notes` (max 240 chars), `custom_label`
- Special controls: Chip selector for label (Home/Office/custom), elevator toggle, default address toggle, geolocation button

**Checkout Form**
- Fields: `address_id` (required, radio buttons), `notes` (optional)
- Automatically selects the default address

**Complaint Form**
- Fields: `order_id` (picker modal), `subject` (min 5 / max 100), `description` (min 10 / max 500), `desired_resolution` (chip selector), `images` (up to 3)
- Character counters for subject and description
- Photos from camera or gallery with preview and remove button

**Profile Edit** — field `name`

**Change Password** — fields `current_password`, `password`, `password_confirmation`

---

### 9. Native Device Features

| Feature | Library | Where Used | Functionality |
|---------|---------|------------|---------------|
| **Biometric Auth** | `expo-local-authentication` | LoginScreen, AuthContext, ProfileScreen | Fingerprint / Face ID for sign-in; toggle to enable in profile |
| **Secure Storage** | `expo-secure-store` | AuthContext | Secure storage for JWT token and biometric preference |
| **Geolocation** | `expo-location` | AddressFormScreen | Auto-fill address from GPS coordinates via reverse geocoding |
| **Camera & Image Picker** | `expo-image-picker` | ComplaintFormScreen | Photos from camera or gallery to attach to complaints (up to 3) |
| **Device Info** | `expo-device` | API client (client.js) | Sends device name and model on login/register |

---

### 10. Typical User Flow

1. Opens the app → sees the Login screen (or biometric prompt if enabled)
2. Signs in with email and password → lands on the Home screen
3. Browses banners and featured products on the home screen
4. Navigates by category or searches for a specific product
5. Opens a product → views details, price, description
6. Adds the product to cart or favorites (heart icon)
7. Goes to Cart → reviews items, adjusts quantities
8. Taps "Proceed to checkout" → selects a delivery address → confirms the order
9. Receives an order confirmation screen
10. Checks order status in Profile → Orders
11. If needed — files a complaint with photos from Profile → Complaints

---

### 11. Error & Edge Case Handling

**Authentication Errors (401/403)**
- Automatic logout — token is deleted from SecureStore and the user is redirected to the Login screen

**Network Errors**
- Displays "No connection to server." message when there is no internet or the server is unreachable

**Validation Errors (422)**
- Field-specific errors — displayed below each input via HelperText component
- General errors — displayed as inline text or in a Snackbar (4 seconds)

**Empty States**
- Empty lists show appropriate messages (e.g., "No orders yet", "Cart is empty")
- Favorites and Orders display empty state UI when there is no data

**Loading States**
- Loader component while fetching data
- Disabled buttons during submit operations
- Pagination loading indicator when scrolling down

**Biometric Failures**
- Falls back to password login on biometric failure

---

## Tech Stack

| Technology | Version |
|-----------|---------|
| React Native | 0.83.2 |
| Expo SDK | 55 |
| React | 19.2.0 |
| React Navigation | v7 |
| React Native Paper | 5.15.0 |
| Axios | 1.13.6 |

---
