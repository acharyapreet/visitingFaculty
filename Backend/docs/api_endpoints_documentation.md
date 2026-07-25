# API Endpoint Documentation for Frontend Team

This document provides detailed API specifications for the faculty and admin retrieval endpoints.

---

## 1. Get Faculty Details by User ID

Retrieves detailed profile information for a faculty member.

*   **Endpoint:** `/api/admin/faculty/:user_id`
*   **Method:** `GET`
*   **Authentication:** Required (Bearer Token)
*   **Authorized Roles:** `faculty`, `admin`

### Request Specifications

#### Headers
| Name | Type | Value | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `String` | `Bearer <token>` | JWT token received upon login. |
| `Content-Type` | `String` | `application/json` | |

#### Path Parameters
| Name | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `Number` | The unique integer ID of the faculty user. |

---

### Response Specifications

#### Success Response (200 OK)
*   **Content-Type:** `application/json`
*   **Description:** Returns the faculty profile details (excluding the `password_hash` for security).

```json
{
  "success": true,
  "data": {
    "user_id": 12,
    "role": "faculty",
    "email": "faculty.member@iips.edu",
    "full_name": "Dr. Ramesh Sharma",
    "phone_number": "9876543210",
    "address": "456 Academic Block, IIPS Campus, Indore",
    "qualification": "PhD in Computer Science",
    "aadhaar_no": "123456789012",
    "account_no": "987654321098",
    "bank_name": "State Bank of India",
    "ifsc_code": "SBIN0001234",
    "pan_card_no": "ABCDE1234F",
    "uvfin": "UV-2026-F10",
    "is_approved": true,
    "is_active": true,
    "created_at": "2026-07-20T10:30:00.000Z",
    "updated_at": "2026-07-24T12:00:00.000Z",
    "last_login": "2026-07-24T15:30:00.000Z"
  }
}
```

#### Error Responses

##### 1. Unauthorized (401 Unauthorized)
*   **Reason:** Missing or invalid JWT token, or user account is inactive.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Authentication required. Please provide a valid token."
    }
    ```
    *(or)*
    ```json
    {
      "success": false,
      "message": "User not found or account is inactive"
    }
    ```

##### 2. Forbidden / Account Not Approved (403 Forbidden)
*   **Reason:** User exists but account has not yet been approved.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Your account is pending approval"
    }
    ```

##### 3. Forbidden / Role Mismatch (403 Forbidden)
*   **Reason:** User is authenticated but does not have the `faculty` or `admin` role.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Insufficient permissions. Access denied."
    }
    ```

##### 4. Internal Server Error / Not Found (500 Internal Server Error)
*   **Reason:** Database error, or the faculty member was not found/role is not `faculty`.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Failed to fetch Faculty",
      "error": "Failed to fetch faculty by id"
    }
    ```

---

### Example Frontend Code (Axios)

```javascript
import axios from 'axios';

const getFacultyDetails = async (userId, token) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/admin/faculty/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Includes: success (boolean) and data (faculty details object)
  } catch (error) {
    console.error('Error fetching faculty details:', error.response?.data || error.message);
    throw error;
  }
};
```

---
---

## 2. Get Admin Details by User ID

Retrieves detailed profile information for an admin user.

*   **Endpoint:** `/api/super_admin/admin/:user_id`
*   **Method:** `GET`
*   **Authentication:** Required (Bearer Token)
*   **Authorized Roles:** `super_admin`, `admin`

### Request Specifications

#### Headers
| Name | Type | Value | Description |
| :--- | :--- | :--- | :--- |
| `Authorization` | `String` | `Bearer <token>` | JWT token received upon login. |
| `Content-Type` | `String` | `application/json` | |

#### Path Parameters
| Name | Type | Description |
| :--- | :--- | :--- |
| `user_id` | `Number` | The unique integer ID of the admin user. |

---

### Response Specifications

#### Success Response (200 OK)
*   **Content-Type:** `application/json`
*   **Description:** Returns the admin profile details (excluding the `password_hash` for security).

```json
{
  "success": true,
  "data": {
    "user_id": 5,
    "role": "admin",
    "email": "admin.office@iips.edu",
    "full_name": "Sanjay Verma",
    "phone_number": "9876543222",
    "address": "IIPS Admin Office, Indore",
    "qualification": "MBA in Finance",
    "aadhaar_no": "987654321098",
    "account_no": "123456789012",
    "bank_name": "HDFC Bank",
    "ifsc_code": "HDFC0000111",
    "pan_card_no": "FGHIJ5678K",
    "uvfin": null,
    "is_approved": true,
    "is_active": true,
    "created_at": "2026-07-15T09:15:00.000Z",
    "updated_at": "2026-07-24T12:00:00.000Z",
    "last_login": "2026-07-24T16:00:00.000Z"
  }
}
```

#### Error Responses

##### 1. Unauthorized (401 Unauthorized)
*   **Reason:** Missing or invalid JWT token, or user account is inactive.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Authentication required. Please provide a valid token."
    }
    ```
    *(or)*
    ```json
    {
      "success": false,
      "message": "User not found or account is inactive"
    }
    ```

##### 2. Forbidden / Account Not Approved (403 Forbidden)
*   **Reason:** User exists but account has not yet been approved.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Your account is pending approval"
    }
    ```

##### 3. Forbidden / Role Mismatch (403 Forbidden)
*   **Reason:** User is authenticated but does not have the `super_admin` or `admin` role.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Insufficient permissions. Access denied."
    }
    ```

##### 4. Internal Server Error / Not Found (500 Internal Server Error)
*   **Reason:** Database error, or the admin user was not found/role is not `admin`.
*   **Body:**
    ```json
    {
      "success": false,
      "message": "Failed to fetch Admin",
      "error": "Failed to fetch admin by id"
    }
    ```

---

### Example Frontend Code (Axios)

```javascript
import axios from 'axios';

const getAdminDetails = async (userId, token) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/super_admin/admin/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Includes: success (boolean) and data (admin details object)
  } catch (error) {
    console.error('Error fetching admin details:', error.response?.data || error.message);
    throw error;
  }
};
```
