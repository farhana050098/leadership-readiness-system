// ==========================================
// EMPLOYMENT.JS
// Leadership Readiness System
// ==========================================


// ==========================================
// DOM ELEMENTS
// ==========================================

const employmentForm = document.getElementById("employmentForm");
const logoutBtn = document.getElementById("logoutBtn");
const message = document.getElementById("message");

const positionTableBody =
    document.getElementById("positionTableBody");

const apcList =
    document.getElementById("apcList");

const lnptTableBody =
    document.getElementById("lnptTableBody");

const EVIDENCE_BUCKET = "evidence";


// ==========================================
// CHECK USER
// ==========================================

async function checkUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href = "index.html";

        return;
    }


    console.log(
        "Logged in user:",
        user.id
    );


    await loadEmployment(user.id);

    await loadPositionHistory(user.id);

    await loadApcHistory(user.id);

    await loadLnptHistory(user.id);
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// UPLOAD EVIDENCE
// ==========================================

async function uploadEvidence(
    file,
    userId,
    folder
) {

    if (!file) {

        return null;

    }


    // ==========================================
    // ALLOWED FILE TYPES
    // ==========================================

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Dokumen Sokongan mestilah dalam format PDF, JPG atau PNG."
        );

    }


    // ==========================================
    // MAXIMUM 10 MB
    // ==========================================

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        throw new Error(
            "Saiz Dokumen Sokongan tidak boleh melebihi 10MB."
        );

    }


    // ==========================================
    // CLEAN FILE NAME
    // ==========================================

    const safeName =
        file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    // ==========================================
    // FILE PATH
    // ==========================================

    const filePath =
        `${userId}/employment/${folder}/${Date.now()}_${safeName}`;


    console.log(
        "Uploading evidence:",
        filePath
    );


    // ==========================================
    // UPLOAD
    // ==========================================

    const {
        data,
        error
    } = await supabaseClient.storage
        .from(EVIDENCE_BUCKET)
        .upload(
            filePath,
            file,
            {
                cacheControl: "3600",
                upsert: false
            }
        );


    if (error) {

        console.error(
            "Upload Evidence Error:",
            error
        );


        throw new Error(
            "Gagal muat naik Dokumen Sokongan: " +
            error.message
        );

    }


    console.log(
        "Dokumen Sokongan telah dimuat naik:",
        data.path
    );


    return data.path;
}


// ==========================================
// GET SIGNED URL
// ==========================================

async function getEvidenceUrl(path) {

    if (!path) {

        return null;

    }


    // ==========================================
    // IF ALREADY URL
    // ==========================================

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        return path;

    }


    // ==========================================
    // CREATE SIGNED URL
    // ==========================================

    const {
        data,
        error
    } = await supabaseClient.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(
            path,
            3600
        );


    if (error) {

        console.error(
            "Signed URL Error:",
            error
        );

        return null;
    }


    return data?.signedUrl || null;
}


// ==========================================
// LOAD EMPLOYMENT
// ==========================================

async function loadEmployment(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("employment")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();


    if (error) {

        console.error(
            "Load Employment Error:",
            error
        );

        return;
    }


    if (!data) {

        return;
    }


    const salaryGrade =
        document.getElementById("salary_grade");

    const appointmentDate =
        document.getElementById("appointment_date");

    const retirementDate =
        document.getElementById("retirement_date");

    const originalDepartment =
        document.getElementById("original_department");

    const currentDepartment =
        document.getElementById("current_department");

    const originalPosition =
        document.getElementById("original_position");

    const currentPosition =
        document.getElementById("current_position");


    if (salaryGrade) {

        salaryGrade.value =
            data.salary_grade || "";

    }


    if (appointmentDate) {

        appointmentDate.value =
            data.appointment_date || "";

    }


    if (retirementDate) {

        retirementDate.value =
            data.retirement_date || "";

    }


    if (originalDepartment) {

        originalDepartment.value =
            data.original_department || "";

    }


    if (currentDepartment) {

        currentDepartment.value =
            data.current_department || "";

    }


    if (originalPosition) {

        originalPosition.value =
            data.original_position || "";

    }


    if (currentPosition) {

        currentPosition.value =
            data.current_position || "";

    }

}


// ==========================================
// ADD POSITION ROW
// ==========================================

function addPositionRow(data = {}) {

    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>

            <input
                type="text"
                class="position-name"
                placeholder="Jawatan"
                value="${escapeHtml(data.position_name || "")}"
            >

        </td>


        <td>

            <input
                type="date"
                class="position-from"
                value="${data.from_date || ""}"
            >

        </td>


        <td>

            <input
                type="date"
                class="position-to"
                value="${data.to_date || ""}"
            >

        </td>


        <td>

            <input
                type="text"
                class="position-duration"
                placeholder="Tempoh akan dikira"
                readonly
            >

        </td>


        <td>

            <button
                type="button"
                class="delete-btn"
            >
                Hapus
            </button>

        </td>

    `;


    positionTableBody.appendChild(row);

    const fromInput = row.querySelector(".position-from");
    const toInput = row.querySelector(".position-to");
    const durationInput = row.querySelector(".position-duration");

    function calculateDuration() {
        const fromValue = fromInput.value;
        const toValue = toInput.value;

        if (!fromValue || !toValue) {
            durationInput.value = "";
            return;
        }

        const fromDate = new Date(fromValue);
        const toDate = new Date(toValue);

        if (toDate < fromDate) {
            durationInput.value = "Tarikh tidak sah";
            return;
        }

        let years = toDate.getFullYear() - fromDate.getFullYear();
        let months = toDate.getMonth() - fromDate.getMonth();
        let days = toDate.getDate() - fromDate.getDate();

        if (days < 0) {
            months--;

            const previousMonth = new Date(
                toDate.getFullYear(),
                toDate.getMonth(),
                0
            );

            days += previousMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        let result = [];

        if (years > 0) {
            result.push(`${years} tahun`);
        }

        if (months > 0) {
            result.push(`${months} bulan`);
        }

        if (days > 0) {
            result.push(`${days} hari`);
        }

        if (result.length === 0) {
            result.push("0 hari");
        }

        durationInput.value = result.join(" ");
    }

    fromInput.addEventListener("change", calculateDuration);
    toInput.addEventListener("change", calculateDuration);

        calculateDuration();

    // ==========================================
    // DELETE
    // ==========================================

    row.querySelector(".delete-btn")
        .addEventListener(
            "click",
            function () {

                row.remove();

            }
        );

}


// ==========================================
// LOAD POSITION HISTORY
// ==========================================

async function loadPositionHistory(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("position_history")
        .select("*")
        .eq("user_id", userId)
        .order(
            "from_date",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Load Position History Error:",
            error
        );

        return;
    }


    positionTableBody.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        addPositionRow();

        return;

    }


    data.forEach(item => {

        addPositionRow(item);

    });

}


// ==========================================
// ADD APC ROW
// ==========================================

function addApcRow(data = {}) {

    const row =
        document.createElement("div");


    row.className =
        "apc-row";


    // ==========================================
    // EXISTING EVIDENCE PATH
    // ==========================================

    const evidencePath =
        data.evidence_url ||
        data.evidence_path ||
        "";


    row.dataset.evidencePath =
        evidencePath;


    // ==========================================
    // APC HTML
    // ==========================================

    row.innerHTML = `

        <!-- APC YEAR -->

        <div class="apc-input-group">

            <label>
                Tahun APC
            </label>


            <input
                type="number"
                class="apc-year"
                placeholder="Contoh: 2025"
                min="1900"
                max="2100"
                value="${data.apc_year || ""}"
            >

        </div>


        <!-- EVIDENCE -->

        <div class="apc-input-group">

            <label>
                Dokumen Sokongan
            </label>


            <input
                type="file"
                class="apc-file"
                accept=".pdf,.jpg,.jpeg,.png"
            >


            <!-- EXISTING EVIDENCE -->

            <div class="existing-evidence">

                ${
                    evidencePath
                        ? `
                            <button
                                type="button"
                                class="view-evidence-btn"
                            >
                                📄 Lihat Dokumen Sokongan
                            </button>
                          `
                        : ""
                }

            </div>


            <!-- STATUS -->

            <small class="evidence-status">

                ${
                    evidencePath
                        ? "Dokumen Sokongan telah disimpan."
                        : "PDF / JPG / PNG, maksimum 10MB."
                }

            </small>

        </div>


        <!-- DELETE -->

        <button
            type="button"
            class="delete-btn"
        >
            Hapus
        </button>

    `;


    apcList.appendChild(row);


    // ==========================================
    // VIEW APC EVIDENCE
    // ==========================================

    const viewButton =
        row.querySelector(
            ".view-evidence-btn"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            async function () {

                try {

                    viewButton.innerText =
                        "Opening...";


                    const path =
                        row.dataset.evidencePath;


                    console.log(
                        "APC Evidence Path:",
                        path
                    );


                    if (!path) {

                        throw new Error(
                            "Dokumen Sokongan tidak dijumpai."
                        );

                    }


                    const url =
                        await getEvidenceUrl(
                            path
                        );


                    console.log(
                        "APC Evidence URL:",
                        url
                    );


                    if (!url) {

                        throw new Error(
                            "Signed URL tidak dapat dijana."
                        );

                    }


                    window.open(
                        url,
                        "_blank"
                    );

                } catch (error) {

                    console.error(
                        "View APC Evidence Error:",
                        error
                    );


                    alert(
                        "Dokumen Sokongan tidak dapat dibuka."
                    );

                } finally {

                    viewButton.innerText =
                        "📄 Lihat Dokumen Sokongan";

                }

            }
        );

    }


    // ==========================================
    // FILE CHANGE
    // ==========================================

    const fileInput =
        row.querySelector(
            ".apc-file"
        );


    fileInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            const status =
                row.querySelector(
                    ".evidence-status"
                );


            status.innerText =
                `Fail dipilih: ${file.name}`;

        }
    );


    // ==========================================
    // DELETE
    // ==========================================

    const deleteButton =
        row.querySelector(
            ".delete-btn"
        );


    deleteButton.addEventListener(
        "click",
        function () {

            row.remove();

        }
    );

}


// ==========================================
// LOAD APC HISTORY
// ==========================================

async function loadApcHistory(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("apc_history")
        .select("*")
        .eq("user_id", userId)
        .order(
            "apc_year",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Load APC History Error:",
            error
        );

        return;

    }


    console.log(
        "APC History Data:",
        data
    );


    apcList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        addApcRow();

        return;

    }


    data.forEach(item => {

        console.log(
            "APC Record:",
            item
        );


        addApcRow(item);

    });

}


// ==========================================
// ADD LNPT ROW
// ==========================================

function addLnptRow(
    data = {},
    number = 1
) {

    const row =
        document.createElement("tr");


    // ==========================================
    // STORE EVIDENCE PATH
    // ==========================================

    row.dataset.evidencePath =
        data.evidence_url || "";


    // ==========================================
    // LNPT HTML
    // ==========================================

    row.innerHTML = `

        <td>
            ${number}
        </td>


        <td>

            <input
                type="number"
                class="lnpt-year"
                placeholder="Tahun"
                min="1900"
                max="2100"
                value="${data.lnpt_year || ""}"
            >

        </td>


        <td>

            <input
                type="number"
                class="lnpt-mark"
                placeholder="0 - 100"
                min="0"
                max="100"
                step="0.01"
                value="${data.markah ?? ""}"
            >

        </td>


        <td>

            <input
                type="file"
                class="lnpt-file"
                accept=".pdf,.jpg,.jpeg,.png"
            >


            <div class="existing-evidence">

                ${
                    data.evidence_url
                        ? `
                            <button
                                type="button"
                                class="view-evidence-btn"
                            >
                                📄 Lihat Dokumen Sokongan
                            </button>
                          `
                        : ""
                }

            </div>


            <small class="evidence-status">

                ${
                    data.evidence_url
                        ? "Dokumen Sokongan telah disimpan."
                        : "PDF / JPG / PNG, maksimum 10MB."
                }

            </small>

        </td>


        <td>

            <button
                type="button"
                class="delete-btn"
            >
                Hapus
            </button>

        </td>

    `;


    lnptTableBody.appendChild(row);


    // ==========================================
    // VIEW LNPT EVIDENCE
    // ==========================================

    const viewButton =
        row.querySelector(
            ".view-evidence-btn"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            async function () {

                try {

                    viewButton.innerText =
                        "Opening...";


                    const path =
                        row.dataset.evidencePath;


                    console.log(
                        "LNPT Evidence Path:",
                        path
                    );


                    const url =
                        await getEvidenceUrl(
                            path
                        );


                    if (!url) {

                        throw new Error(
                            "Dokumen Sokongan tidak dapat dibuka."
                        );

                    }


                    window.open(
                        url,
                        "_blank"
                    );

                } catch (error) {

                    console.error(
                        "View LNPT Evidence Error:",
                        error
                    );


                    alert(
                        "Dokumen Sokongan tidak dapat dibuka."
                    );

                } finally {

                    viewButton.innerText =
                        "📄 Lihat Dokumen Sokongan";

                }

            }
        );

    }


    // ==========================================
    // FILE CHANGE
    // ==========================================

    const fileInput =
        row.querySelector(
            ".lnpt-file"
        );


    fileInput.addEventListener(
        "change",
        function () {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            const status =
                row.querySelector(
                    ".evidence-status"
                );


            status.innerText =
                `Fail dipilih: ${file.name}`;

        }
    );


    // ==========================================
    // CLEAR
    // ==========================================

    const deleteButton =
        row.querySelector(
            ".delete-btn"
        );


    deleteButton.addEventListener(
        "click",
        function () {

            row.querySelector(
                ".lnpt-year"
            ).value = "";


            row.querySelector(
                ".lnpt-mark"
            ).value = "";


            row.querySelector(
                ".lnpt-file"
            ).value = "";


            row.dataset.evidencePath =
                "";


            const existingEvidence =
                row.querySelector(
                    ".existing-evidence"
                );


            if (existingEvidence) {

                existingEvidence.innerHTML =
                    "";

            }


            const status =
                row.querySelector(
                    ".evidence-status"
                );


            if (status) {

                status.innerText =
                    "PDF / JPG / PNG, maksimum 10MB.";

            }

        }
    );

}


// ==========================================
// LOAD LNPT HISTORY
// ==========================================

async function loadLnptHistory(userId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("lnpt_history")
        .select("*")
        .eq("user_id", userId)
        .order(
            "lnpt_year",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Load LNPT History Error:",
            error
        );

        return;

    }


    const records =
        data || [];


    lnptTableBody.innerHTML =
        "";


    // ==========================================
    // ALWAYS SHOW 3 ROWS
    // ==========================================

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        addLnptRow(
            records[i] || {},
            i + 1
        );

    }

}


// ==========================================
// ADD POSITION BUTTON
// ==========================================

const addPositionBtn =
    document.getElementById(
        "addPositionBtn"
    );


if (addPositionBtn) {

    addPositionBtn.addEventListener(
        "click",
        function () {

            addPositionRow();

        }
    );

}


// ==========================================
// ADD APC BUTTON
// ==========================================

const addApcBtn =
    document.getElementById(
        "addApcBtn"
    );


if (addApcBtn) {

    addApcBtn.addEventListener(
        "click",
        function () {

            addApcRow();

        }
    );

}


// ==========================================
// SAVE / UPDATE EMPLOYMENT
// ==========================================

employmentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        message.innerText =
            "Menyimpan...";


        message.style.color =
            "";


        try {

            // ======================================
            // GET USER
            // ======================================

            const {
                data: {
                    user
                },
                error: userError
            } =
                await supabaseClient.auth.getUser();


            if (
                userError ||
                !user
            ) {

                throw new Error(
                    "User tidak dijumpai. Sila login semula."
                );

            }


            const userId =
                user.id;


            // ======================================
            // EMPLOYMENT DATA
            // ======================================

            const employmentData = {

                user_id:
                    userId,

                salary_grade:
                    document.getElementById(
                        "salary_grade"
                    ).value,

                appointment_date:
                    document.getElementById(
                        "appointment_date"
                    ).value || null,

                retirement_date:
                    document.getElementById(
                        "retirement_date"
                    ).value || null,

                original_department:
                    document.getElementById(
                        "original_department"
                    ).value.trim(),

                current_department:
                    document.getElementById(
                        "current_department"
                    ).value.trim(),

                original_position:
                    document.getElementById(
                        "original_position"
                    ).value.trim(),

                current_position:
                    document.getElementById(
                        "current_position"
                    ).value.trim(),

                updated_at:
                    new Date().toISOString()

            };


            // ======================================
            // SAVE EMPLOYMENT
            // ======================================

            const {
                error: employmentError
            } =
                await supabaseClient
                    .from("employment")
                    .upsert(
                        employmentData,
                        {
                            onConflict:
                                "user_id"
                        }
                    );


            if (employmentError) {

                throw employmentError;

            }


            // ======================================
            // POSITION HISTORY
            // ======================================

            const positionRows =
                Array.from(
                    positionTableBody
                        .querySelectorAll("tr")
                );


            const positions = [];


            for (
                const row
                of positionRows
            ) {

                const position =
                    row.querySelector(
                        ".position-name"
                    ).value.trim();


                const fromDate =
                    row.querySelector(
                        ".position-from"
                    ).value;


                const toDate =
                    row.querySelector(
                        ".position-to"
                    ).value;


                const duration =
                    row.querySelector(
                        ".position-duration"
                    ).value.trim();


                if (
                    position ||
                    fromDate ||
                    toDate ||
                    duration
                ) {

                    positions.push({

                        user_id:
                            userId,

                        position_name:
                            position,

                        from_date:
                            fromDate || null,

                        to_date:
                            toDate || null,


                    });

                }

            }


            // ======================================
            // DELETE OLD POSITION RECORDS
            // ======================================

            const {
                error: deletePositionError
            } =
                await supabaseClient
                    .from("position_history")
                    .delete()
                    .eq(
                        "user_id",
                        userId
                    );


            if (deletePositionError) {

                throw deletePositionError;

            }


            // ======================================
            // INSERT POSITION RECORDS
            // ======================================

            if (
                positions.length > 0
            ) {

                const {
                    error:
                        insertPositionError
                } =
                    await supabaseClient
                        .from(
                            "position_history"
                        )
                        .insert(
                            positions
                        );


                if (
                    insertPositionError
                ) {

                    throw insertPositionError;

                }

            }


            // ======================================
            // APC HISTORY
            // ======================================

            const apcRows =
                Array.from(
                    apcList
                        .querySelectorAll(
                            ".apc-row"
                        )
                );


            const apcRecords = [];


            // ======================================
            // DELETE OLD APC RECORDS
            // ======================================

            const {
                error: deleteApcError
            } =
                await supabaseClient
                    .from("apc_history")
                    .delete()
                    .eq(
                        "user_id",
                        userId
                    );


            if (deleteApcError) {

                throw deleteApcError;

            }


            // ======================================
            // PROCESS APC
            // ======================================

            for (
                const row
                of apcRows
            ) {

                const year =
                    row.querySelector(
                        ".apc-year"
                    ).value;


                const file =
                    row.querySelector(
                        ".apc-file"
                    ).files[0];


                const existingEvidence =
                    row.dataset.evidencePath ||
                    "";


                // ==================================
                // SKIP EMPTY ROW
                // ==================================

                if (
                    !year &&
                    !file &&
                    !existingEvidence
                ) {

                    continue;

                }


                // ==================================
                // YEAR REQUIRED
                // ==================================

                if (!year) {

                    throw new Error(
                        "Sila masukkan tahun APC."
                    );

                }


                let evidencePath =
                    existingEvidence;


                // ==================================
                // UPLOAD NEW EVIDENCE
                // ==================================

                if (file) {

                    evidencePath =
                        await uploadEvidence(
                            file,
                            userId,
                            "apc"
                        );

                }


                // ==================================
                // EVIDENCE REQUIRED
                // ==================================

                if (!evidencePath) {

                    throw new Error(
                        `Sila masukkan Dokumen Sokongan APC bagi tahun ${year}.`
                    );

                }


                apcRecords.push({

                    user_id:
                        userId,

                    apc_year:
                        parseInt(year),

                    evidence_url:
                        evidencePath

                });

            }


            // ======================================
            // INSERT APC
            // ======================================

            if (
                apcRecords.length > 0
            ) {

                const {
                    error:
                        insertApcError
                } =
                    await supabaseClient
                        .from("apc_history")
                        .insert(
                            apcRecords
                        );


                if (
                    insertApcError
                ) {

                    throw insertApcError;

                }

            }


            // ======================================
            // LNPT HISTORY
            // ======================================

            const lnptRows =
                Array.from(
                    lnptTableBody
                        .querySelectorAll("tr")
                );


            const lnptRecords = [];


            for (
                const row
                of lnptRows
            ) {

                const year =
                    row.querySelector(
                        ".lnpt-year"
                    ).value;


                const mark =
                    row.querySelector(
                        ".lnpt-mark"
                    ).value;


                const file =
                    row.querySelector(
                        ".lnpt-file"
                    ).files[0];


                const existingEvidence =
                    row.dataset.evidencePath ||
                    "";


                // ==================================
                // EMPTY ROW
                // ==================================

                if (
                    !year &&
                    !mark &&
                    !file &&
                    !existingEvidence
                ) {

                    continue;

                }


                // ==================================
                // YEAR REQUIRED
                // ==================================

                if (!year) {

                    throw new Error(
                        "Sila masukkan tahun LNPT."
                    );

                }


                // ==================================
                // MARK REQUIRED
                // ==================================

                if (mark === "") {

                    throw new Error(
                        `Sila masukkan markah LNPT bagi tahun ${year}.`
                    );

                }


                const numericMark =
                    parseFloat(mark);


                // ==================================
                // VALIDATE MARK
                // ==================================

                if (
                    numericMark < 0 ||
                    numericMark > 100
                ) {

                    throw new Error(
                        `Markah LNPT bagi tahun ${year} mestilah antara 0 hingga 100.`
                    );

                }


                let evidencePath =
                    existingEvidence;


                // ==================================
                // UPLOAD NEW EVIDENCE
                // ==================================

                if (file) {

                    evidencePath =
                        await uploadEvidence(
                            file,
                            userId,
                            "lnpt"
                        );

                }


                // ==================================
                // EVIDENCE REQUIRED
                // ==================================

                if (!evidencePath) {

                    throw new Error(
                        `Sila masukkan Dokumen Sokongan LNPT bagi tahun ${year}.`
                    );

                }


                lnptRecords.push({

                    user_id:
                        userId,

                    lnpt_year:
                        parseInt(year),

                    markah:
                        numericMark,

                    evidence_url:
                        evidencePath,

                    updated_at:
                        new Date().toISOString()

                });

            }


            // ======================================
            // CHECK DUPLICATE LNPT YEARS
            // ======================================

            const lnptYears =
                lnptRecords.map(
                    record =>
                        record.lnpt_year
                );


            const uniqueYears =
                new Set(lnptYears);


            if (
                uniqueYears.size !==
                lnptYears.length
            ) {

                throw new Error(
                    "Tahun LNPT tidak boleh sama."
                );

            }


            // ======================================
            // DELETE OLD LNPT
            // ======================================

            const {
                error: deleteLnptError
            } =
                await supabaseClient
                    .from("lnpt_history")
                    .delete()
                    .eq(
                        "user_id",
                        userId
                    );


            if (deleteLnptError) {

                throw deleteLnptError;

            }


            // ======================================
            // INSERT NEW LNPT
            // ======================================

            if (
                lnptRecords.length > 0
            ) {

                const {
                    error:
                        insertLnptError
                } =
                    await supabaseClient
                        .from("lnpt_history")
                        .insert(
                            lnptRecords
                        );


                if (
                    insertLnptError
                ) {

                    throw insertLnptError;

                }

            }


            // ======================================
            // SUCCESS
            // ======================================

            message.innerText =
                "Maklumat Pekerjaan berjaya disimpan!";


            message.style.color =
                "green";


            console.log(
                "Employment data saved successfully."
            );

        } catch (error) {

            console.error(
                "Save Employment Error:",
                error
            );


            message.innerText =
                error.message ||
                "Gagal menyimpan data.";


            message.style.color =
                "red";

        }

    }
);


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            await supabaseClient.auth.signOut();


            window.location.href =
                "index.html";

        }
    );

}


// ==========================================
// START
// ==========================================

checkUser();