# Standard Operating Procedure (SOP)
## Goodwin Batteries Automated Serial & Warranty Registration System

**Date:** September 2026
**Target Audience:** Factory Management, Admins, and Authorized Dealers
**Purpose:** This document outlines the standard operating procedures for generating intelligent battery serial numbers at the factory level and the subsequent warranty registration process by dealers at the point of sale.

---

## 1. Introduction

The Goodwin Batteries Warranty System is an end-to-end automated platform that ensures complete traceability of every battery from the factory floor to the end customer. It replaces manual warranty cards with secure, digital warranty certificates. 

The system operates in three distinct phases:
1. **Factory Generation:** Admins generate and print intelligent serial number stickers.
2. **Dealer Registration:** Dealers scan the sticker upon sale to register the warranty instantly.
3. **Customer Verification:** Customers can check their warranty status anytime via the website.

---

## 2. Phase 1: Factory Operations (Admin)

At the factory, before dispatching a batch of batteries, the administrator must generate unique serial numbers for each unit.

### 2.1 Accessing the Generator
1. Log in to the Goodwin Batteries Admin Portal (`goodwinbatteries.in/admin`).
2. Navigate to **Factory Stickers** (or `/admin/serial-generator`).

### 2.2 Generating a Batch
1. **Select Battery Model:** Choose the product from the dropdown (e.g., `GOLD SERIES 12V 17AH`).
2. **Select Warranty Plan:** Choose the warranty duration to encode into the sticker (e.g., `48 Months (24F + 24P)`). *Note: You can select any warranty duration for any product.*
3. **Batch Size:** Enter the quantity of stickers you wish to generate (e.g., `500`).
4. **Manufacturing Date:** Select the date of manufacturing. You can backdate or forward-date this if necessary.
5. **Generate:** Click "Generate & Download CSV".

### 2.3 Intelligent Sequence Tracking
The system automatically remembers the last generated sequence number for every specific combination of Model + Warranty + Date. 
*Example:* If you generate 500 stickers for the `12V 17AH` model today, it creates sequence `00001` through `00500`. If you return later today and generate 200 more for the exact same model and warranty, it will automatically continue from `00501` to `00700`.

### 2.4 Serial Number Format Explained
The generated serial number looks like this:
**`GW-GOLD-SERIES-12V-17AH-48M-240924-00001`**
* `GW`: Goodwin Batteries Prefix
* `GOLD-SERIES-12V-17AH`: Full Product Model Name
* `48M`: Warranty Duration Code
* `240924`: Date Code (DDMMYY)
* `00001`: Unique Sequence Number

### 2.5 Printing
The downloaded CSV contains the serial numbers and a `QR Payload`. Provide this CSV to your printing software/hardware to print the physical stickers to be affixed to the batteries.

---

## 3. Phase 2: Dealer Operations (Point of Sale Registration)

When a dealer sells a battery to a customer, they must register the warranty online. The warranty starts from the date of registration, not the date of manufacturing.

### 3.1 Scanning the Battery
1. The dealer uses any smartphone to scan the QR code on the battery sticker.
2. The scan automatically opens the Goodwin Batteries Registration Portal with the exact battery model and serial number pre-filled.

### 3.2 Registration Form
If the dealer navigates manually to the Dealer Portal (`goodwinbatteries.in/admin/warranties`), they will follow these steps:
1. Enter the **Serial Number** (e.g., `GW-GOLD-SERIES-12V-17AH-48M-240924-00001`) and click **Verify**.
2. The system confirms the battery is genuine and displays its manufacturing date and encoded warranty duration.
3. The dealer fills out the customer details:
   * Customer Name & Mobile Number
   * Email Address
   * Purchase Date
   * Invoice Number & Dealer Name
   * Vehicle Registration Number (Optional but recommended)
4. **Warranty Plan Override:** The system will automatically select the perfect warranty plan based on the sticker. However, the dealer has access to an "All Warranty Plans" dropdown if a manual override is authorized.
5. Click **Register Warranty**.

### 3.3 Digital Certificate
Upon successful registration, a unique **Warranty ID** (e.g., `GW-WTY-2026-123456`) is generated. The system calculates the exact expiry date. The dealer should provide this Warranty ID or the digital invoice to the customer.

---

## 4. Phase 3: Customer Operations

Customers have full transparency over their warranty status without needing to preserve a physical paper card.

### 4.1 Checking Status
1. The customer visits `goodwinbatteries.in/support/warranty-status`.
2. They enter either their **Mobile Number** OR their **Warranty ID / Serial Number**.
3. The portal instantly displays:
   * Registration Status (Active / Expired)
   * Warranty Start Date
   * Warranty Expiry Date
   * Dealer Information

---

## 5. Example Walkthrough

**Scenario:** The factory produces 100 units of the `TZ4LB` model with a 48-month warranty on September 24, 2026.
1. **Admin** logs in, selects `GW-TZ4LB`, `48 Months`, sets quantity to `100`, and downloads the CSV.
2. **Admin** prints the CSV. Stickers are placed on the 100 batteries.
3. On October 15, 2026, **Dealer Rahul** sells one of these batteries to **Customer Amit**.
4. **Dealer Rahul** scans the sticker with his phone. The registration form opens.
5. **Dealer Rahul** enters Amit's name, phone number, and today's date (Oct 15). He clicks Submit.
6. The system calculates the expiry date as October 15, 2030 (48 months later) and issues Warranty ID `GW-WTY-2026-885412`.
7. **Customer Amit** later visits the website, enters his phone number, and sees his active warranty valid until Oct 15, 2030.

---
*End of Document*
