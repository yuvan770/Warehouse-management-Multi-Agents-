 Warehouse Management System Using Multi-Agent Architecture

A web-based warehouse workforce management application that uses multiple software agents to manage worker registration, attendance tracking, wage calculation, and monthly report generation.

 Project Overview

The Warehouse Log Book Multi-Agent System is designed to simplify daily workforce administration in warehouses. It separates major responsibilities into specialized agents that coordinate through a central system orchestrator.

The application provides a centralized dashboard for monitoring workers, recording morning and afternoon attendance, calculating wages, tracking payments, and generating monthly workforce reports.

 Objectives
Automate worker registration and worker ID generation.
Maintain separate morning and afternoon attendance records.
Calculate daily wages automatically based on attendance.
Track earned wages, paid wages, and pending payments.
Generate monthly attendance and wage reports.
Demonstrate collaboration between specialized software agents.
Reduce manual recordkeeping and improve workforce management efficiency.
  Key Features
1. Worker Management
Register workers with their names and daily wages.
Automatically assign unique worker IDs, such as W001, W002, and W003.
Display worker information in a structured table.
Remove workers from the system.
2. Attendance Agent
Record attendance for individual workers.
Track morning and afternoon sessions separately.
Mark each session as present or absent.
Display estimated daily wages based on selected attendance.
Save attendance records against specific dates.
Update existing attendance records when they are saved again.
3. Wage Agent
Calculate wages automatically using attendance records.
Display earned, paid, and pending wages.
Track daily wage payment status.
Allow eligible wages to be marked as paid.
Preserve existing payment amounts when attendance records are updated.
Wage Calculation Rules
Attendance	Wage Earned
Present in both sessions	Full daily wage
Present in one session	Half daily wage
Absent in both sessions	₹0

Example: If a worker's daily wage is ₹600:

Morning and afternoon present: ₹600
Morning or afternoon present: ₹300
Absent in both sessions: ₹0
4. Monthly Report Agent
Generate monthly reports for registered workers.
Calculate morning and afternoon attendance totals.
Count full days, half days, and absent days.
Summarize total wages earned and paid.
Calculate pending wages.
Display monthly workforce statistics in a summary dashboard.
5. Interactive Dashboard

The dashboard displays:

Total registered workers.
Morning attendance count.
Afternoon attendance count.
Total wages earned for the selected attendance date.
6. Multi-Agent Communication

The system uses a central orchestrator to coordinate the agents and their operations.

The Attendance Agent manages worker information and attendance records.
The Wage Agent calculates earnings and manages wage payments.
The Monthly Report Agent combines attendance and wage data into monthly reports.
The System Orchestrator coordinates agent operations and records system-level activities.

An activity panel displays recent events, including worker registration, attendance processing, wage payments, and report generation.

7. Data Persistence

The application uses browser localStorage to save:

Worker records.
Attendance records.
Wage records.
Agent activity logs.

Stored records remain available when the application is reopened in the same browser, provided its local storage has not been cleared.

 System Architecture

The application follows a modular, multi-agent architecture.

                 Warehouse Dashboard
                         |
                         v
              System Orchestrator
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
    Attendance Agent  Wage Agent   Monthly Report Agent
          |              |              |
          v              v              v
     Worker and       Wage and       Monthly Summary
 Attendance Records Payment Records   and Reports
          |              |
          +------+-------+
                 |
                 v
           Browser Storage
             localStorage

Agent Responsibilities

Attendance Agent

Registers workers and assigns worker IDs.
Records morning and afternoon attendance.
Retrieves daily and monthly attendance information.

Wage Agent

Calculates daily wages from attendance.
Creates and updates daily wage records.
Tracks payments and outstanding balances.

Monthly Report Agent

Collects monthly attendance and wage records.
Calculates attendance statistics for each worker.
Generates monthly summaries of earnings, payments, and pending wages.

System Orchestrator

Coordinates agent operations.
Passes attendance information to the wage calculation process.
Initiates monthly report generation.
Logs system-level agent communication.
   Technologies Used
HTML5 — Structure of the web application.
CSS3 — Responsive layout, styling, dashboard cards, tables, and visual effects.
JavaScript (ES6+) — Application logic, agent classes, event handling, wage calculations, and report generation.
Browser localStorage — Client-side data persistence.
 Project Structure
warehouse-management-system/
│
├── index.html       # Application interface
├── warehouse.css    # Styling and responsive design
├── warehouse.js     # Agent logic and application functionality
└── README.md        # Project documentation


If your HTML file has a different name, update the structure above to match your repository.

 Getting Started
Prerequisites
A modern web browser, such as Google Chrome, Microsoft Edge, or Firefox.
A code editor such as Visual Studio Code (optional).
Installation

1. Clone the repository

git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git


Replace the URL with your actual GitHub repository URL.

2. Navigate to the project directory

cd YOUR-REPOSITORY


3. Verify the project files

Ensure that the HTML, CSS, and JavaScript files are in the expected locations and that the HTML file references warehouse.css and warehouse.js correctly.

4. Run the application

Open index.html in a modern web browser. Alternatively, use the Live Server extension in Visual Studio Code to serve the project locally.

No backend server or database installation is required for the current version.

📖 How to Use the Application
Register workers: Enter a worker's name and daily wage, then click Add Worker.
Record attendance: Select an attendance date and mark each worker present or absent for the morning and afternoon sessions.
Save attendance: Click Save Attendance to store the records and trigger wage calculations.
Review wages: Select the relevant wage date to view earned, paid, and pending amounts.
Record payment: Click Mark Paid for a worker with an eligible outstanding wage.
Generate a monthly report: Select a month and click Generate Monthly Report.
Monitor agent activity: Review the Agent Communication panel to see recent system operations.
 Example Scenario

Suppose a warehouse employs three workers with a daily wage of ₹600 each.

Worker	Morning	Afternoon	Earned Wage
W001	Present	Present	₹600
W002	Present	Absent	₹300
W003	Absent	Absent	₹0

The Wage Agent calculates the daily earnings based on the recorded attendance. The Monthly Report Agent subsequently uses the stored attendance and wage records to produce monthly summaries.

 Data Storage and Limitations

The current implementation stores data in the browser rather than in a centralized database.

Data is generally limited to the browser and device where it was entered.
Clearing browser storage may permanently remove saved records.
Data is not automatically synchronized between users or devices.
The application does not currently implement authentication, authorization, or server-side backups.
Worker removal also deletes that worker's associated attendance and wage records.

For production use, a backend API and centralized database would be recommended.

 Future Enhancements
 
Integrate a database such as MySQL, PostgreSQL, or MongoDB.
Add login, authentication, and role-based access control.
Synchronize records across multiple warehouse devices.
Add worker search, filtering, and editing.
Support partial wage payments and payment history.
Export monthly reports to PDF or Excel.
Add attendance notifications and automated reminders.
Introduce audit logs and data backup functionality.
Improve worker ID generation to avoid duplicates after deletions.
Add automated unit and integration tests.

Applications

Warehouse workforce administration.
Daily labor attendance management.
Wage and payment tracking.
Monthly payroll summaries.
Academic projects demonstrating multi-agent software design.

Contributing

Contributions and suggestions are welcome.

Fork the repository.
Create a feature branch.
Implement and test your changes.
Submit a pull request describing the changes.

License

This project is available for educational and demonstration purposes. Add a suitable license, such as the MIT License, if you intend to permit others to reuse and modify the code.

Author

Project: Warehouse Management System Using Multi-Agent Architecture

Developed using: HTML, CSS, and JavaScript

Purpose: Workforce attendance management, wage calculation, and monthly reporting using a modular multi-agent approach.
