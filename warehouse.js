/* =========================================================
   WAREHOUSE MULTI-AGENT LOG BOOK SYSTEM
========================================================= */


/* =========================================================
   DATA STORAGE
========================================================= */

const STORAGE_KEYS = {

    workers: "warehouse_workers",

    attendance: "warehouse_attendance",

    wages: "warehouse_wages",

    activities: "warehouse_activities"

};


/* =========================================================
   LOAD DATA
========================================================= */

let workers =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.workers
        )
    ) || [];


let attendanceRecords =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.attendance
        )
    ) || [];


let wageRecords =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.wages
        )
    ) || [];


let agentActivities =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEYS.activities
        )
    ) || [];


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEYS.workers,
        JSON.stringify(workers)
    );

    localStorage.setItem(
        STORAGE_KEYS.attendance,
        JSON.stringify(attendanceRecords)
    );

    localStorage.setItem(
        STORAGE_KEYS.wages,
        JSON.stringify(wageRecords)
    );

    localStorage.setItem(
        STORAGE_KEYS.activities,
        JSON.stringify(agentActivities)
    );
}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getCurrentMonth() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}


function formatCurrency(amount) {

    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   AGENT ACTIVITY LOGGER
========================================================= */

function logAgentActivity(
    agent,
    message,
    type
) {

    const activity = {

        agent: agent,

        message: message,

        type: type,

        time:
            new Date().toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            )

    };


    agentActivities.unshift(
        activity
    );


    if (agentActivities.length > 50) {

        agentActivities =
            agentActivities.slice(
                0,
                50
            );
    }


    saveData();

    renderAgentActivity();
}


/* =========================================================
   AGENT 1
   ATTENDANCE AGENT
========================================================= */

class AttendanceAgent {

    constructor() {

        this.name =
            "Attendance Agent";
    }


    registerWorker(
        workerName,
        dailyWage
    ) {

        const nextNumber =
            workers.length + 1;

        const workerId =
            "W" +
            String(nextNumber)
                .padStart(3, "0");


        const worker = {

            id: workerId,

            name: workerName,

            dailyWage:
                Number(dailyWage)

        };


        workers.push(worker);

        saveData();


        logAgentActivity(

            this.name,

            `Registered ${workerName} with Worker ID ${workerId}.`,

            "attendance"

        );


        return worker;
    }


    saveAttendance(
        date,
        attendanceData
    ) {

        attendanceData.forEach(
            data => {

                const existingIndex =
                    attendanceRecords.findIndex(
                        record =>
                            record.workerId ===
                                data.workerId &&
                            record.date ===
                                date
                    );


                const record = {

                    workerId:
                        data.workerId,

                    date:
                        date,

                    morning:
                        data.morning,

                    afternoon:
                        data.afternoon

                };


                if (
                    existingIndex !== -1
                ) {

                    attendanceRecords[
                        existingIndex
                    ] = record;

                } else {

                    attendanceRecords.push(
                        record
                    );
                }

            }
        );


        saveData();


        logAgentActivity(

            this.name,

            `Recorded morning and afternoon attendance for ${attendanceData.length} workers on ${formatDate(date)}.`,

            "attendance"

        );


        return attendanceData;
    }


    getAttendance(
        workerId,
        date
    ) {

        return attendanceRecords.find(
            record =>
                record.workerId ===
                    workerId &&
                record.date ===
                    date
        );
    }


    getMonthlyAttendance(
        workerId,
        month
    ) {

        return attendanceRecords.filter(
            record =>
                record.workerId ===
                    workerId &&
                record.date.startsWith(
                    month
                )
        );
    }
}


/* =========================================================
   AGENT 2
   WAGE AGENT
========================================================= */

class WageAgent {

    constructor() {

        this.name =
            "Wage Agent";
    }


    calculateWage(
        worker,
        attendance
    ) {

        if (!attendance) {

            return {

                earned: 0,

                status: "Not Due",

                sessions: 0

            };
        }


        const morning =
            attendance.morning ===
            "present";


        const afternoon =
            attendance.afternoon ===
            "present";


        let sessions = 0;


        if (morning) {
            sessions++;
        }


        if (afternoon) {
            sessions++;
        }


        let earned = 0;


        if (sessions === 2) {

            earned =
                worker.dailyWage;

        } else if (sessions === 1) {

            earned =
                worker.dailyWage / 2;

        } else {

            earned = 0;
        }


        return {

            earned: earned,

            status:
                earned > 0
                    ? "Pending"
                    : "Not Due",

            sessions: sessions

        };
    }


    generateDailyWageRecord(
        worker,
        date
    ) {

        const attendanceAgent =
            new AttendanceAgent();


        const attendance =
            attendanceAgent.getAttendance(
                worker.id,
                date
            );


        const calculation =
            this.calculateWage(
                worker,
                attendance
            );


        const existing =
            wageRecords.find(
                record =>
                    record.workerId ===
                        worker.id &&
                    record.date ===
                        date
            );


        return {

            workerId:
                worker.id,

            date:
                date,

            earned:
                calculation.earned,

            paid:
                existing
                    ? existing.paid
                    : 0,

            sessions:
                calculation.sessions

        };
    }


    markPaid(
        workerId,
        date
    ) {

        const worker =
            workers.find(
                worker =>
                    worker.id ===
                    workerId
            );


        if (!worker) {
            return false;
        }


        const attendanceAgent =
            new AttendanceAgent();


        const attendance =
            attendanceAgent.getAttendance(
                workerId,
                date
            );


        const calculation =
            this.calculateWage(
                worker,
                attendance
            );


        if (calculation.earned <= 0) {

            alert(
                "Wages cannot be paid because the worker has no attendance."
            );

            return false;
        }


        const existingIndex =
            wageRecords.findIndex(
                record =>
                    record.workerId ===
                        workerId &&
                    record.date ===
                        date
            );


        const record = {

            workerId:
                workerId,

            date:
                date,

            earned:
                calculation.earned,

            paid:
                calculation.earned,

            sessions:
                calculation.sessions

        };


        if (existingIndex !== -1) {

            wageRecords[
                existingIndex
            ] = record;

        } else {

            wageRecords.push(
                record
            );
        }


        saveData();


        logAgentActivity(

            this.name,

            `Marked ${formatCurrency(calculation.earned)} as paid for ${worker.name} on ${formatDate(date)}.`,

            "wage"

        );


        return true;
    }


    getDailyWageRecord(
        workerId,
        date
    ) {

        return wageRecords.find(
            record =>
                record.workerId ===
                    workerId &&
                record.date ===
                    date
        );
    }


    getMonthlyWages(
        workerId,
        month
    ) {

        return wageRecords.filter(
            record =>
                record.workerId ===
                    workerId &&
                record.date.startsWith(
                    month
                )
        );
    }
}


/* =========================================================
   AGENT 3
   MONTHLY REPORT AGENT
========================================================= */

class MonthlyReportAgent {

    constructor() {

        this.name =
            "Monthly Report Agent";
    }


    generateWorkerReport(
        worker,
        month
    ) {

        const attendanceAgent =
            new AttendanceAgent();

        const wageAgent =
            new WageAgent();


        const attendance =
            attendanceAgent
                .getMonthlyAttendance(
                    worker.id,
                    month
                );


        const wages =
            wageAgent
                .getMonthlyWages(
                    worker.id,
                    month
                );


        let morningPresent = 0;

        let afternoonPresent = 0;

        let fullDays = 0;

        let halfDays = 0;

        let absentDays = 0;

        let totalEarned = 0;

        let totalPaid = 0;


        attendance.forEach(
            record => {

                const morning =
                    record.morning ===
                    "present";

                const afternoon =
                    record.afternoon ===
                    "present";


                if (morning) {
                    morningPresent++;
                }


                if (afternoon) {
                    afternoonPresent++;
                }


                if (
                    morning &&
                    afternoon
                ) {

                    fullDays++;

                } else if (
                    morning ||
                    afternoon
                ) {

                    halfDays++;

                } else {

                    absentDays++;
                }

            }
        );


        wages.forEach(
            wage => {

                totalEarned +=
                    Number(
                        wage.earned || 0
                    );

                totalPaid +=
                    Number(
                        wage.paid || 0
                    );
            }
        );


        const pending =
            Math.max(
                0,
                totalEarned -
                totalPaid
            );


        return {

            workerId:
                worker.id,

            workerName:
                worker.name,

            morningPresent:
                morningPresent,

            afternoonPresent:
                afternoonPresent,

            fullDays:
                fullDays,

            halfDays:
                halfDays,

            absentDays:
                absentDays,

            totalEarned:
                totalEarned,

            totalPaid:
                totalPaid,

            pending:
                pending

        };
    }


    generateMonthlyReport(
        month
    ) {

        const reports =
            workers.map(
                worker =>
                    this.generateWorkerReport(
                        worker,
                        month
                    )
            );


        logAgentActivity(

            this.name,

            `Generated monthly report for ${month} covering ${workers.length} workers.`,

            "report"

        );


        return reports;
    }
}


/* =========================================================
   MULTI-AGENT ORCHESTRATOR
========================================================= */

class WarehouseMultiAgentSystem {

    constructor() {

        this.attendanceAgent =
            new AttendanceAgent();

        this.wageAgent =
            new WageAgent();

        this.reportAgent =
            new MonthlyReportAgent();
    }


    registerWorker(
        name,
        dailyWage
    ) {

        return this.attendanceAgent
            .registerWorker(
                name,
                dailyWage
            );
    }


    processAttendance(
        date,
        attendanceData
    ) {

        /*
            Agent communication:

            Attendance Agent
                    ↓
            Attendance Records
                    ↓
               Wage Agent
        */


        const result =
            this.attendanceAgent
                .saveAttendance(
                    date,
                    attendanceData
                );


        /*
            Create/update wage records
            after attendance is recorded.
        */

        attendanceData.forEach(
            data => {

                const worker =
                    workers.find(
                        item =>
                            item.id ===
                            data.workerId
                    );


                if (!worker) {
                    return;
                }


                const wage =
                    this.wageAgent
                        .generateDailyWageRecord(
                            worker,
                            date
                        );


                const existingIndex =
                    wageRecords.findIndex(
                        record =>
                            record.workerId ===
                                worker.id &&
                            record.date ===
                                date
                    );


                if (
                    existingIndex ===
                    -1
                ) {

                    wageRecords.push(
                        wage
                    );

                } else {

                    /*
                        Preserve previous
                        payment status.
                    */

                    wage.paid =
                        wageRecords[
                            existingIndex
                        ].paid;

                    wageRecords[
                        existingIndex
                    ] = wage;
                }

            }
        );


        saveData();


        logAgentActivity(

            "System Orchestrator",

            "Attendance Agent completed. Attendance data was passed to Wage Agent for wage calculation.",

            "attendance"

        );


        return result;
    }


    generateMonthlyReport(
        month
    ) {

        /*
            Agent communication:

            Attendance Agent
                    +
            Wage Agent
                    ↓
            Monthly Report Agent
                    ↓
            Final Monthly Report
        */


        const report =
            this.reportAgent
                .generateMonthlyReport(
                    month
                );


        logAgentActivity(

            "System Orchestrator",

            "Attendance and wage data were passed to Monthly Report Agent.",

            "report"

        );


        return report;
    }
}


/* =========================================================
   CREATE MULTI-AGENT SYSTEM
========================================================= */

const warehouseSystem =
    new WarehouseMultiAgentSystem();


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeDates();

        renderWorkers();

        renderAttendanceTable();

        renderWageTable();

        renderDashboard();

        renderAgentActivity();

        setupEventListeners();

    }
);


/* =========================================================
   INITIALIZE DATES
========================================================= */

function initializeDates() {

    const today =
        getToday();


    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        );


    const wageDate =
        document.getElementById(
            "wageDate"
        );


    const reportMonth =
        document.getElementById(
            "reportMonth"
        );


    if (attendanceDate) {

        attendanceDate.value =
            today;
    }


    if (wageDate) {

        wageDate.value =
            today;
    }


    if (reportMonth) {

        reportMonth.value =
            getCurrentMonth();
    }


    const currentDate =
        document.getElementById(
            "currentDate"
        );


    if (currentDate) {

        currentDate.textContent =
            formatDate(today);
    }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupEventListeners() {

    const addWorkerButton =
        document.getElementById(
            "addWorkerButton"
        );


    if (addWorkerButton) {

        addWorkerButton.addEventListener(
            "click",
            addWorker
        );
    }


    const saveAttendanceButton =
        document.getElementById(
            "saveAttendanceButton"
        );


    if (saveAttendanceButton) {

        saveAttendanceButton.addEventListener(
            "click",
            saveAttendance
        );
    }


    const attendanceDate =
        document.getElementById(
            "attendanceDate"
        );


    if (attendanceDate) {

        attendanceDate.addEventListener(
            "change",
            function () {

                renderAttendanceTable();

                renderWageTable();

                renderDashboard();

            }
        );
    }


    const wageDate =
        document.getElementById(
            "wageDate"
        );


    if (wageDate) {

        wageDate.addEventListener(
            "change",
            function () {

                renderWageTable();

                renderDashboard();

            }
        );
    }


    const generateReportButton =
        document.getElementById(
            "generateReportButton"
        );


    if (generateReportButton) {

        generateReportButton.addEventListener(
            "click",
            generateMonthlyReport
        );
    }
}


/* =========================================================
   ADD WORKER
========================================================= */

function addWorker() {

    const nameInput =
        document.getElementById(
            "workerName"
        );


    const wageInput =
        document.getElementById(
            "dailyWage"
        );


    const name =
        nameInput.value.trim();


    const dailyWage =
        Number(
            wageInput.value
        );


    if (!name) {

        alert(
            "Please enter the worker's name."
        );

        return;
    }


    if (
        !dailyWage ||
        dailyWage < 0
    ) {

        alert(
            "Please enter a valid daily wage."
        );

        return;
    }


    const worker =
        warehouseSystem.registerWorker(
            name,
            dailyWage
        );


    nameInput.value = "";


    showMessage(

        "workerMessage",

        `${worker.name} was registered successfully with ID ${worker.id}.`

    );


    renderWorkers();

    renderAttendanceTable();

    renderWageTable();

    renderDashboard();
}


/* =========================================================
   RENDER WORKERS
========================================================= */

function renderWorkers() {

    const tbody =
        document.getElementById(
            "workerTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (workers.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-cell"
                >
                    No workers registered yet.
                </td>

            </tr>

        `;

        return;
    }


    workers.forEach(
        worker => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${worker.id}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(worker.name)}
                </td>

                <td>
                    ${formatCurrency(worker.dailyWage)}
                </td>

                <td>

                    <button
                        class="danger-button"
                        onclick="removeWorker('${worker.id}')"
                    >
                        Remove
                    </button>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );
}


/* =========================================================
   REMOVE WORKER
========================================================= */

function removeWorker(
    workerId
) {

    const worker =
        workers.find(
            item =>
                item.id ===
                workerId
        );


    if (!worker) {
        return;
    }


    const confirmation =
        confirm(
            `Remove ${worker.name} from the worker list?`
        );


    if (!confirmation) {
        return;
    }


    workers =
        workers.filter(
            item =>
                item.id !==
                workerId
        );


    attendanceRecords =
        attendanceRecords.filter(
            item =>
                item.workerId !==
                workerId
        );


    wageRecords =
        wageRecords.filter(
            item =>
                item.workerId !==
                workerId
        );


    saveData();


    logAgentActivity(

        "Attendance Agent",

        `Worker ${worker.name} (${worker.id}) was removed.`,

        "attendance"

    );


    renderWorkers();

    renderAttendanceTable();

    renderWageTable();

    renderDashboard();
}


/* =========================================================
   RENDER ATTENDANCE TABLE
========================================================= */

function renderAttendanceTable() {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    if (!tbody) {
        return;
    }


    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    tbody.innerHTML = "";


    if (workers.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-cell"
                >
                    Please register workers first.
                </td>

            </tr>

        `;

        return;
    }


    workers.forEach(
        worker => {

            const existing =
                warehouseSystem
                    .attendanceAgent
                    .getAttendance(
                        worker.id,
                        date
                    );


            const morning =
                existing
                    ? existing.morning
                    : "";


            const afternoon =
                existing
                    ? existing.afternoon
                    : "";


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${worker.id}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(worker.name)}
                </td>

                <td>

                    <div class="attendance-controls">

                        <button
                            class="attendance-button ${
                                morning === "present"
                                    ? "present"
                                    : ""
                            }"
                            data-worker="${worker.id}"
                            data-session="morning"
                            data-status="present"
                        >
                            Present
                        </button>

                        <button
                            class="attendance-button ${
                                morning === "absent"
                                    ? "absent"
                                    : ""
                            }"
                            data-worker="${worker.id}"
                            data-session="morning"
                            data-status="absent"
                        >
                            Absent
                        </button>

                    </div>

                </td>


                <td>

                    <div class="attendance-controls">

                        <button
                            class="attendance-button ${
                                afternoon === "present"
                                    ? "present"
                                    : ""
                            }"
                            data-worker="${worker.id}"
                            data-session="afternoon"
                            data-status="present"
                        >
                            Present
                        </button>

                        <button
                            class="attendance-button ${
                                afternoon === "absent"
                                    ? "absent"
                                    : ""
                            }"
                            data-worker="${worker.id}"
                            data-session="afternoon"
                            data-status="absent"
                        >
                            Absent
                        </button>

                    </div>

                </td>


                <td>

                    <strong>
                        ${formatCurrency(
                            calculatePreviewWage(
                                worker,
                                morning,
                                afternoon
                            )
                        )}
                    </strong>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );


    addAttendanceButtonListeners();
}


/* =========================================================
   ATTENDANCE BUTTON LISTENERS
========================================================= */

function addAttendanceButtonListeners() {

    const buttons =
        document.querySelectorAll(
            ".attendance-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const workerId =
                        this.dataset.worker;


                    const session =
                        this.dataset.session;


                    const status =
                        this.dataset.status;


                    this.parentElement
                        .querySelectorAll(
                            ".attendance-button"
                        )
                        .forEach(
                            btn => {

                                btn.classList.remove(
                                    "present"
                                );

                                btn.classList.remove(
                                    "absent"
                                );

                            }
                        );


                    this.classList.add(
                        status
                    );


                    this.dataset.selected =
                        "true";


                    updateAttendancePreview();

                }
            );

        }
    );
}


/* =========================================================
   GET CURRENT FORM ATTENDANCE
========================================================= */

function collectAttendanceFromTable() {

    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    const data = [];


    workers.forEach(
        worker => {

            const existing =
                warehouseSystem
                    .attendanceAgent
                    .getAttendance(
                        worker.id,
                        date
                    );


            let morning =
                existing
                    ? existing.morning
                    : "absent";


            let afternoon =
                existing
                    ? existing.afternoon
                    : "absent";


            const row =
                findAttendanceRow(
                    worker.id
                );


            if (row) {

                const morningSelected =
                    row.querySelector(
                        '[data-session="morning"].present'
                    );


                const morningAbsent =
                    row.querySelector(
                        '[data-session="morning"].absent'
                    );


                const afternoonSelected =
                    row.querySelector(
                        '[data-session="afternoon"].present'
                    );


                const afternoonAbsent =
                    row.querySelector(
                        '[data-session="afternoon"].absent'
                    );


                if (morningSelected) {

                    morning =
                        "present";

                } else if (
                    morningAbsent
                ) {

                    morning =
                        "absent";
                }


                if (afternoonSelected) {

                    afternoon =
                        "present";

                } else if (
                    afternoonAbsent
                ) {

                    afternoon =
                        "absent";
                }

            }


            data.push({

                workerId:
                    worker.id,

                morning:
                    morning,

                afternoon:
                    afternoon

            });

        }
    );


    return data;
}


/* =========================================================
   FIND ATTENDANCE ROW
========================================================= */

function findAttendanceRow(
    workerId
) {

    const rows =
        document.querySelectorAll(
            "#attendanceTableBody tr"
        );


    for (const row of rows) {

        const strong =
            row.querySelector(
                "strong"
            );


        if (
            strong &&
            strong.textContent.trim() ===
                workerId
        ) {

            return row;
        }
    }


    return null;
}


/* =========================================================
   SAVE ATTENDANCE
========================================================= */

function saveAttendance() {

    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    if (!date) {

        alert(
            "Please select a date."
        );

        return;
    }


    const attendanceData =
        collectAttendanceFromTable();


    warehouseSystem.processAttendance(
        date,
        attendanceData
    );


    showMessage(

        "attendanceMessage",

        `Attendance saved successfully for ${formatDate(date)}.`

    );


    renderAttendanceTable();

    renderWageTable();

    renderDashboard();
}


/* =========================================================
   CALCULATE PREVIEW WAGE
========================================================= */

function calculatePreviewWage(
    worker,
    morning,
    afternoon
) {

    let sessions = 0;


    if (morning === "present") {
        sessions++;
    }


    if (afternoon === "present") {
        sessions++;
    }


    if (sessions === 2) {

        return worker.dailyWage;

    } else if (sessions === 1) {

        return worker.dailyWage / 2;
    }


    return 0;
}


/* =========================================================
   UPDATE ATTENDANCE PREVIEW
========================================================= */

function updateAttendancePreview() {

    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    workers.forEach(
        worker => {

            const row =
                findAttendanceRow(
                    worker.id
                );


            if (!row) {
                return;
            }


            const morning =
                row.querySelector(
                    '[data-session="morning"].present'
                )
                    ? "present"
                    : row.querySelector(
                        '[data-session="morning"].absent'
                    )
                        ? "absent"
                        : "";


            const afternoon =
                row.querySelector(
                    '[data-session="afternoon"].present'
                )
                    ? "present"
                    : row.querySelector(
                        '[data-session="afternoon"].absent'
                    )
                        ? "absent"
                        : "";


            const wage =
                calculatePreviewWage(
                    worker,
                    morning,
                    afternoon
                );


            const cells =
                row.querySelectorAll(
                    "td"
                );


            if (cells[4]) {

                cells[4].innerHTML = `

                    <strong>
                        ${formatCurrency(wage)}
                    </strong>

                `;
            }

        }
    );
}


/* =========================================================
   RENDER WAGE TABLE
========================================================= */

function renderWageTable() {

    const tbody =
        document.getElementById(
            "wageTableBody"
        );


    if (!tbody) {
        return;
    }


    const date =
        document.getElementById(
            "wageDate"
        ).value;


    tbody.innerHTML = "";


    if (workers.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-cell"
                >
                    No workers available.
                </td>

            </tr>

        `;

        return;
    }


    workers.forEach(
        worker => {

            const attendance =
                warehouseSystem
                    .attendanceAgent
                    .getAttendance(
                        worker.id,
                        date
                    );


            const calculation =
                warehouseSystem
                    .wageAgent
                    .calculateWage(
                        worker,
                        attendance
                    );


            const wageRecord =
                warehouseSystem
                    .wageAgent
                    .getDailyWageRecord(
                        worker.id,
                        date
                    );


            const earned =
                calculation.earned;


            const paid =
                wageRecord
                    ? wageRecord.paid
                    : 0;


            const pending =
                Math.max(
                    0,
                    earned - paid
                );


            let status =
                "Not Due";


            let statusClass =
                "status-not-due";


            if (earned > 0) {

                if (pending <= 0) {

                    status =
                        "Paid";

                    statusClass =
                        "status-paid";

                } else {

                    status =
                        "Pending";

                    statusClass =
                        "status-pending";
                }
            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTML(worker.name)}
                    </strong>

                    <br>

                    <small>
                        ${worker.id}
                    </small>

                </td>


                <td>

                    ${
                        attendance &&
                        attendance.morning ===
                            "present"
                            ? "✅ Present"
                            : "❌ Absent"
                    }

                </td>


                <td>

                    ${
                        attendance &&
                        attendance.afternoon ===
                            "present"
                            ? "✅ Present"
                            : "❌ Absent"
                    }

                </td>


                <td>

                    <strong>
                        ${formatCurrency(earned)}
                    </strong>

                </td>


                <td>
                    ${formatCurrency(paid)}
                </td>


                <td>
                    ${formatCurrency(pending)}
                </td>


                <td>

                    <span
                        class="status-badge ${statusClass}"
                    >
                        ${status}
                    </span>

                </td>


                <td>

                    ${
                        earned > 0 && pending > 0

                        ? `

                            <button
                                class="paid-button"
                                onclick="
                                    markWagePaid(
                                        '${worker.id}',
                                        '${date}'
                                    )
                                "
                            >
                                Mark Paid
                            </button>

                        `

                        : earned <= 0

                            ? `

                                <span>
                                    No Wage
                                </span>

                            `

                            : `

                                <span
                                    class="status-badge status-paid"
                                >
                                    ✓ Paid
                                </span>

                            `
                    }

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );
}


/* =========================================================
   MARK WAGE PAID
========================================================= */

function markWagePaid(
    workerId,
    date
) {

    const result =
        warehouseSystem
            .wageAgent
            .markPaid(
                workerId,
                date
            );


    if (!result) {
        return;
    }


    renderWageTable();

    renderDashboard();
}


/* =========================================================
   RENDER MONTHLY REPORT
========================================================= */

function generateMonthlyReport() {

    const month =
        document.getElementById(
            "reportMonth"
        ).value;


    if (!month) {

        alert(
            "Please select a month."
        );

        return;
    }


    const reports =
        warehouseSystem
            .generateMonthlyReport(
                month
            );


    renderMonthlySummary(
        reports
    );


    renderReportTable(
        reports
    );
}


/* =========================================================
   MONTHLY SUMMARY
========================================================= */

function renderMonthlySummary(
    reports
) {

    const container =
        document.getElementById(
            "monthlySummary"
        );


    if (!container) {
        return;
    }


    let totalEarned = 0;

    let totalPaid = 0;

    let totalPending = 0;

    let totalAttendance = 0;


    reports.forEach(
        report => {

            totalEarned +=
                report.totalEarned;

            totalPaid +=
                report.totalPaid;

            totalPending +=
                report.pending;

            totalAttendance +=
                report.morningPresent +
                report.afternoonPresent;

        }
    );


    container.innerHTML = `

        <div class="summary-box">

            <span>
                Total Workers
            </span>

            <strong>
                ${reports.length}
            </strong>

        </div>


        <div class="summary-box">

            <span>
                Total Session Attendance
            </span>

            <strong>
                ${totalAttendance}
            </strong>

        </div>


        <div class="summary-box">

            <span>
                Total Earned
            </span>

            <strong>
                ${formatCurrency(totalEarned)}
            </strong>

        </div>


        <div class="summary-box">

            <span>
                Pending Wages
            </span>

            <strong>
                ${formatCurrency(totalPending)}
            </strong>

        </div>

    `;
}


/* =========================================================
   REPORT TABLE
========================================================= */

function renderReportTable(
    reports
) {

    const tbody =
        document.getElementById(
            "reportTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    if (reports.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="empty-cell"
                >
                    No workers registered.
                </td>

            </tr>

        `;

        return;
    }


    reports.forEach(
        report => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    <strong>
                        ${report.workerId}
                    </strong>
                </td>


                <td>
                    ${escapeHTML(
                        report.workerName
                    )}
                </td>


                <td>
                    ${report.morningPresent}
                </td>


                <td>
                    ${report.afternoonPresent}
                </td>


                <td>
                    ${report.fullDays}
                </td>


                <td>
                    ${report.halfDays}
                </td>


                <td>
                    ${report.absentDays}
                </td>


                <td>
                    <strong>
                        ${formatCurrency(
                            report.totalEarned
                        )}
                    </strong>
                </td>


                <td>
                    ${formatCurrency(
                        report.totalPaid
                    )}
                </td>


                <td>

                    <span
                        class="status-badge ${
                            report.pending > 0
                                ? "status-pending"
                                : "status-paid"
                        }"
                    >
                        ${formatCurrency(
                            report.pending
                        )}
                    </span>

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );
}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const totalWorkers =
        document.getElementById(
            "totalWorkers"
        );


    const morningPresent =
        document.getElementById(
            "morningPresent"
        );


    const afternoonPresent =
        document.getElementById(
            "afternoonPresent"
        );


    const todayWages =
        document.getElementById(
            "todayWages"
        );


    const date =
        document.getElementById(
            "attendanceDate"
        )
            ? document.getElementById(
                "attendanceDate"
            ).value
            : getToday();


    let morning = 0;

    let afternoon = 0;

    let wages = 0;


    workers.forEach(
        worker => {

            const attendance =
                warehouseSystem
                    .attendanceAgent
                    .getAttendance(
                        worker.id,
                        date
                    );


            if (
                attendance &&
                attendance.morning ===
                    "present"
            ) {

                morning++;
            }


            if (
                attendance &&
                attendance.afternoon ===
                    "present"
            ) {

                afternoon++;
            }


            const calculation =
                warehouseSystem
                    .wageAgent
                    .calculateWage(
                        worker,
                        attendance
                    );


            wages +=
                calculation.earned;

        }
    );


    if (totalWorkers) {

        totalWorkers.textContent =
            workers.length;
    }


    if (morningPresent) {

        morningPresent.textContent =
            morning;
    }


    if (afternoonPresent) {

        afternoonPresent.textContent =
            afternoon;
    }


    if (todayWages) {

        todayWages.textContent =
            formatCurrency(wages);
    }
}


/* =========================================================
   AGENT ACTIVITY UI
========================================================= */

function renderAgentActivity() {

    const container =
        document.getElementById(
            "agentActivity"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        agentActivities.length ===
        0
    ) {

        container.innerHTML = `

            <div class="activity-item">

                <div class="activity-message">

                    Waiting for agent activity...

                </div>

            </div>

        `;

        return;
    }


    agentActivities
        .slice(0, 15)
        .forEach(
            activity => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    `activity-item ${activity.type}`;


                item.innerHTML = `

                    <div class="activity-time">

                        ${activity.time}

                    </div>


                    <div>

                        <span
                            class="activity-agent"
                        >
                            🤖 ${escapeHTML(
                                activity.agent
                            )}
                        </span>


                        <span
                            class="activity-message"
                        >
                            ${escapeHTML(
                                activity.message
                            )}
                        </span>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    elementId,
    message
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );


    setTimeout(
        function () {

            element.classList.add(
                "hidden"
            );

        },
        4000
    );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}