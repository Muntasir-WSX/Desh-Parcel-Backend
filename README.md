# DeshParcel Backend API

DeshParcel is a courier and logistics REST API built for the B7A6 backend assignment. It manages customers, riders, parcel delivery workflows, online payments, rider earnings, administrative operations, and activity auditing.

## Project Status

The current implementation includes the core assignment requirements:

- PostgreSQL with Prisma ORM
- Email/password authentication
- Google ID-token login
- JWT Bearer authentication
- Customer, Rider, and Admin workflows
- Moderator support for operational actions
- Role-based authorization and ownership checks
- Zod request validation
- Structured API responses
- Parcel CRUD with soft deletion
- Pagination, filtering, sorting, and search
- Rider assignment and delivery status transitions
- Delivery OTP verification
- Rider earnings and cashout requests
- bKash and SSLCommerz payment integrations
- SSLCommerz success, failure, cancellation, and IPN callbacks
- Audit log model, critical activity tracking, and admin query endpoint
- Prisma transactions for important workflows
- Redis-based password-reset OTP handling
- Cloudinary parcel image uploads
- Helmet security headers, rate limiting, and configurable CORS

## Technology Stack

- Node.js
- TypeScript
- Express 5
- PostgreSQL
- Prisma
- Zod
- JWT
- bcrypt
- Google Auth Library
- Redis
- Cloudinary
- bKash
- SSLCommerz
- Jest and Supertest

## Architecture

```text
HTTP Request
    |
    v
Routes -> Middleware -> Controllers -> Services -> Prisma/PostgreSQL
                                      |
                                      +-> Redis
                                      +-> Cloudinary
                                      +-> Payment gateways
                                      +-> Email provider
```

## Roles

### Customer

- Register and log in
- Log in with Google
- Manage profile
- Create, view, update, track, and cancel eligible parcels
- View personal parcels and payment history
- Initiate online payment

### Rider

- Register as a rider with vehicle information
- View assigned parcels
- Update parcel delivery status
- Complete delivery with OTP
- View earnings
- Submit cashout requests

### Admin

- Manage users and roles
- Ban users
- Approve riders and parcels
- Assign parcels to riders
- Manage parcel hub status
- View dashboard statistics
- Review withdrawals
- View audit logs

### Moderator

Moderator is an operational role in addition to the three primary roles. Moderators can approve riders, approve parcels, update hub status, assign parcels, and reject parcels. Admin-only operations remain protected.

## Requirements Checklist

| Assignment requirement | Current status |
|---|---|
| PostgreSQL and Prisma | Implemented |
| Relationships and constraints | Implemented |
| Database transactions | Implemented for major workflows |
| Email/password authentication | Implemented |
| Google/GCP social login | Implemented through Google ID-token verification |
| Three primary roles | Implemented: Customer, Rider, Admin |
| Role-based authorization | Implemented |
| Server-side validation | Implemented with Zod on applicable routes |
| Consistent response structure | Implemented for normal controller responses |
| Parcel CRUD | Implemented |
| Soft delete | Implemented for parcels |
| Pagination, filtering, sorting, search | Implemented for parcel lists |
| Business workflow | Implemented through approval, assignment, status, OTP, and earnings flows |
| Real payment integration | Implemented with bKash and SSLCommerz |
| Payment callbacks and IPN | Implemented for SSLCommerz; bKash callback exists |
| Audit logs | Implemented with admin query endpoint |
| Security headers and rate limiting | Implemented |
| Configurable CORS | Implemented |
| API documentation | Postman collection must still be prepared and published |
| Live deployment | Must still be deployed and verified |
| Demo admin credentials | Seed flow is implemented; provide a private evaluator password |
| Video walkthrough | Submission task, not part of the codebase |

## Known Limitations

These features are not required for the core courier workflow or are still recommended improvements:

- Refresh-token rotation and persistent logout revocation are not implemented.
- The logout service foundation exists, but no logout route is currently exposed.
- Email verification for normal registration is not implemented.
- Dedicated Hub and Zone database entities are not implemented; the current hub route records parcel movement in tracking logs.
- Failed-delivery and return-to-sender workflows are not separate endpoints.
- Stripe is not implemented because bKash and SSLCommerz already satisfy the payment requirement.
- Production deployment URL and Postman publication link must be added before submission.
- More automated tests should be added for Google login, payment callbacks, ownership, audit logs, and workflow transitions.
- Payment and balance amounts currently use floating-point fields; Decimal is preferable for production accounting.

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file. Never commit it.

```env
DATABASE_URL=your-postgresql-connection-string
PORT=5000
JWT_SECRET=your-long-random-jwt-secret

FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
CORS_ORIGINS=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id

REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password

EMAIL_USER=your-email
EMAIL_PASS=your-email-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

BKASH_BASE_URL=your-bkash-base-url
BKASH_APP_KEY=your-bkash-app-key
BKASH_APP_SECRET=your-bkash-app-secret
BKASH_USERNAME=your-bkash-username
BKASH_PASSWORD=your-bkash-password

STORE_ID=your-sslcommerz-store-id
STORE_PASSWORD=your-sslcommerz-store-password
IS_LIVE=false

ADMIN_PASSWORD=your-dedicated-demo-admin-password
ADMIN_NAME=DeshParcel Admin
ADMIN_PHONE=01700000000
```

Generate Prisma Client and apply migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Create or update the protected admin account:

```bash
npm run seed
```

Start development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## Admin Demo Account

The seed command creates the protected administrator:

```text
Email: admin@deshparcel.com
Password: the value of ADMIN_PASSWORD
```

Use a dedicated evaluator password. Do not publish a personal password or any production secret in the repository, Postman collection, video, or public submission page.

## API Conventions

Base URL for local testing:

```text
http://localhost:5000
```

Successful responses follow this structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error responses follow this structure:

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": [
    {
      "path": "body.email",
      "message": "Please provide a valid email address."
    }
  ]
}
```

Protected requests use:

```http
Authorization: Bearer {{customerToken}}
```

## Postman Environment

Create these variables in Postman:

```text
baseUrl = http://localhost:5000
customerToken =
riderToken =
adminToken =
moderatorToken =
customerId =
riderId =
parcelId =
trackingId =
withdrawalId =
```

After login, save `data.accessToken` into the correct token variable.

## Complete Postman Route List

Every route below is mounted under `{{baseUrl}}`.

### Health

#### Get API status

```http
GET {{baseUrl}}/
```

No authentication or body is required.

### Authentication

#### Register customer

```http
POST {{baseUrl}}/api/v1/auth/register
Content-Type: application/json
```

```json
{
  "name": "Test Customer",
  "email": "customer@example.com",
  "phone": "01700000000",
  "password": "Password123",
  "role": "CUSTOMER"
}
```

#### Register rider

```http
POST {{baseUrl}}/api/v1/auth/register
Content-Type: application/json
```

```json
{
  "name": "Test Rider",
  "email": "rider@example.com",
  "phone": "01700000001",
  "password": "Password123",
  "role": "RIDER",
  "vehicleType": "Bike",
  "vehicleNumber": "DHAKA-1234",
  "licenseNumber": "LIC-12345",
  "nidNumber": "NID-12345"
}
```

#### Login with email and password

```http
POST {{baseUrl}}/api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "customer@example.com",
  "password": "Password123"
}
```

#### Login with Google

```http
POST {{baseUrl}}/api/v1/auth/google
Content-Type: application/json
```

```json
{
  "idToken": "GOOGLE_ID_TOKEN_FROM_GOOGLE_CLIENT",
  "phone": "01700000000"
}
```

The Google ID token must be issued for the configured `GOOGLE_CLIENT_ID` and contain a verified email.

### User and Profile Routes

#### Get current profile

```http
GET {{baseUrl}}/api/v1/users/me
Authorization: Bearer {{customerToken}}
```

Accepted roles: Customer, Rider, Admin, Moderator.

#### Update current profile

```http
PATCH {{baseUrl}}/api/v1/users/me
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

```json
{
  "name": "Updated Customer",
  "phone": "01711111111"
}
```

#### Request password reset OTP

```http
POST {{baseUrl}}/api/v1/users/forgot-password
Content-Type: application/json
```

```json
{
  "email": "customer@example.com"
}
```

#### Reset password

```http
POST {{baseUrl}}/api/v1/users/reset-password
Content-Type: application/json
```

```json
{
  "email": "customer@example.com",
  "otp": "123456",
  "newPassword": "NewPassword123"
}
```

#### Get my parcels

```http
GET {{baseUrl}}/api/v1/users/my-parcels
Authorization: Bearer {{customerToken}}
```

#### Get my payments

```http
GET {{baseUrl}}/api/v1/users/my-payments
Authorization: Bearer {{customerToken}}
```

### Parcel Routes

#### Create parcel

Use `multipart/form-data`:

```http
POST {{baseUrl}}/api/v1/parcels
Authorization: Bearer {{customerToken}}
```

Form fields:

```text
receiverName = Receiver Name
receiverPhone = 01700000002
pickupAddress = Dhaka
deliveryAddress = Chittagong
weight = 2.5
category = Documents
image = optional image file
```

Save `data.id` as `parcelId` and `data.trackingId` as `trackingId`.

#### List parcels with pagination and filters

```http
GET {{baseUrl}}/api/v1/parcels?page=1&limit=10&status=PENDING&search=DP-&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {{customerToken}}
```

Accepted roles: Customer, Rider, Admin, Moderator.

#### Public parcel tracking

```http
GET {{baseUrl}}/api/v1/parcels/tracking/{{trackingId}}
```

#### Get parcel by ID

```http
GET {{baseUrl}}/api/v1/parcels/{{parcelId}}
Authorization: Bearer {{customerToken}}
```

#### Update parcel

Use `multipart/form-data`:

```http
PATCH {{baseUrl}}/api/v1/parcels/{{parcelId}}
Authorization: Bearer {{customerToken}}
```

Form fields are optional:

```text
receiverName = Updated Receiver
receiverPhone = 01700000003
pickupAddress = Dhaka
deliveryAddress = Chittagong
weight = 3
category = Parcel
image = optional image file
```

#### Soft-delete parcel

```http
DELETE {{baseUrl}}/api/v1/parcels/{{parcelId}}
Authorization: Bearer {{customerToken}}
```

### Rider Routes

#### List assigned parcels

```http
GET {{baseUrl}}/api/v1/rider/assigned-parcels
Authorization: Bearer {{riderToken}}
```

#### Get assigned parcel

```http
GET {{baseUrl}}/api/v1/rider/assigned-parcels/{{parcelId}}
Authorization: Bearer {{riderToken}}
```

#### Update parcel status

```http
PATCH {{baseUrl}}/api/v1/rider/parcels/{{parcelId}}/status
Authorization: Bearer {{riderToken}}
Content-Type: application/json
```

```json
{
  "status": "PICKED_UP",
  "note": "Parcel picked up from sender"
}
```

Typical transitions:

```text
ASSIGNED -> PICKED_UP
PICKED_UP -> AT_HUB
AT_HUB -> TRANSFER_TO_HUB or OUT_FOR_DELIVERY
TRANSFER_TO_HUB -> IN_TRANSIT
IN_TRANSIT -> OUT_FOR_DELIVERY
```

#### Deliver parcel with OTP

```http
POST {{baseUrl}}/api/v1/rider/parcels/{{parcelId}}/deliver
Authorization: Bearer {{riderToken}}
Content-Type: application/json
```

```json
{
  "otp": "1234"
}
```

#### View rider profile and earnings

```http
GET {{baseUrl}}/api/v1/rider/profile-earnings
Authorization: Bearer {{riderToken}}
```

#### View earnings report

```http
GET {{baseUrl}}/api/v1/rider/earnings-report
Authorization: Bearer {{riderToken}}
```

#### Request rider cashout

```http
POST {{baseUrl}}/api/v1/rider/cashout
Authorization: Bearer {{riderToken}}
Content-Type: application/json
```

```json
{
  "amount": 100,//dynamic
  "bkashNo": "01770618575",
  "OTP":"123456",
  "Password":"12121"
}
```

### Admin Routes

#### Update user role

```http
PATCH {{baseUrl}}/api/v1/admin/users/{{customerId}}/role
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "role": "MODERATOR"
}
```

#### Ban user

```http
PATCH {{baseUrl}}/api/v1/admin/users/{{customerId}}/ban
Authorization: Bearer {{adminToken}}
```

#### Approve rider

```http
PATCH {{baseUrl}}/api/v1/admin/riders/{{riderId}}/approve
Authorization: Bearer {{adminToken}}
```

#### Approve parcel

```http
PATCH {{baseUrl}}/api/v1/admin/parcels/{{parcelId}}/approve
Authorization: Bearer {{adminToken}}
```

#### Update parcel hub status

```http
PATCH {{baseUrl}}/api/v1/admin/parcels/{{parcelId}}/hub-status
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "currentHub": "Dhaka Hub",
  "note": "Parcel arrived at the origin hub"
}
```

#### Assign parcel to rider

```http
POST {{baseUrl}}/api/v1/admin/parcels/assign
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "parcelId": "{{parcelId}}",
  "riderId": "{{riderId}}"
}
```

#### Dashboard statistics

```http
GET {{baseUrl}}/api/v1/admin/dashboard-stats
Authorization: Bearer {{adminToken}}
```

#### List users

```http
GET {{baseUrl}}/api/v1/admin/users?page=1&limit=10
Authorization: Bearer {{adminToken}}
```

#### List all parcels

```http
GET {{baseUrl}}/api/v1/admin/parcels
Authorization: Bearer {{adminToken}}
```

#### Reject and soft-delete parcel

```http
DELETE {{baseUrl}}/api/v1/admin/parcels/{{parcelId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "reason": "Parcel information does not match"
}
```

#### List withdrawal requests

```http
GET {{baseUrl}}/api/v1/admin/withdrawal-requests
Authorization: Bearer {{adminToken}}
```

#### Approve or reject withdrawal

```http
PATCH {{baseUrl}}/api/v1/admin/withdrawal-requests/{{withdrawalId}}/status
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{
  "status": "APPROVED"
}
```

#### List audit logs

```http
GET {{baseUrl}}/api/v1/admin/audit-logs?page=1&limit=20&action=PARCEL_ASSIGNED&resource=PARCEL
Authorization: Bearer {{adminToken}}
```

### Payment Routes

#### Initiate bKash payment

```http
POST {{baseUrl}}/api/v1/payments/bkash/initiate
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

```json
{
  "parcelId": "{{parcelId}}"
}
```

#### bKash callback

This route is called by bKash after customer payment. It is listed for verification and should not normally be called manually:

```http
GET {{baseUrl}}/api/v1/payments/bkash/callback?paymentID=PAYMENT_ID&status=success&parcelId={{parcelId}}
```

#### Initiate SSLCommerz payment

```http
POST {{baseUrl}}/api/v1/payments/ssl/initiate
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

```json
{
  "parcelId": "{{parcelId}}"
}
```

#### SSLCommerz success callback

```http
GET {{baseUrl}}/api/v1/payments/ssl/success?parcelId={{parcelId}}&tran_id=TRANSACTION_ID&val_id=VALIDATION_ID
```

#### SSLCommerz failure callback

```http
POST {{baseUrl}}/api/v1/payments/ssl/fail?parcelId={{parcelId}}
```

#### SSLCommerz cancellation callback

```http
POST {{baseUrl}}/api/v1/payments/ssl/cancel?parcelId={{parcelId}}
```

#### SSLCommerz IPN

This route is called by SSLCommerz. It validates the gateway transaction before updating the database:

```http
POST {{baseUrl}}/api/v1/payments/ssl/ipn
Content-Type: application/json
```

```json
{
  "parcelId": "{{parcelId}}",
  "tran_id": "TRANSACTION_ID",
  "val_id": "VALIDATION_ID"
}
```

#### Get payment status

```http
GET {{baseUrl}}/api/v1/payments/{{parcelId}}
Authorization: Bearer {{customerToken}}
```

## Recommended Postman Test Order

1. Call the health endpoint.
2. Register a customer.
3. Log in as the customer and save `customerToken`.
4. Get the customer profile.
5. Create a parcel and save `parcelId` and `trackingId`.
6. List parcels using pagination, search, and status filtering.
7. Test public tracking.
8. Test customer parcel history and payment history.
9. Log in with the seeded admin account and save `adminToken`.
10. Approve the parcel as admin.
11. Register a rider and save `riderId`.
12. Approve the rider as admin.
13. Assign the approved parcel to the rider.
14. Log in as the rider and save `riderToken`.
15. View assigned parcels.
16. Update parcel status through the valid workflow.
17. Complete delivery with the delivery OTP.
18. View rider earnings and submit a cashout request.
19. Approve or reject the cashout as admin.
20. Initiate bKash or SSLCommerz payment in the configured sandbox.
21. Verify payment callback/IPN behavior.
22. Query the audit log endpoint as admin.
23. Test an invalid email and confirm the structured validation response.
24. Test a missing UUID and confirm the structured error response.
25. Test a customer token against an admin endpoint and confirm `403 Forbidden`.
26. Test an unauthenticated private endpoint and confirm `401 Unauthorized`.

## Useful Negative Tests

Invalid registration:

```json
{
  "name": "A",
  "email": "invalid-email",
  "phone": "1",
  "password": "123"
}
```

Expected result: HTTP `400` with `success: false` and an `errors` array.

Unauthorized request:

```http
GET {{baseUrl}}/api/v1/admin/users
```

Expected result: HTTP `401`.

Forbidden role request:

```http
GET {{baseUrl}}/api/v1/admin/dashboard-stats
Authorization: Bearer {{customerToken}}
```

Expected result: HTTP `403`.

## Deployment Checklist

Before submitting, confirm:

- A production PostgreSQL database is configured.
- `npx prisma migrate deploy` succeeds in the deployment environment.
- `npx prisma generate` succeeds during build.
- `API_URL` is the public backend URL.
- `FRONTEND_URL` is the public frontend redirect URL.
- `CORS_ORIGINS` contains only trusted frontend origins.
- SSLCommerz success, fail, cancel, and IPN URLs are reachable publicly.
- Google OAuth client ID is configured for the deployed environment.
- bKash and SSLCommerz credentials match the selected sandbox/live mode.
- Redis is reachable by the deployed service.
- Admin seed credentials are created securely.
- All secrets remain in deployment environment variables.
- The Postman collection is exported and published.
- The API walkthrough video is recorded and shared.

## Submission Information

Complete this section before submission:

```text
Project Name    : DeshParcel - Courier and Logistics API
Backend Repo    : <repository URL>
Live API        : <deployed API URL>
API Docs        : <published Postman collection URL>
Demo Video      : <video URL>
Admin Email     : admin@deshparcel.com
Admin Password  : <dedicated evaluator password>
```
