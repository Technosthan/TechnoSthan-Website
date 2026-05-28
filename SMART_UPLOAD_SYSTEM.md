# Smart Dynamic Contact Upload & Merge System

## Overview

A fully intelligent contact management system that automatically detects CSV/XLSX file headers, manages dynamic columns, intelligently merges duplicate records, and provides advanced search/pagination capabilities.

---

## Core Features

### 1. **Dynamic Header Detection**

- Automatically reads all column headers from uploaded CSV/XLSX files
- Handles different files with different column structures
- Normalizes header names (removes special chars, handles duplicates)
- Supports unlimited dynamic headers

### 2. **Intelligent Duplicate Merge Logic**

#### Scenario 1: Exact Duplicate (All fields identical)

```
Existing record: email: abc@gmail.com, phone: 9999999999
New record:     email: abc@gmail.com, phone: 9999999999
Result:         SKIPPED (no duplicate row created)
```

#### Scenario 2: Partial Match with Different Values

```
Existing: email: abc@gmail.com, phone: 9999999999, city: "NYC"
New:      email: abc@gmail.com, phone: 8888888888, city: "NYC"
Result:   Single row with:
          - email: abc@gmail.com (original)
          - phone: 9999999999 (original)
          - phone2: 8888888888 (new variation)
          - city: NYC
```

#### Scenario 3: Multiple Variations

```
First upload:  phone: 9999999999
Second upload: phone: 8888888888
Third upload:  phone: 7777777777
Result:        Single row with phone, phone2, phone3
```

### 3. **Field Versioning**

Creates numbered variants for conflicting field values:

- `email`, `email2`, `email3`, ...
- `phone`, `phone2`, `phone3`, ...
- `address`, `address2`, `address3`, ...
- Works for ALL dynamic fields

**Important**: Original values are NEVER overwritten

### 4. **Header Management**

- Edit header names directly in the table
- Permanently save custom header labels in database
- Renamed headers maintain data mapping
- User-specific header configurations

### 5. **Search & Filtering**

- Global search across all dynamic fields
- Real-time filtering as you type
- Case-insensitive matching
- Searches in denormalized `searchText` field

### 6. **Pagination & Sorting**

- Configurable records per page (default: 50)
- Navigate through pages with smart pagination UI
- Sort by any column (email, phone, name, status, date, etc.)
- Ascending/descending sort indicators

### 7. **Upload Summary**

Returns detailed statistics:

```json
{
  "totalUploaded": 100, // Total rows in file
  "newRecords": 75, // Brand new contacts
  "mergedRecords": 20, // Updated existing records
  "skippedDuplicates": 5 // Exact duplicates ignored
}
```

---

## Backend Implementation

### Models

#### Contact Schema

```javascript
{
  email: String,                    // Indexed, unique per user (sparse)
  phone: String,
  name: String,
  uploadedBy: ObjectId (ref: User),
  status: String enum,              // pending, sent, failed, waiting_approval
  message: String,
  errorMessage: String,
  sentAt: Date,
  data: Map<String, String>,        // All dynamic fields stored here
  headerKeys: [String],             // List of all field keys in this record
  searchText: String,               // Denormalized for fast searching
  createdAt: Date,
  updatedAt: Date
}
```

#### HeaderConfig Schema

```javascript
{
  user: ObjectId (ref: User),       // User-specific headers
  key: String,                      // Field key (e.g., 'address', 'company')
  label: String,                    // Display label (editable by user)
  unique: { user, key },            // Prevent duplicates per user
  createdAt: Date,
  updatedAt: Date
}
```

### API Endpoints

#### Upload

```
POST /api/upload
- File: multipart/form-data
- Returns: { totalUploaded, newRecords, mergedRecords, skippedDuplicates }
```

#### Get Contacts with Pagination

```
GET /api/status?page=1&limit=50&search=query&sortBy=email&sortOrder=-1
- search: Global search term
- sortBy: Field to sort by
- sortOrder: 1 (asc) or -1 (desc)
- Returns: { contacts, headers, stats, pagination }
```

#### Update Header Labels

```
PUT /api/headers
Body: { updates: [{ key: "address", label: "Street Address" }] }
- Saves custom header labels per user
```

#### Delete All Contacts

```
DELETE /api/my-contacts
```

---

## Frontend Components

### ContactsTable

**Props:**

- `data`: Contact array
- `headers`: Header metadata with key/label
- `editableHeaders`: Enable inline label editing
- `onHeaderLabelChange`: Callback for header edits
- `onSortChange`: Callback for column sorting
- `pagination`: { currentPage, totalPages, totalRecords }
- `onPageChange`: Callback for pagination

**Features:**

- Renders all dynamic columns
- Click column headers to sort
- Edit labels directly in header row
- Hover rows for visual feedback
- Responsive table with ellipsis for long values
- Shows last 5 page numbers in pagination

### UserDashboard

**Features:**

- File upload with progress bar
- Live poll status updates when pending emails exist
- Search across all fields (real-time)
- Sort by any column
- Edit and save header names
- Pagination controls
- Quick refresh button
- Clear all contacts button
- Upload summary display

### AdminDashboard

- View all user uploads
- Approve/reject uploads by user
- Same dynamic table rendering
- Header management available

---

## Usage Examples

### Upload a CSV

```
1. Click "Choose File"
2. Select contacts.csv
3. Click "Upload & Send"
4. System auto-detects: Email, Phone, Company, Address, City, State, Zip
5. New contacts are added, duplicates are intelligently merged
6. Upload summary shows results
```

### Merge Example

**File 1 (First Upload):**

```
Email: john@example.com
Phone: 555-0001
City: New York
```

**File 2 (Second Upload - Same Email, Different Phone):**

```
Email: john@example.com
Phone: 555-0002
City: New York
```

**Result in Database:**

```
Single row:
- email: john@example.com
- phone: 555-0001 (original)
- phone2: 555-0002 (merged)
- city: New York
```

### Rename Headers

```
1. In table, headers show default names: "address", "company"
2. Click input field in header
3. Type new name: "Street Address", "Company Name"
4. Click "Save Headers" button
5. Changes persist and display everywhere
```

### Search

```
1. Type in "Search all fields..." input
2. Press Enter or click Search
3. Results filter to matching records
4. Searches across email, phone, name, city, address, etc.
```

---

## Database Performance Optimizations

1. **Sparse Unique Index** on email
   - Only indexes non-empty emails
   - Avoids duplicates when email exists

2. **Denormalized searchText**
   - Pre-computed from all field values
   - Fast regex searches

3. **Map Storage for Dynamic Fields**
   - Flexible, no schema migration needed
   - Direct field access in queries

4. **Pagination**
   - Skip/limit for large datasets
   - Prevents loading all records into memory

---

## Merge Algorithm (Pseudocode)

```javascript
function mergeFields(existingData, incomingData) {
  merged = clone(existingData)

  for each key in incomingData {
    incomingValue = incomingData[key] || ''
    currentValue = merged[key] || ''

    if (!currentValue) {
      // Field doesn't exist, add it
      merged[key] = incomingValue
      continue
    }

    if (incomingValue && currentValue !== incomingValue) {
      // Values differ, create versioned key
      suffixIndex = 2
      suffixKey = `${key}${suffixIndex}`

      while (merged[suffixKey] exists) {
        if (merged[suffixKey] === incomingValue) {
          // Value already exists as variation, skip
          break
        }
        suffixIndex++
        suffixKey = `${key}${suffixIndex}`
      }

      // Add new variation if not already present
      if (merged[suffixKey] !== incomingValue) {
        merged[suffixKey] = incomingValue
      }
    }
    // If values are same, do nothing (already stored)
  }

  return merged
}
```

---

## Duplicate Detection Logic

```javascript
function isSameDuplicate(existing, incoming) {
  allKeys = unique([...Object.keys(existing), ...Object.keys(incoming)]);

  return allKeys.every((key) => {
    existingValue = trim(String(existing[key] || ""));
    incomingValue = trim(String(incoming[key] || ""));
    return existingValue === incomingValue;
  });
}
```

---

## Responsive Design

- **Mobile**: Single column table, header collapsing, stacked controls
- **Tablet**: 2-3 column layout, condensed pagination
- **Desktop**: Full multi-column table, all controls visible
- Min-width fields prevent layout breaking on narrow screens

---

## Error Handling

- File validation (CSV/XLSX only)
- Empty file detection
- Invalid email/phone detection
- Database constraint errors handled gracefully
- User-friendly error messages

---

## Testing Checklist

- [ ] Upload CSV with 5 unique contacts
- [ ] Upload XLSX with 3 new, 1 duplicate, 1 merge
- [ ] Verify field versioning (phone2, email2)
- [ ] Search for partial field matches
- [ ] Sort by different columns
- [ ] Rename headers and save
- [ ] Verify header names persist after reload
- [ ] Check pagination works with 100+ records
- [ ] Test with special characters in headers
- [ ] Verify searchText includes all field values

---

## Configuration

**Page Limit** (records per page): Configurable in UserDashboard.js

```javascript
const [pageLimit] = useState(50); // Change this value
```

**Valid Sort Fields:**

- `createdAt` (default)
- `email`
- `phone`
- `name`
- `status`
- `sentAt`

**Duplicate Detection Strategy:**

- Email-based (primary)
- Phone-based (secondary)
- Name-based (tertiary)
- Any match triggers duplicate check

---

## Future Enhancements

- [ ] Bulk edit multiple records
- [ ] Export filtered contacts as CSV
- [ ] Duplicate merge history/audit trail
- [ ] Custom merge rules per user
- [ ] Field-level permission controls
- [ ] Advanced filtering (date range, status filter)
- [ ] Batch delete with confirmation
- [ ] Import from spreadsheet directly in browser

---

## Support

For questions or issues:

1. Check upload logs in Activity section
2. Verify file format (CSV/XLSX only)
3. Ensure email/phone are in recognizable formats
4. Check database connection and storage quota
