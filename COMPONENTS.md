# Component Structure - Blood Donation System

## 📦 Component Organization

This document outlines the complete component architecture and hierarchy for the Blood Donation Stock Management System.

---

## 🏗️ Directory Structure

```
src/
├── components/              # Reusable UI components
│   ├── common/             # Shared across entire app
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Loader.jsx
│   │
│   ├── layout/             # Layout wrappers
│   │   ├── DashboardLayout.jsx
│   │   └── PublicLayout.jsx
│   │
│   └── dashboard/          # Dashboard-specific components
│       ├── StatsCard.jsx
│       ├── BloodStockTable.jsx
│       ├── RequestCard.jsx
│       └── DonorCard.jsx
│
├── pages/                  # Page-level components (Routes)
│   ├── public/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   └── dashboard/
│       ├── donor/
│       │   ├── DonorDashboard.jsx
│       │   ├── DonorProfile.jsx
│       │   ├── DonationHistory.jsx
│       │   └── AppointmentBooking.jsx
│       │
│       ├── hospital/
│       │   ├── HospitalDashboard.jsx
│       │   ├── BloodStock.jsx
│       │   ├── RequestBlood.jsx
│       │   └── RequestHistory.jsx
│       │
│       └── admin/
│           ├── AdminDashboard.jsx
│           ├── ManageDonors.jsx
│           ├── ManageHospitals.jsx
│           ├── BloodInventory.jsx
│           └── Reports.jsx
```

---

## 🧩 Component Types

### 1. Common Components (Reusable UI)
**Location**: `src/components/common/`  
**Purpose**: Basic UI building blocks used throughout the app

#### Navbar.jsx
**Purpose**: Top navigation bar  
**Used In**: All pages  
**Features**:
- Logo
- Navigation links (Home, About, Login/Logout)
- User profile dropdown (when logged in)
- Mobile responsive menu

**Props**:
```jsx
<Navbar 
  isAuthenticated={boolean}
  userRole={string}
  onLogout={function}
/>
```

#### Footer.jsx
**Purpose**: Bottom footer  
**Used In**: All pages  
**Features**:
- Copyright information
- Contact links
- Social media links

**Props**: None (static content)

#### Button.jsx
**Purpose**: Reusable button component  
**Used In**: Forms, actions throughout app  
**Features**:
- Multiple variants (primary, secondary, danger)
- Loading state
- Disabled state
- Icon support

**Props**:
```jsx
<Button
  variant="primary" // primary | secondary | danger | outline
  size="medium"     // small | medium | large
  disabled={boolean}
  loading={boolean}
  onClick={function}
  icon={ReactNode}
>
  Button Text
</Button>
```

#### Card.jsx
**Purpose**: Container component with shadow/border  
**Used In**: Dashboards, data displays  
**Features**:
- Rounded corners
- Shadow effects
- Hover animations

**Props**:
```jsx
<Card
  title={string}
  subtitle={string}
  hoverable={boolean}
  onClick={function}
>
  {children}
</Card>
```

#### Input.jsx
**Purpose**: Form input field  
**Used In**: Forms (login, profiles, etc.)  
**Features**:
- Label
- Error message display
- Different types (text, email, password, number)
- Icon support

**Props**:
```jsx
<Input
  label={string}
  type="text"       // text | email | password | number
  value={string}
  onChange={function}
  error={string}
  placeholder={string}
  required={boolean}
  icon={ReactNode}
/>
```

#### Modal.jsx
**Purpose**: Popup/dialog overlay  
**Used In**: Confirmations, forms, details  
**Features**:
- Overlay backdrop
- Close button
- Customizable content

**Props**:
```jsx
<Modal
  isOpen={boolean}
  onClose={function}
  title={string}
  size="medium"     // small | medium | large
>
  {children}
</Modal>
```

#### Loader.jsx
**Purpose**: Loading spinner/indicator  
**Used In**: Data fetching states  
**Features**:
- Spinning animation
- Different sizes
- Overlay mode

**Props**:
```jsx
<Loader
  size="medium"     // small | medium | large
  fullScreen={boolean}
/>
```

---

### 2. Layout Components
**Location**: `src/components/layout/`  
**Purpose**: Page structure wrappers

#### PublicLayout.jsx
**Purpose**: Layout for public pages (Home, Login)  
**Features**:
- Navbar (with Login button)
- Main content area
- Footer

**Structure**:
```jsx
<PublicLayout>
  <Navbar />
  <main>{children}</main>
  <Footer />
</PublicLayout>
```

**Usage**:
```jsx
<PublicLayout>
  <HomePage />
</PublicLayout>
```

#### DashboardLayout.jsx
**Purpose**: Layout for all dashboard pages  
**Features**:
- Top navbar (with Logout, User menu)
- Sidebar navigation (role-specific links)
- Main content area
- Breadcrumbs

**Structure**:
```jsx
<DashboardLayout>
  <Navbar />
  <Sidebar role={userRole} />
  <main>
    <Breadcrumbs />
    {children}
  </main>
</DashboardLayout>
```

**Usage**:
```jsx
<DashboardLayout>
  <DonorDashboard />
</DashboardLayout>
```

---

### 3. Dashboard Components
**Location**: `src/components/dashboard/`  
**Purpose**: Specialized components for dashboards

#### StatsCard.jsx
**Purpose**: Display statistics/metrics  
**Used In**: All dashboards  
**Features**:
- Number display
- Label
- Icon
- Color coding
- Trend indicator (up/down)

**Props**:
```jsx
<StatsCard
  title="Total Donations"
  value={245}
  icon={<IconDonation />}
  trend="up"        // up | down | neutral
  trendValue="+12%"
  color="primary"   // primary | success | warning | danger
/>
```

#### BloodStockTable.jsx
**Purpose**: Display blood inventory in table format  
**Used In**: Hospital/Admin dashboards  
**Features**:
- Blood type columns (A+, B+, O+, etc.)
- Quantity display
- Status indicators (Low/Medium/High stock)
- Color-coded alerts

**Props**:
```jsx
<BloodStockTable
  data={[
    { type: 'A+', quantity: 50, status: 'medium' },
    { type: 'O-', quantity: 10, status: 'low' },
  ]}
  showActions={boolean}
  onRequestBlood={function}
/>
```

#### RequestCard.jsx
**Purpose**: Display blood request information  
**Used In**: Hospital/Admin dashboards  
**Features**:
- Request ID
- Blood type needed
- Quantity
- Status (Pending/Approved/Rejected)
- Timestamp

**Props**:
```jsx
<RequestCard
  request={{
    id: 'REQ-001',
    bloodType: 'A+',
    quantity: 2,
    status: 'pending',
    requestDate: '2026-01-07',
    hospitalName: 'ABC Hospital'
  }}
  showActions={boolean}
  onApprove={function}
  onReject={function}
/>
```

#### DonorCard.jsx
**Purpose**: Display donor information  
**Used In**: Admin dashboard, donor lists  
**Features**:
- Donor name
- Blood type
- Contact info
- Last donation date
- Status (Active/Inactive)

**Props**:
```jsx
<DonorCard
  donor={{
    id: 'DNR-001',
    name: 'John Doe',
    bloodType: 'O+',
    lastDonation: '2025-12-15',
    status: 'active',
    phone: '123-456-7890'
  }}
  showActions={boolean}
  onEdit={function}
  onDelete={function}
/>
```

---

## 📄 Page Components

### Public Pages

#### HomePage.jsx
**Route**: `/`  
**Purpose**: Landing page  
**Sections**:
1. Hero section with CTA
2. Features/Benefits
3. Statistics (total donors, lives saved)
4. How it works
5. Call to action (Login/Register)

**Components Used**:
- `Button`
- `Card`

#### LoginPage.jsx
**Route**: `/login`  
**Purpose**: User authentication  
**Features**:
- Email input
- Password input
- Role selector (Donor/Hospital/Admin)
- Submit button
- Error messages

**Components Used**:
- `Input`
- `Button`
- `Card`

#### NotFoundPage.jsx
**Route**: `/*` (404)  
**Purpose**: Handle invalid routes  
**Features**:
- 404 message
- Back to home button

---

### Donor Pages

#### DonorDashboard.jsx
**Route**: `/dashboard/donor`  
**Purpose**: Main donor overview  
**Sections**:
- Welcome message
- Donation stats (total donations, last donation)
- Next eligible donation date
- Blood stock availability
- Quick actions (Book appointment)

**Components Used**:
- `StatsCard`
- `BloodStockTable`
- `Button`

#### DonorProfile.jsx
**Route**: `/dashboard/donor/profile`  
**Purpose**: View/edit donor profile  
**Features**:
- Personal information form
- Blood type
- Contact details
- Medical history
- Save button

**Components Used**:
- `Input`
- `Button`
- `Card`

#### DonationHistory.jsx
**Route**: `/dashboard/donor/history`  
**Purpose**: View past donations  
**Features**:
- Table of donations
- Date, location, quantity
- Downloadable certificate

**Components Used**:
- Table component
- `Card`

#### AppointmentBooking.jsx
**Route**: `/dashboard/donor/book-appointment`  
**Purpose**: Schedule donation  
**Features**:
- Date picker
- Time slot selection
- Location selection
- Submit form

**Components Used**:
- `Input`
- `Button`
- Date picker
- `Card`

---

### Hospital Pages

#### HospitalDashboard.jsx
**Route**: `/dashboard/hospital`  
**Purpose**: Hospital overview  
**Sections**:
- Blood stock overview
- Pending requests
- Recent requests
- Quick request button

**Components Used**:
- `BloodStockTable`
- `RequestCard`
- `StatsCard`

#### BloodStock.jsx
**Route**: `/dashboard/hospital/stock`  
**Purpose**: Detailed blood inventory  
**Features**:
- Complete stock table
- Filter by blood type
- Search

**Components Used**:
- `BloodStockTable`

#### RequestBlood.jsx
**Route**: `/dashboard/hospital/request`  
**Purpose**: Request blood  
**Features**:
- Blood type selector
- Quantity input
- Urgency level
- Reason for request
- Submit button

**Components Used**:
- `Input`
- `Button`
- `Card`

#### RequestHistory.jsx
**Route**: `/dashboard/hospital/history`  
**Purpose**: View past requests  
**Features**:
- Table of requests
- Status indicators
- Filter by status

**Components Used**:
- `RequestCard`
- Table

---

### Admin Pages

#### AdminDashboard.jsx
**Route**: `/dashboard/admin`  
**Purpose**: System overview  
**Sections**:
- Total donors stat
- Total hospitals stat
- Total blood units stat
- Recent activity
- Quick actions

**Components Used**:
- `StatsCard`
- `DonorCard`
- `RequestCard`

#### ManageDonors.jsx
**Route**: `/dashboard/admin/donors`  
**Purpose**: CRUD for donors  
**Features**:
- List of all donors
- Search/filter
- Add new donor button
- Edit/Delete actions

**Components Used**:
- `DonorCard`
- `Button`
- `Modal` (for add/edit)

#### ManageHospitals.jsx
**Route**: `/dashboard/admin/hospitals`  
**Purpose**: CRUD for hospitals  
**Features**:
- List of hospitals
- Add/Edit/Delete
- Hospital details

**Components Used**:
- `Card`
- `Button`
- `Modal`

#### BloodInventory.jsx
**Route**: `/dashboard/admin/inventory`  
**Purpose**: Manage blood stock  
**Features**:
- Blood stock table
- Update quantities
- Add new stock
- Remove expired stock

**Components Used**:
- `BloodStockTable`
- `Input`
- `Button`

#### Reports.jsx
**Route**: `/dashboard/admin/reports`  
**Purpose**: Analytics and reports  
**Features**:
- Charts (donations over time)
- Export functionality
- Filter by date range

**Components Used**:
- Charts library
- `Button` (export)
- Date picker

---

## 🔄 Component Hierarchy Example

### DonorDashboard Page Structure

```
<DashboardLayout>
  <Navbar isAuthenticated={true} userRole="donor" />
  <Sidebar role="donor">
    <NavLink to="/dashboard/donor">Dashboard</NavLink>
    <NavLink to="/dashboard/donor/profile">Profile</NavLink>
    <NavLink to="/dashboard/donor/history">History</NavLink>
    <NavLink to="/dashboard/donor/book-appointment">Book</NavLink>
  </Sidebar>
  <main>
    <DonorDashboard>
      <h1>Welcome back, John!</h1>
      <div className="stats-grid">
        <StatsCard title="Total Donations" value={12} />
        <StatsCard title="Last Donation" value="30 days ago" />
        <StatsCard title="Next Eligible" value="60 days" />
      </div>
      <Card title="Blood Stock Availability">
        <BloodStockTable data={stockData} />
      </Card>
      <Button onClick={handleBookAppointment}>
        Book Appointment
      </Button>
    </DonorDashboard>
  </main>
</DashboardLayout>
```

---

## 🎨 Component Design Patterns

### Smart vs Presentational

**Smart Components** (Container/Pages):
- Manage state
- Handle logic and data fetching
- Pass data to presentational components
- Examples: `DonorDashboard.jsx`, `LoginPage.jsx`

**Presentational Components** (UI Components):
- Receive data via props
- Focus on display/styling
- No state management (or minimal local state)
- Examples: `Button.jsx`, `Card.jsx`, `StatsCard.jsx`

### Composition Pattern

Build complex UIs by composing simple components:

```jsx
<Card>
  <StatsCard />
  <BloodStockTable />
  <Button />
</Card>
```

### Props Best Practices

✅ **Do**:
- Use descriptive prop names
- Provide default values
- Document required props
- Validate props with PropTypes or TypeScript

❌ **Don't**:
- Pass too many props (use composition)
- Mutate props
- Use generic names (e.g., `data`)

---

## 📝 Component Documentation Template

When creating new components, follow this pattern:

```jsx
/**
 * ComponentName - Brief description
 * 
 * Purpose: Detailed purpose explanation
 * Used In: Where this component is used
 * 
 * Props:
 * @param {type} propName - Description
 * 
 * Example:
 * <ComponentName prop1="value" prop2={123} />
 */
const ComponentName = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  );
};

export default ComponentName;
```

---

## 🚀 Next Steps

1. ✅ Component structure defined
2. ⏳ Build common components (Button, Card, Input, etc.)
3. ⏳ Create layout components (PublicLayout, DashboardLayout)
4. ⏳ Build dashboard components (StatsCard, BloodStockTable, etc.)
5. ⏳ Implement page UIs
6. ⏳ Add styling and animations
7. ⏳ Integrate with routing

---

**Component Architecture Complete!** 🎉
