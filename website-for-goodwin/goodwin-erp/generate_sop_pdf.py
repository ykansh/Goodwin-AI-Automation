#!/usr/bin/env python3
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, Image, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

LOGO_PATH = os.path.abspath("src/assets/logo.png")
OUTPUT_PDF = os.path.abspath("SOP_CREDIT_TERMS_AND_PAYMENT_TRACKING.pdf")
OUTPUT_PDF_DOCS = os.path.abspath("docs/SOP_CREDIT_TERMS_AND_PAYMENT_TRACKING.pdf")

# Palette
PRIMARY_GREEN = colors.HexColor("#00a631")
DARK_GREEN = colors.HexColor("#008a29")
LIGHT_GREEN_BG = colors.HexColor("#f0fdf4")
BORDER_GREEN = colors.HexColor("#bbf7d0")

TEXT_DARK = colors.HexColor("#1f2937")
TEXT_MUTED = colors.HexColor("#4b5563")
BG_HEADER = colors.HexColor("#1a1d1a")
BG_ROW_ALT = colors.HexColor("#f9fafb")
LINE_COLOR = colors.HexColor("#e5e7eb")

COLOR_RED = colors.HexColor("#dc2626")
COLOR_RED_BG = colors.HexColor("#fef2f2")
COLOR_AMBER = colors.HexColor("#d97706")
COLOR_AMBER_BG = colors.HexColor("#fffbeb")
COLOR_BLUE = colors.HexColor("#2563eb")
COLOR_BLUE_BG = colors.HexColor("#eff6ff")


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header (Pages 2+)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(TEXT_MUTED)
            self.drawString(54, 750, "GOODWIN BATTERY ERP  |  STANDARD OPERATING PROCEDURE (SOP)")
            self.setFont("Helvetica", 8)
            self.drawRightString(612 - 54, 750, "Credit Terms & Payment Tracking")
            self.setStrokeColor(LINE_COLOR)
            self.setLineWidth(0.75)
            self.line(54, 742, 612 - 54, 742)

        # Footer (All pages)
        self.setStrokeColor(LINE_COLOR)
        self.setLineWidth(0.75)
        self.line(54, 45, 612 - 54, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawString(54, 32, "Goodwin ERP OS • Operational Guideline • Confidential Internal Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_str)

        self.restoreState()


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom typography styles
    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=BG_HEADER,
        spaceAfter=4,
    )

    style_subtitle = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY_GREEN,
        spaceAfter=14,
    )

    style_h1 = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=BG_HEADER,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    style_h2 = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=DARK_GREEN,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    style_body = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
        spaceAfter=6,
    )

    style_body_bold = ParagraphStyle(
        'Body_Bold_Custom',
        parent=style_body,
        fontName='Helvetica-Bold',
    )

    style_bullet = ParagraphStyle(
        'Bullet_Custom',
        parent=style_body,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    style_th = ParagraphStyle(
        'TableHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
    )

    style_td = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK,
    )

    style_td_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK,
    )

    style_code = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#065f46"),
    )

    elements = []

    # ── HEADER BANNER ───────────────────────────────────────────────────────────
    logo_img = None
    if os.path.exists(LOGO_PATH):
        try:
            # Native logo is roughly 3:1 ratio
            logo_img = Image(LOGO_PATH, width=1.8 * inch, height=0.6 * inch)
        except Exception as e:
            print("Logo load error:", e)

    banner_data = [
        [
            logo_img if logo_img else Paragraph("<b>GOODWIN</b>", style_title),
            Paragraph(
                "<b>GOODWIN BATTERY ERP</b><br/>"
                "<font size=8 color='#4b5563'>Finance & Accounts Standard Operating Procedure</font>",
                ParagraphStyle('BText', parent=style_body, alignment=2)
            )
        ]
    ]
    t_banner = Table(banner_data, colWidths=[200, 304])
    t_banner.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_banner)
    elements.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY_GREEN, spaceAfter=12))

    # Document Header Title Card
    elements.append(Paragraph("Standard Operating Procedure (SOP)", style_title))
    elements.append(Paragraph("Customer Credit Terms, Pending Bills &amp; Payment Tracking System", style_subtitle))

    # Meta Table
    meta_data = [
        [
            Paragraph("<b>Module:</b> Finance &amp; Ledger → Credit Terms &amp; Payments", style_td),
            Paragraph("<b>Target Route:</b> <font color='#00a631'>/ledger/credit-terms</font>", style_td),
        ],
        [
            Paragraph("<b>Target Roles:</b> Accounts, Sales Managers, Sales Execs, Admin", style_td),
            Paragraph("<b>Status:</b> Production Ready &amp; Active", style_td),
        ]
    ]
    t_meta = Table(meta_data, colWidths=[252, 252])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_GREEN_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_GREEN),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_GREEN),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 10))

    # ── 1. OBJECTIVE ────────────────────────────────────────────────────────────
    elements.append(Paragraph("1. Objective &amp; Purpose", style_h1))
    elements.append(Paragraph(
        "This Standard Operating Procedure defines the day-to-day workflow for managing customer credit profiles, "
        "monitoring unpaid balances, reviewing pending sales bills, and tracking committed payment dates within "
        "the unified Goodwin ERP. Consolidating all credit and collection data eliminates fragmented offline "
        "spreadsheets and accelerates accounts receivable collection across dealer, distributor, retailer, and OEM accounts.",
        style_body
    ))

    # ── 2. ROLE ACCESS & RESPONSIBILITIES ─────────────────────────────────────────
    elements.append(Paragraph("2. Access Roles &amp; Responsibilities", style_h1))
    role_table_data = [
        [Paragraph("Role", style_th), Paragraph("Operational Scope &amp; Responsibilities", style_th)],
        [
            Paragraph("<b>Super Admin &amp; Admin</b>", style_td_bold),
            Paragraph("Full access to configure credit limits, modify default terms, run DB migrations, and export audit reports.", style_td)
        ],
        [
            Paragraph("<b>Accounts Team</b>", style_td_bold),
            Paragraph("Daily receivables management, recording payment receipts (Pay In), inspecting bill statements, syncing customer lists from Excel.", style_td)
        ],
        [
            Paragraph("<b>Sales Manager</b>", style_td_bold),
            Paragraph("Territory credit limit monitoring, approving payment term modifications, managing delinquent accounts.", style_td)
        ],
        [
            Paragraph("<b>Sales Executive</b>", style_td_bold),
            Paragraph("Logging customer payment commitments during dealer visits (+3d/+7d/+15d), sending WhatsApp reminders, verifying stock delivery.", style_td)
        ],
    ]
    t_roles = Table(role_table_data, colWidths=[130, 374])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_ROW_ALT]),
    ]))
    elements.append(t_roles)
    elements.append(Spacer(1, 10))

    # ── 3. THE 8 MANDATORY FIELDS ───────────────────────────────────────────────
    elements.append(Paragraph("3. The 8 Core Customer Credit &amp; Payment Fields", style_h1))
    elements.append(Paragraph(
        "Each customer record maintained in the ERP must reflect the following 8 standardized parameters:",
        style_body
    ))

    fields_data = [
        [Paragraph("#", style_th), Paragraph("Required Field", style_th), Paragraph("Description &amp; Operational Usage", style_th), Paragraph("Standard Options / Format", style_th)],
        [
            Paragraph("<b>1</b>", style_td_bold),
            Paragraph("<b>Customer Name &amp; UOI</b>", style_td_bold),
            Paragraph("Business commercial identity with auto-assigned Unified Customer ID, dealer category, contact number, and 1-click WhatsApp follow-up link.", style_td),
            Paragraph("GW-CUST-XXXX<br/>Dealer, Distributor, OEM", style_td)
        ],
        [
            Paragraph("<b>2</b>", style_td_bold),
            Paragraph("<b>Fixed Credit Terms &amp; Limit</b>", style_td_bold),
            Paragraph("Permitted payment duration before an invoice is marked overdue, plus maximum authorized exposure with a live utilization percentage indicator.", style_td),
            Paragraph("7, 10, 15, 30, 45, 60, 90 Days Net, Bill-to-Bill, Advance<br/>Limit: ₹ Value", style_td)
        ],
        [
            Paragraph("<b>3</b>", style_td_bold),
            Paragraph("<b>Unpaid / Outstanding Amount</b>", style_td_bold),
            Paragraph("Live total balance owed by the customer. Displayed in high-visibility bold red if balance &gt; 0, or emerald if fully cleared (₹0). Shows overlimit warning if exceeded.", style_td),
            Paragraph("₹ Currency Amount<br/>(Real-time computed)", style_td)
        ],
        [
            Paragraph("<b>4</b>", style_td_bold),
            Paragraph("<b>Pending Bills Details</b>", style_td_bold),
            Paragraph("Detailed breakdown of all unpaid invoices with bill dates, due dates, paid amounts, pending amounts, and overdue day counters.", style_td),
            Paragraph("Count badge (e.g. 3 Bills)<br/>Full modal statement", style_td)
        ],
        [
            Paragraph("<b>5</b>", style_td_bold),
            Paragraph("<b>Payment Commitment Date</b>", style_td_bold),
            Paragraph("Specific calendar date promised by customer to clear balance. Color-coded status: Overdue (Red), Due Today (Amber), Upcoming (Blue).", style_td),
            Paragraph("YYYY-MM-DD<br/>Quick shortcuts (+3d, +7d, +15d)", style_td)
        ],
        [
            Paragraph("<b>6</b>", style_td_bold),
            Paragraph("<b>Material Received Time</b>", style_td_bold),
            Paragraph("Typical time elapsed between physical goods delivery at dealer warehouse and invoice verification/payment approval.", style_td),
            Paragraph("Same Day, Within 24h, 48h, 3-5 Days, 7 Days, On Delivery", style_td)
        ],
        [
            Paragraph("<b>7</b>", style_td_bold),
            Paragraph("<b>Payment Cycle</b>", style_td_bold),
            Paragraph("Customer-wise payment pattern or rhythm for regular accounts settlement.", style_td),
            Paragraph("Weekly, 10 Days, 15/30 Days, Bill-to-Bill, Monthly", style_td)
        ],
        [
            Paragraph("<b>8</b>", style_td_bold),
            Paragraph("<b>Order Cycle</b>", style_td_bold),
            Paragraph("The routine frequency at which the customer places replenishment orders.", style_td),
            Paragraph("Daily, Twice a Week, Weekly, 10 Days, Monthly, As Needed", style_td)
        ],
    ]
    t_fields = Table(fields_data, colWidths=[20, 110, 234, 140])
    t_fields.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_ROW_ALT]),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
    ]))
    elements.append(t_fields)
    elements.append(Spacer(1, 12))

    # Page Break for Clean Sectioning
    elements.append(PageBreak())

    # ── 4. PRIMARY WORKFLOW TABS ────────────────────────────────────────────────
    elements.append(Paragraph("4. Primary Workflow Tabs &amp; Filtering", style_h1))
    elements.append(Paragraph(
        "Four dedicated view tabs are situated directly above the main table to prioritize daily operations:",
        style_body
    ))

    tab_data = [
        [Paragraph("Tab View", style_th), Paragraph("Focus &amp; Filter Criteria", style_th), Paragraph("Recommended Action", style_th)],
        [
            Paragraph("<b>All Credit Accounts</b>", style_td_bold),
            Paragraph("Master directory of all registered customers with credit terms, approved limits, and contact details.", style_td),
            Paragraph("General account management, maintaining credit limits and cycles.", style_td)
        ],
        [
            Paragraph("<b>Integrated Unpaid / Pending Customer List</b>", style_td_bold),
            Paragraph("Filters strictly to customers who have positive outstanding balances (&gt; ₹0) or active pending bills.", style_td),
            Paragraph("Daily receivables follow-up, reviewing overdue aging, recording receipts.", style_td)
        ],
        [
            Paragraph("<b>Payment Commitments Follow-up</b>", style_td_bold),
            Paragraph("Filters to accounts with active commitment dates, highlighting Overdue and Due Today commitments.", style_td),
            Paragraph("Morning collection calls, logging updated commitment dates.", style_td)
        ],
        [
            Paragraph("<b>Credit Limit Exceeded</b>", style_td_bold),
            Paragraph("Isolates customer accounts where total unpaid balance exceeds their authorized credit limit.", style_td),
            Paragraph("Risk control: hold dispatch until partial payment received or limit reviewed.", style_td)
        ],
    ]
    t_tabs = Table(tab_data, colWidths=[120, 224, 160])
    t_tabs.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_ROW_ALT]),
    ]))
    elements.append(t_tabs)
    elements.append(Spacer(1, 10))

    # ── 5. STEP-BY-STEP OPERATING PROCEDURES ─────────────────────────────────────
    elements.append(Paragraph("5. Step-by-Step Operating Procedures", style_h1))

    # SOP 5.1
    elements.append(Paragraph("SOP 5.1: Maintaining Customer Credit Terms &amp; Cycles", style_h2))
    elements.append(Paragraph("• <b>Step 1:</b> Navigate to <i>Finance &amp; Ledger → Credit Terms &amp; Payments</i>.", style_bullet))
    elements.append(Paragraph("• <b>Step 2:</b> Search for the customer by commercial name, UOI code, or contact number.", style_bullet))
    elements.append(Paragraph("• <b>Step 3:</b> In the customer's table row, click the <b>Terms</b> button under <i>Actions</i>.", style_bullet))
    elements.append(Paragraph("• <b>Step 4:</b> The <i>Maintain Credit Terms &amp; Payment Details</i> modal will appear. Review or update:", style_bullet))
    elements.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <b>Fixed Credit Terms:</b> Select approved duration (e.g. 30 Days Net, Bill-to-Bill).", style_bullet))
    elements.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <b>Credit Limit:</b> Enter revised exposure limit in ₹.", style_bullet))
    elements.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <b>Unpaid Outstanding:</b> Verify or adjust opening balance balance.", style_bullet))
    elements.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <b>Payment &amp; Order Cycles:</b> Adjust payment cadence (Weekly, Monthly) and ordering frequency.", style_bullet))
    elements.append(Paragraph("&nbsp;&nbsp;&nbsp;&nbsp;- <b>Material Received Time:</b> Update lead time between receipt and payment processing.", style_bullet))
    elements.append(Paragraph("• <b>Step 5:</b> Click <b>Save Credit Terms</b>. Changes sync immediately to both local cache and Supabase.", style_bullet))
    elements.append(Spacer(1, 6))

    # SOP 5.2
    elements.append(Paragraph("SOP 5.2: Setting Quick Payment Commitments (5-Second Workflow)", style_h2))
    elements.append(Paragraph("• When following up with a dealer on phone, setting a commitment date should be instant:", style_body))
    elements.append(Paragraph("• <b>Step 1:</b> Click directly on the commitment badge or the small <b>Calendar</b> icon in column 5.", style_bullet))
    elements.append(Paragraph("• <b>Step 2:</b> A quick popover opens in the row. Click <b>+3 Days</b>, <b>+7 Days</b>, or <b>+15 Days</b>, or pick a date.", style_bullet))
    elements.append(Paragraph("• <b>Step 3:</b> Click <b>Save Date</b>. A confirmation toast verifies the update instantly.", style_bullet))
    elements.append(Spacer(1, 6))

    # SOP 5.3
    elements.append(Paragraph("SOP 5.3: Inspecting Pending Bills &amp; Printing Statements", style_h2))
    elements.append(Paragraph("• <b>Step 1:</b> In the customer's row, click <b>X Pending Bills</b> in column 4.", style_bullet))
    elements.append(Paragraph("• <b>Step 2:</b> The <i>Pending Bills Statement</i> opens, listing every open invoice, invoice date, due date, bill amount, paid amount, pending balance, and overdue days.", style_bullet))
    elements.append(Paragraph("• <b>Step 3:</b> Click <b>Print Statement</b> to print a branded statement for dispatch or collection staff.", style_bullet))
    elements.append(Paragraph("• <b>Step 4:</b> Click <b>Pay In</b> directly next to an invoice to record a receipt settled against that specific bill.", style_bullet))
    elements.append(Spacer(1, 6))

    # SOP 5.4
    elements.append(Paragraph("SOP 5.4: Sending Instant WhatsApp Payment Reminders", style_h2))
    elements.append(Paragraph("• <b>Step 1:</b> In column 1 next to the customer's phone number, click the green <b>WhatsApp</b> icon.", style_bullet))
    elements.append(Paragraph("• <b>Step 2:</b> WhatsApp opens with a pre-formatted message:", style_bullet))
    elements.append(Paragraph("<i>\"Dear [Customer], this is a reminder regarding your Goodwin Battery account outstanding balance of Rs. [Amount]. Kindly confirm payment.\"</i>", style_bullet))
    elements.append(Paragraph("• <b>Step 3:</b> Tap send to dispatch the payment reminder directly.", style_bullet))
    elements.append(Spacer(1, 6))

    # SOP 5.5
    elements.append(Paragraph("SOP 5.5: Recording Payment In (Receipts)", style_h2))
    elements.append(Paragraph("• <b>Step 1:</b> Click the <b>Pay In</b> button on the customer row (or the top header button).", style_bullet))
    elements.append(Paragraph("• <b>Step 2:</b> The customer is pre-selected and their full outstanding balance is prefilled.", style_bullet))
    elements.append(Paragraph("• <b>Step 3:</b> Confirm Payment Date, Payment Mode (NEFT/RTGS, UPI, Cheque, Cash), and UTR/Reference.", style_bullet))
    elements.append(Paragraph("• <b>Step 4:</b> Click <b>Save Payment Receipt</b>. The balance clears across all ERP ledgers immediately.", style_bullet))
    elements.append(Spacer(1, 6))

    # SOP 5.6
    elements.append(Paragraph("SOP 5.6: Importing &amp; Syncing Offline Excel Lists", style_h2))
    elements.append(Paragraph("• <b>Step 1:</b> Click <b>Import / Sync Excel</b> in the top right banner.", style_bullet))
    elements.append(Paragraph("• <b>Step 2:</b> Download the sample template to inspect required column headers (Customer Name, Fixed Credit Terms, Credit Limit, Unpaid Outstanding, Commitment Date, Material Received Time, Payment Cycle, Order Cycle).", style_bullet))
    elements.append(Paragraph("• <b>Step 3:</b> Upload your existing Excel (.xlsx) file.", style_bullet))
    elements.append(Paragraph("• <b>Step 4:</b> The ERP automatically matches existing customers and updates their balances and terms, while creating new profiles for any new customers.", style_bullet))
    elements.append(Spacer(1, 10))

    # Page Break for Clean Sectioning
    elements.append(PageBreak())

    # ── 6. DAILY OPERATING TIMELINE ─────────────────────────────────────────────
    elements.append(Paragraph("6. Daily Recommended Workflow Timeline", style_h1))
    
    timeline_data = [
        [Paragraph("Time", style_th), Paragraph("Department", style_th), Paragraph("Operational Action Items", style_th)],
        [
            Paragraph("<b>09:30 AM</b>", style_td_bold),
            Paragraph("Accounts / Sales Lead", style_td),
            Paragraph("Open <b>Payment Commitments Follow-up</b> tab. Identify all <b>Overdue</b> and <b>Due Today</b> commitments. Assign collection call lists to field executives.", style_td)
        ],
        [
            Paragraph("<b>10:30 AM</b>", style_td_bold),
            Paragraph("Sales Executives", style_td),
            Paragraph("Contact dealers on commitment list. Use <b>Quick Commitment Picker</b> to log committed dates (+3d/+7d/+15d) or trigger WhatsApp reminders.", style_td)
        ],
        [
            Paragraph("<b>02:00 PM</b>", style_td_bold),
            Paragraph("Accounts Team", style_td),
            Paragraph("Reconcile daily bank statements (NEFT/RTGS/UPI). Click <b>Pay In</b> on customer rows to log receipts against outstanding balances.", style_td)
        ],
        [
            Paragraph("<b>04:30 PM</b>", style_td_bold),
            Paragraph("Sales &amp; Dispatch", style_td),
            Paragraph("Open <b>Credit Limit Exceeded</b> tab. Check orders scheduled for dispatch; withhold shipments exceeding limit until partial payment received.", style_td)
        ],
        [
            Paragraph("<b>06:00 PM</b>", style_td_bold),
            Paragraph("Finance Lead", style_td),
            Paragraph("Review <b>Integrated Unpaid / Pending Customer List</b>. Export Excel report to analyze daily receivables reduction against monthly targets.", style_td)
        ],
    ]
    t_timeline = Table(timeline_data, colWidths=[65, 115, 324])
    t_timeline.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_ROW_ALT]),
    ]))
    elements.append(t_timeline)
    elements.append(Spacer(1, 14))

    # ── 7. SUPABASE DATABASE SCHEMA ─────────────────────────────────────────────
    elements.append(Paragraph("7. Database Migration SQL Reference", style_h1))
    elements.append(Paragraph(
        "To ensure permanent column persistence in new Supabase environments, click <b>DB Migration</b> or execute the following query in the Supabase SQL Editor:",
        style_body
    ))

    sql_code = (
        "-- Supabase Migration: Customer Credit Terms & Payment Tracking\n"
        "ALTER TABLE customers\n"
        "  ADD COLUMN IF NOT EXISTS fixed_credit_terms VARCHAR(100) DEFAULT '30 Days Net',\n"
        "  ADD COLUMN IF NOT EXISTS payment_commitment_date DATE,\n"
        "  ADD COLUMN IF NOT EXISTS material_received_time VARCHAR(100) DEFAULT 'Within 3-5 Days',\n"
        "  ADD COLUMN IF NOT EXISTS payment_cycle VARCHAR(100) DEFAULT '15/30 Days',\n"
        "  ADD COLUMN IF NOT EXISTS order_cycle VARCHAR(100) DEFAULT 'Weekly',\n"
        "  ADD COLUMN IF NOT EXISTS credit_notes TEXT;\n\n"
        "ALTER TABLE sales_invoices\n"
        "  ADD COLUMN IF NOT EXISTS payment_commitment_date DATE,\n"
        "  ADD COLUMN IF NOT EXISTS due_date DATE,\n"
        "  ADD COLUMN IF NOT EXISTS material_received_time VARCHAR(100);"
    )
    t_sql = Table([[Paragraph(sql_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), style_code)]], colWidths=[504])
    t_sql.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    elements.append(t_sql)
    elements.append(Spacer(1, 14))

    # ── 8. OPERATIONAL CHECKLIST ────────────────────────────────────────────────
    elements.append(Paragraph("8. User Verification Checklist", style_h1))
    checklist_data = [
        [Paragraph("Status", style_th), Paragraph("Standard Verification Item", style_th)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("All customer credit accounts maintain fixed credit terms, credit limit, and payment cycles in one place.", style_td)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("No separate offline spreadsheets needed for unpaid or pending bill customer lists.", style_td)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("Daily overdue commitments tracked via the <i>Payment Commitments Follow-up</i> tab.", style_td)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("Quick commitment dates logged in seconds with the row inline date picker.", style_td)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("1-click WhatsApp reminders used for proactive dealer payment follow-up.", style_td)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("Payment receipts recorded using the pre-filled <b>Pay In</b> shortcut.", style_td)],
        [Paragraph("<font color='#00a631'><b>[OK]</b></font>", style_td_bold), Paragraph("Offline dealer lists synced anytime via the <b>Import / Sync Excel</b> feature.", style_td)],
    ]
    t_check = Table(checklist_data, colWidths=[50, 454])
    t_check.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BG_HEADER),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, LINE_COLOR),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_ROW_ALT]),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
    ]))
    elements.append(t_check)

    # Build Document
    doc.build(elements, canvasmaker=NumberedCanvas)

    # Also duplicate into docs/ folder
    import shutil
    shutil.copy(OUTPUT_PDF, OUTPUT_PDF_DOCS)

    print(f"Generated PDF: {OUTPUT_PDF}")
    print(f"Copied to: {OUTPUT_PDF_DOCS}")


if __name__ == "__main__":
    build_pdf()
