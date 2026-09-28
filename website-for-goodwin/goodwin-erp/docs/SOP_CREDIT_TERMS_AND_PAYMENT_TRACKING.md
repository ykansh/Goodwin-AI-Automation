# Standard Operating Procedure (SOP)
## Customer Credit Terms, Pending Bills & Payment Follow-Up Management

**System**: Goodwin Battery ERP  
**Module**: Finance & Ledger → Credit Terms & Payments  
**Route**: `/ledger/credit-terms`  
**Target Roles**: Accounts Team, Finance Managers, Sales Managers, Sales Executives, Administrators  
**Effective Date**: Current Version  

---

## 1. Objective & Overview

This Standard Operating Procedure (SOP) defines the operational workflow for tracking, maintaining, and following up on all customer credit profiles, unpaid balances, pending bills, and payment commitments within the centralized Goodwin ERP.

By consolidating credit limits, payment cycles, and unpaid customer records into a single dashboard, this module eliminates separate offline lists and accelerates receivables collection.

---

## 2. Access & User Roles

| Role | Permissions & Access Scope |
| :--- | :--- |
| **Super Admin / Admin** | Full access to view, edit credit limits, set terms, import/export data, run migrations, and record payments. |
| **Accounts** | View all balances, adjust credit terms, view pending bills, record payments in, import/export reports. |
| **Sales Manager** | Monitor territory receivables, adjust payment commitments, review customer order/payment cycles. |
| **Sales Executive** | View assigned dealer balances, update payment commitment dates during field visits, initiate WhatsApp follow-up. |

---

## 3. The 8 Mandatory Customer Fields Explained

Every customer credit account in the ERP maintains the following 8 standardized data points:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. Customer Name       │ Name, UOI Code, Category (Dealer/Distributor), Contact & Rep │
│ 2. Fixed Credit Terms  │ Payment duration allowed (e.g. 30 Days Net, Bill-to-Bill)    │
│    & Credit Limit      │ Maximum approved exposure in ₹ and utilization %               │
│ 3. Unpaid Outstanding  │ Current total balance owed by the customer                     │
│ 4. Pending Bills       │ Detailed breakdown of unpaid sales invoices                    │
│ 5. Payment Commitment  │ Committed date for settling payment (Overdue / Due Today)      │
│ 6. Material Recv Time  │ Usual time taken from material delivery to payment processing │
│ 7. Payment Cycle       │ Repetitive payment cadence (Weekly, 10 Days, Bill-to-Bill)     │
│ 8. Order Cycle         │ Typical customer purchasing frequency (Daily, Weekly, Monthly) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Detailed Field Definitions:

1. **Customer Name & UOI**:
   - Customer commercial name and unique system identifier (e.g. `GW-CUST-1001`).
   - Includes business type badge (`dealer`, `distributor`, `retailer`, `oem`).
   - Includes assigned sales executive for accountability.
   - Provides a 1-click **WhatsApp payment follow-up** button prefilled with the customer's outstanding balance.

2. **Fixed Credit Terms & Approved Credit Limit**:
   - **Fixed Credit Terms**: The agreed formal credit period allowed before an invoice becomes overdue:
     - `7 Days Net` / `10 Days Net` / `15 Days Net` / `30 Days Net` / `45 Days Net` / `60 Days Net` / `90 Days Net`
     - `Bill-to-Bill` (cleared upon delivery of the subsequent order)
     - `Advance / No Credit` (payment before dispatch)
   - **Credit Limit (₹)**: Maximum credit exposure approved by management.
   - **Limit Utilization %**: Visual progress bar indicating how much of the approved credit has been used. Alerts in red if exceeded.

3. **Unpaid / Total Outstanding Amount**:
   - The total balance currently unpaid by the customer across all open invoices and ledger entries.
   - Displays in bold **Red** if unpaid balance is greater than ₹0.
   - Displays in bold **Emerald** if the account is completely cleared (₹0 balance).
   - Shows an explicit warning pill if the balance exceeds the approved credit limit.

4. **Pending Bills**:
   - Shows the active count of unpaid invoices (e.g. `3 Pending Bills`).
   - Clicking the button opens the **Pending Bills Statement** modal with:
     - Bill / Invoice Number
     - Bill Date & Calculated Due Date
     - Total Bill Amount, Paid Amount & Pending Balance
     - Overdue Days counter with color-coded status badges (`On Time`, `Due Today`, `Overdue`)
     - Direct payment action button for that specific bill.

5. **Payment Commitment Date**:
   - The date explicitly promised by the dealer/customer to issue payment.
   - **Status Badges**:
     - 🔴 **Overdue (`Date`)**: The promised date has passed and the balance remains unpaid. Immediate escalation required.
     - 🟡 **Due Today (`Date`)**: Payment is expected today. Call or message the customer.
     - 🔵 **Upcoming (`Date`)**: Payment scheduled for a future date.
     - ⚪ **Not Committed**: No payment date has been promised yet. Requires follow-up.
   - Features an **Inline Quick Date Picker** directly in the table row.

6. **Material Received Time**:
   - The standard duration elapsed from physical receipt of goods at customer warehouse to verification and payment approval:
     - `Immediate / Same Day`
     - `Within 24 Hours`
     - `Within 48 Hours`
     - `Within 3-5 Days`
     - `Within 7 Days`
     - `10-15 Days`
     - `Upon Verification / QC Pass`
     - `On Delivery`

7. **Payment Cycle**:
   - The customer's routine repayment cycle pattern:
     - `Weekly` (settles every week, e.g., every Saturday)
     - `10 Days` / `15 Days` / `15/30 Days` / `30 Days` / `Monthly`
     - `Bill-to-Bill` (clears previous bill upon placing/receiving the next order)
     - `Advance on Dispatch`

8. **Order Cycle**:
   - The frequency at which the customer typically places inventory orders:
     - `Daily` / `Twice a Week` / `Weekly` / `10 Days` / `15 Days` / `Bi-weekly` / `Monthly` / `Quarterly` / `As Needed`

---

## 4. Module Navigation & Primary View Tabs

At the top of the **Credit Term List & Payment Report** screen, 4 primary workflow tabs allow teams to filter views according to daily priorities:

```
[ All Credit Accounts ]  [ Integrated Unpaid / Pending List ]  [ Payment Commitments Follow-up ]  [ Credit Limit Exceeded ]
```

### Tab 1: All Credit Accounts
* **Use Case**: Master credit directory.
* **Displays**: Every registered customer with their credit limit, fixed terms, cycles, and current balances.
* **Primary Users**: Management, Accounts onboarding new dealers.

### Tab 2: Integrated Unpaid / Pending Customer List
* **Use Case**: Eliminates separate offline pending lists.
* **Displays**: Only customers who currently have **pending bills or unpaid outstanding balances (`> ₹0`)**.
* **Key Indicators**: Outstanding balance, pending bills count, days overdue, and quick follow-up tools.
* **Primary Users**: Accounts receivables team, daily collection follow-up.

### Tab 3: Payment Commitments Follow-up
* **Use Case**: Daily morning collection calling list.
* **Displays**: Accounts that have an active payment commitment date, sorted to prioritize Overdue and Due Today commitments.
* **Primary Users**: Sales Executives, Recovery officers.

### Tab 4: Credit Limit Exceeded
* **Use Case**: Credit risk control.
* **Displays**: Accounts where total outstanding exceeds the approved credit limit.
* **Action**: Withhold further dispatches until partial payment is recorded or limit is officially revised.

---

## 5. Step-by-Step Standard Operating Procedures

### SOP 5.1: How to Maintain / Update Customer Credit Terms & Cycles

1. Navigate to **Finance & Ledger → Credit Terms & Payments**.
2. Locate the customer using the search bar (search by Name, UOI, or Contact).
3. In the customer row, click the **"Terms"** button in the **Actions** column.
4. The **"Maintain Credit Terms & Payment Details"** modal will open.
5. Update any of the following fields:
   - **Fixed Credit Terms**: Select the appropriate term duration (e.g. `30 Days Net`, `Bill-to-Bill`).
   - **Credit Limit (₹)**: Enter the approved maximum exposure.
   - **Unpaid / Outstanding Amount (₹)**: Verify or adjust opening balance if necessary.
   - **Payment Cycle**: Select the customer's typical payment pattern (e.g. `Weekly`, `15/30 Days`).
   - **Order Cycle**: Select order frequency (e.g. `Weekly`, `Monthly`).
   - **Material Received Time**: Select typical goods receipt processing time.
   - **Payment Commitment Date**: Select promised date (use `+3 Days`, `+7 Days`, `+15 Days` quick buttons).
   - **Notes / Remarks**: Enter any special agreements (e.g., *Approved for 45-day credit during festive season by Director*).
6. Click **"Save Credit Terms"**. The customer profile updates immediately across the ERP.

---

### SOP 5.2: How to Quick-Set a Payment Commitment Date (In 5 Seconds)

During phone follow-up calls with a dealer, you do not need to open the full terms modal:

1. Locate the customer in the table.
2. In the **5. Payment Commitment Date** column, click directly on the commitment badge or the small **Calendar** icon.
3. A quick popover menu appears right in the row.
4. Either:
   - Click one of the quick shortcut buttons: **`+3 Days`**, **`+7 Days`**, or **`+15 Days`**.
   - Or pick an exact date using the calendar input and click **"Save Date"**.
   - If a customer cancels a commitment, click **"Clear Date"**.
5. A confirmation notification (`Payment commitment set to YYYY-MM-DD`) confirms the save.

---

### SOP 5.3: How to Inspect Customer Pending Bills

1. In the customer row, click the **"X Pending Bills"** button under **4. Pending Bills** (or click **"Bills"** under Actions).
2. The **Pending Bills Statement** opens, displaying:
   - Total outstanding vs. Overdue amount.
   - Fixed credit term and payment cycle summary.
   - Full list of unpaid invoices with Invoice #, Date, Due Date, Bill Amount, Paid Amount, and Overdue Days.
3. To view or print a customer statement for physical delivery or email, click **"Print Statement"**.
4. To record an immediate receipt for a specific pending bill, click the **"Record Payment"** button next to that bill row.

---

### SOP 5.4: How to Send an Instant WhatsApp Payment Reminder

1. In the **1. Customer Name** column, locate the customer's phone number.
2. Click the green **WhatsApp** icon next to the phone number.
3. The ERP opens WhatsApp with a pre-composed professional reminder:
   > *"Dear [Customer Name], this is a reminder regarding your Goodwin Battery account outstanding balance of Rs. [Amount]. Kindly confirm payment."*
4. Press send to deliver the reminder directly to the dealer's registered mobile number.

---

### SOP 5.5: How to Record a Payment In (Receipt)

When a customer issues payment via NEFT, RTGS, UPI, Cheque, or Cash:

1. Click the **"Pay In"** button on the customer's row in the table (or click the green **"+ Record Payment In"** button in the top banner).
2. The **Record Customer Payment (Payment In)** modal opens with:
   - The customer pre-selected.
   - The total outstanding balance pre-filled as the suggested payment amount.
3. Confirm the **Payment Date**, **Payment Mode** (Bank Transfer, UPI, Cash, Cheque), **Transaction Reference / UTR Number**, and **Amount Received**.
4. Click **"Save Payment Receipt"**.
5. The customer's outstanding balance, pending bills, and ledger statements are updated instantly.

---

### SOP 5.6: How to Import / Sync Existing Excel Customer Lists

If you have an existing offline spreadsheet of customers with credit terms, pending balances, and commitment dates:

1. Click the **"Import / Sync Excel"** button in the top right header.
2. In the import window, click **"Download Sample Template"** to review the column layout:
   - `Customer Name` (Required)
   - `Contact` (Phone number)
   - `Fixed Credit Terms` (e.g. `30 Days Net`)
   - `Credit Limit` (e.g. `500000`)
   - `Unpaid / Outstanding Amount` (e.g. `145000`)
   - `Payment Commitment Date (YYYY-MM-DD)` (e.g. `2026-10-15`)
   - `Material Received Time` (e.g. `Within 3-5 Days`)
   - `Payment Cycle` (e.g. `15/30 Days`)
   - `Order Cycle` (e.g. `Weekly`)
   - `Notes / Remarks`
3. Drag and drop your `.xlsx` or `.csv` file into the upload zone.
4. The system validates the rows. Click **"Import Records"**.
5. **Smart Sync Behavior**:
   - If a customer exists in the system, their credit terms, credit limit, commitment date, and outstanding balance are updated.
   - If a customer does not exist, a new profile with an auto-assigned `GW-CUST-XXXX` UOI is created automatically.

---

### SOP 5.7: How to Export Credit Reports to Excel

1. Apply any desired filters (e.g., switch to **Integrated Unpaid / Pending Customer List** or filter by a specific salesperson/cycle).
2. Click **"Export"** in the top action bar.
3. The ERP downloads an Excel file named `Goodwin_Credit_Terms_Payment_Report.xlsx` containing:
   - Customer Name & UOI
   - Contact & Salesperson
   - Fixed Credit Terms & Credit Limit
   - Total Outstanding Balance
   - Pending Bills Count
   - Payment Commitment Date
   - Material Received Time
   - Payment Cycle & Order Cycle

---

## 6. Daily Recommended Workflow for Accounts & Sales Teams

| Time | Responsible | Action Items |
| :--- | :--- | :--- |
| **09:30 AM** | Accounts / Sales Manager | Open **Payment Commitments Follow-up** tab. Review all accounts marked **Overdue** or **Due Today**. Assign calling list to sales reps. |
| **10:30 AM** | Sales Executives | Contact dealers on the commitment list. Use the **Quick Date Picker** to log new commitment dates or tap the **WhatsApp** icon to send reminders. |
| **02:00 PM** | Accounts Team | Review bank statements. Click **"Pay In"** next to customer rows to record all incoming RTGS/NEFT receipts. |
| **04:30 PM** | Sales & Warehouse | Open **Credit Limit Exceeded** tab. Review dispatches pending for over-limit accounts before goods leave the factory. |
| **06:00 PM** | Accounts Lead | Open **Integrated Unpaid / Pending Customer List**. Export the daily report and review total receivables reduction against daily targets. |

---

## 7. Database Migration Script Reference

If permanent SQL table columns are needed in a new Supabase environment, click the **"DB Migration"** button in the top action bar or run this query in your Supabase SQL Editor:

```sql
-- Migration Script: Credit Terms & Payment Tracking Columns
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS fixed_credit_terms VARCHAR(100) DEFAULT '30 Days Net',
ADD COLUMN IF NOT EXISTS payment_commitment_date DATE,
ADD COLUMN IF NOT EXISTS material_received_time VARCHAR(100) DEFAULT 'Within 3-5 Days',
ADD COLUMN IF NOT EXISTS payment_cycle VARCHAR(100) DEFAULT '15/30 Days',
ADD COLUMN IF NOT EXISTS order_cycle VARCHAR(100) DEFAULT 'Weekly',
ADD COLUMN IF NOT EXISTS credit_notes TEXT;

ALTER TABLE sales_invoices
ADD COLUMN IF NOT EXISTS payment_commitment_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS material_received_time VARCHAR(100);
```

---

## 8. Summary Checklist for Users

- [ ] All customer credit terms and cycles maintained in one place (**Credit Terms & Payments**).
- [ ] No separate offline spreadsheets required for pending bills or unpaid accounts.
- [ ] Overdue commitments checked daily using the **Payment Commitments Follow-up** tab.
- [ ] Payments recorded with pre-filled amounts via the **Pay In** button.
- [ ] Spreadsheets synced anytime using the **Import / Sync Excel** feature.
