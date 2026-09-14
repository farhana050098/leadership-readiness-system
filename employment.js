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

const positionTableBody = document.getElementById("positionTableBody");
const apcList = document.getElementById("apcList");
const lnptTableBody = document.getElementById("lnptTableBody");

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

    console.log("Logged in user:", user.id);

    await loadEmployment(user.id);
    await loadPositionHistory(user.id);
    await loadApcHistory(user.id);
    await loadLnptHistory(user.id);
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
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

async function uploadEvidence(file, userId, folder) {

    if (!file) {
        return null;
    }

    // Allowed file types
    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Evidence mestilah dalam format PDF, JPG atau PNG."
        );
    }

    // Maximum 10 MB
    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {

        throw new Error(
            "Saiz evidence tidak boleh melebihi 10MB."
        );
    }

    // Clean file name
    const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    const filePath =
        `${userId}/employment/${folder}/${Date.now()}_${safeName}`;

    const {
        data,
        error
    } = await supabaseClient.storage
        .from(EVIDENCE_BUCKET)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false
        });

    if (error) {

        console.error("Upload Evidence Error:", error);

        throw new Error(
            "Gagal upload evidence: " + error.message
        );
    }

    return data.path;
}


// ==========================================
// GET SIGNED URL
// ==========================================

async function getEvidenceUrl(path) {

    if (!path) {
        return null;
    }

    // If already URL
    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {
        return path;
    }

    const {
        data,
        error
    } = await supabaseClient.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(path, 3600);

    if (error) {

        console.error("Signed URL Error:", error);

        return null;
    }

    return data.signedUrl;
}


// ==========================================
// ADD POSITION ROW
// ==========================================

function addPositionRow(data = {}) {

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <input
                type="text"
                class="position-name"
                placeholder="Contoh: Pensyarah"
                value="${escapeHtml(data.position || "")}"
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
                placeholder="Contoh: 2 tahun"
                value="${escapeHtml(data.duration || "")}"
            >
        </td>

        <td>
            <button
                type="button"
                class="delete-btn"
            >
                Delete
            </button>
        </td>
    `;

    positionTableBody.appendChild(row);

    // DELETE
    row.querySelector(".delete-btn")
        .addEventListener("click", function () {

            row.remove();
        });
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

        console.error("Load Employment Error:", error);
        return;
    }

    if (!data) {
        return;
    }

    document.getElementById("salary_grade").value =
        data.salary_grade || "";

    document.getElementById("appointment_date").value =
        data.appointment_date || "";

    document.getElementById("retirement_date").value =
        data.retirement_date || "";

    document.getElementById("original_department").value =
        data.original_department || "";

    document.getElementById("current_department").value =
        data.current_department || "";

    document.getElementById("original_position").value =
        data.original_position || "";

    document.getElementById("current_position").value =
        data.current_position || "";
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
        .order("from_date", {
            ascending: true
        });

    if (error) {

        console.error(
            "Load Position History Error:",
            error
        );

        return;
    }

    positionTableBody.innerHTML = "";

    if (!data || data.length === 0) {

        addPositionRow();

        return;
    }

    data.forEach(item => {

        addPositionRow({
            position: item.position,
            from_date: item.from_date,
            to_date: item.to_date,
            duration: item.duration
        });

    });
}


// ==========================================
// ADD APC ROW
// ==========================================

function addApcRow(data = {}) {

    const row = document.createElement("div");

    row.className = "apc-row";

    row.dataset.evidencePath =
        data.evidence_url || "";

    row.innerHTML = `

        <div class="apc-input-group">

            <label>Tahun APC</label>

            <input
                type="number"
                class="apc-year"
                placeholder="Contoh: 2025"
                min="1900"
                max="2100"
                value="${data.apc_year || ""}"
            >

        </div>


        <div class="apc-input-group">

            <label>Evidence</label>

            <input
                type="file"
                class="apc-file"
                accept=".pdf,.jpg,.jpeg,.png"
            >

            <small class="evidence-status">

                ${
                    data.evidence_url
                        ? "Evidence telah disimpan."
                        : "PDF / JPG / PNG, maksimum 10MB."
                }

            </small>

        </div>


        <button
            type="button"
            class="delete-btn"
        >
            Delete
        </button>
    `;

    apcList.appendChild(row);


    // ==========================================
    // FILE CHANGE
    // ==========================================

    row.querySelector(".apc-file")
        .addEventListener("change", function () {

            const file = this.files[0];

            if (!file) {
                return;
            }

            const status =
                row.querySelector(".evidence-status");

            status.innerText =
                `Fail dipilih: ${file.name}`;

        });


    // ==========================================
    // DELETE
    // ==========================================

    row.querySelector(".delete-btn")
        .addEventListener("click", function () {

            row.remove();

        });
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
        .order("apc_year", {
            ascending: true
        });

    if (error) {

        console.error(
            "Load APC History Error:",
            error
        );

        return;
    }

    apcList.innerHTML = "";

    if (!data || data.length === 0) {

        addApcRow();

        return;
    }

    data.forEach(item => {

        addApcRow(item);

    });
}


// ==========================================
// ADD LNPT ROW
// ==========================================

function addLnptRow(data = {}, number = 1) {

    const row = document.createElement("tr");

    // Store existing evidence path
    row.dataset.evidencePath =
        data.evidence_url || "";

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
                                📄 View Evidence
                            </button>
                          `
                        : ""
                }

            </div>

            <small class="evidence-status">

                ${
                    data.evidence_url
                        ? "Evidence telah disimpan."
                        : "PDF / JPG / PNG, maksimum 10MB."
                }

            </small>

        </td>


        <td>

            <button
                type="button"
                class="delete-btn"
            >
                Clear
            </button>

        </td>
    `;


    lnptTableBody.appendChild(row);


    // ==========================================
    // VIEW EXISTING EVIDENCE
    // ==========================================

    const viewButton =
        row.querySelector(".view-evidence-btn");

    if (viewButton) {

        viewButton.addEventListener(
            "click",
            async function () {

                try {

                    viewButton.innerText =
                        "Opening...";

                    const url =
                        await getEvidenceUrl(
                            row.dataset.evidencePath
                        );

                    if (!url) {

                        throw new Error(
                            "Evidence tidak dapat dibuka."
                        );
                    }

                    window.open(
                        url,
                        "_blank"
                    );

                } catch (error) {

                    console.error(
                        "View Evidence Error:",
                        error
                    );

                    alert(
                        "Evidence tidak dapat dibuka."
                    );

                } finally {

                    viewButton.innerText =
                        "📄 View Evidence";

                }

            }
        );
    }


    // ==========================================
    // FILE CHANGE
    // ==========================================

    row.querySelector(".lnpt-file")
        .addEventListener(
            "change",
            function () {

                const file = this.files[0];

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

    row.querySelector(".delete-btn")
        .addEventListener(
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

                row.dataset.evidencePath = "";

                const existingEvidence =
                    row.querySelector(
                        ".existing-evidence"
                    );

                if (existingEvidence) {

                    existingEvidence.innerHTML = "";

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
        .order("lnpt_year", {
            ascending: false
        });

    if (error) {

        console.error(
            "Load LNPT History Error:",
            error
        );

        return;
    }

    const records = data || [];

    lnptTableBody.innerHTML = "";


    // Always show 3 rows
    for (let i = 0; i < 3; i++) {

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
            "Saving...";

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
            } = await supabaseClient.auth.getUser();


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

                user_id: userId,

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
            } = await supabaseClient
                .from("employment")
                .upsert(
                    employmentData,
                    {
                        onConflict: "user_id"
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
                    positionTableBody.querySelectorAll("tr")
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

                        position:
                            position,

                        from_date:
                            fromDate || null,

                        to_date:
                            toDate || null,

                        duration:
                            duration

                    });

                }

            }


            // Delete old records
            const {
                error: deletePositionError
            } = await supabaseClient
                .from("position_history")
                .delete()
                .eq("user_id", userId);


            if (deletePositionError) {

                throw deletePositionError;

            }


            // Insert new records
            if (positions.length > 0) {

                const {
                    error: insertPositionError
                } = await supabaseClient
                    .from("position_history")
                    .insert(positions);


                if (insertPositionError) {

                    throw insertPositionError;

                }

            }


            // ======================================
            // APC HISTORY
            // ======================================

            const apcRows =
                Array.from(
                    apcList.querySelectorAll(".apc-row")
                );


            const apcRecords = [];


            // Delete old APC records
            const {
                error: deleteApcError
            } = await supabaseClient
                .from("apc_history")
                .delete()
                .eq("user_id", userId);


            if (deleteApcError) {

                throw deleteApcError;

            }


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


                // Skip completely empty row
                if (
                    !year &&
                    !file &&
                    !row.dataset.evidencePath
                ) {

                    continue;

                }


                if (!year) {

                    throw new Error(
                        "Sila masukkan tahun APC."
                    );

                }


                let evidencePath =
                    row.dataset.evidencePath || "";


                // Upload new evidence
                if (file) {

                    evidencePath =
                        await uploadEvidence(
                            file,
                            userId,
                            "apc"
                        );

                }


                // Evidence required
                if (!evidencePath) {

                    throw new Error(
                        `Sila masukkan evidence APC bagi tahun ${year}.`
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


            // Insert APC
            if (apcRecords.length > 0) {

                const {
                    error: insertApcError
                } = await supabaseClient
                    .from("apc_history")
                    .insert(apcRecords);


                if (insertApcError) {

                    throw insertApcError;

                }

            }


            // ======================================
            // LNPT HISTORY
            // ======================================

            const lnptRows =
                Array.from(
                    lnptTableBody.querySelectorAll("tr")
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
                    row.dataset.evidencePath || "";


                // Completely empty row
                if (
                    !year &&
                    !mark &&
                    !file &&
                    !existingEvidence
                ) {

                    continue;

                }


                // Year required
                if (!year) {

                    throw new Error(
                        "Sila masukkan tahun LNPT."
                    );

                }


                // Mark required
                if (mark === "") {

                    throw new Error(
                        `Sila masukkan markah LNPT bagi tahun ${year}.`
                    );

                }


                const numericMark =
                    parseFloat(mark);


                // Validate mark
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


                // Upload new evidence
                if (file) {

                    evidencePath =
                        await uploadEvidence(
                            file,
                            userId,
                            "lnpt"
                        );

                }


                // Evidence required
                if (!evidencePath) {

                    throw new Error(
                        `Sila masukkan evidence LNPT bagi tahun ${year}.`
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
                    record => record.lnpt_year
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
            } = await supabaseClient
                .from("lnpt_history")
                .delete()
                .eq("user_id", userId);


            if (deleteLnptError) {

                throw deleteLnptError;

            }


            // ======================================
            // INSERT NEW LNPT
            // ======================================

            if (lnptRecords.length > 0) {

                const {
                    error: insertLnptError
                } = await supabaseClient
                    .from("lnpt_history")
                    .insert(lnptRecords);


                if (insertLnptError) {

                    throw insertLnptError;

                }

            }


            // ======================================
            // SUCCESS
            // ======================================

            message.innerText =
                "Data employment berjaya disimpan.";

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