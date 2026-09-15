// ==========================================
// ACADEMIC LEADERSHIP HISTORY
// ==========================================


// ==========================================
// POSITION SCORE
// ==========================================

const positionScores = {

    "Timbalan Naib Canselor": 6,

    "Penolong Naib Canselor": 5,

    "Rektor / Dekan / Pengarah": 4,

    "Timbalan Rektor / Timbalan Pengarah / Timbalan Dekan / Penolong Rektor": 3,

    "Ketua Pusat Pengajian": 2,

    "Koordinator": 1

};


// ==========================================
// START
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href = "index.html";

        return;

    }


    await loadLeadershipHistory(user.id);


    // ==========================================
    // ADD NEW ROW
    // ==========================================

    document
        .getElementById("addPositionBtn")
        .addEventListener("click", () => {

            addLeadershipRow();

        });


    // ==========================================
    // SAVE
    // ==========================================

    document
        .getElementById("saveBtn")
        .addEventListener("click", async () => {

            await saveLeadershipHistory(user.id);

        });


    // ==========================================
    // LOGOUT
    // ==========================================

    document
        .getElementById("logoutBtn")
        .addEventListener("click", async () => {

            await supabaseClient.auth.signOut();

            window.location.href = "index.html";

        });

});


// ==========================================
// LOAD EXISTING DATA
// ==========================================

async function loadLeadershipHistory(userId) {

    const {
        data,
        error
    } = await supabaseClient

        .from("academic_leadership_history")

        .select("*")

        .eq("user_id", userId)

        .order("start_date", {
            ascending: true
        });


    if (error) {

        console.error(
            "Load Leadership History Error:",
            error
        );

        document.getElementById("message").innerText =
            "Failed to load leadership history.";

        return;

    }


    const tbody =
        document.getElementById(
            "leadershipTableBody"
        );


    tbody.innerHTML = "";


    if (!data || data.length === 0) {

        addLeadershipRow();

        return;

    }


    data.forEach(record => {

        addLeadershipRow(record);

    });

}


// ==========================================
// CALCULATE DURATION TEXT
// ==========================================

function calculateDurationText(startDate, endDate) {

    if (!startDate || !endDate) {

        return "";

    }


    const start = new Date(startDate);

    const end = new Date(endDate);


    if (end < start) {

        return "Tarikh tidak sah";

    }


    let years =
        end.getFullYear() -
        start.getFullYear();


    let months =
        end.getMonth() -
        start.getMonth();


    let days =
        end.getDate() -
        start.getDate();


    // ==========================================
    // ADJUST DAYS
    // ==========================================

    if (days < 0) {

        months--;

        const previousMonth =
            new Date(
                end.getFullYear(),
                end.getMonth(),
                0
            );

        days += previousMonth.getDate();

    }


    // ==========================================
    // ADJUST MONTHS
    // ==========================================

    if (months < 0) {

        years--;

        months += 12;

    }


    const result = [];


    if (years > 0) {

        result.push(
            `${years} tahun`
        );

    }


    if (months > 0) {

        result.push(
            `${months} bulan`
        );

    }


    if (days > 0) {

        result.push(
            `${days} hari`
        );

    }


    if (result.length === 0) {

        result.push("0 hari");

    }


    return result.join(" ");

}


// ==========================================
// ADD ROW
// ==========================================

function addLeadershipRow(record = null) {

    const tbody =
        document.getElementById(
            "leadershipTableBody"
        );


    const row =
        document.createElement("tr");


    row.innerHTML = `

        <!-- POSITION -->

        <td>

            <select class="position-select">

                <option value="">
                    -- Select Position --
                </option>

                <option value="Timbalan Naib Canselor">
                    Timbalan Naib Canselor
                </option>

                <option value="Penolong Naib Canselor">
                    Penolong Naib Canselor
                </option>

                <option value="Rektor / Dekan / Pengarah">
                    Rektor / Dekan / Pengarah
                </option>

                <option value="Timbalan Rektor / Timbalan Pengarah / Timbalan Dekan / Penolong Rektor">
                    Timbalan Rektor / Timbalan Pengarah / Timbalan Dekan / Penolong Rektor
                </option>

                <option value="Ketua Pusat Pengajian">
                    Ketua Pusat Pengajian
                </option>

                <option value="Koordinator">
                    Koordinator
                </option>

            </select>

        </td>


        <!-- START DATE -->

        <td>

            <input
                type="date"
                class="start-date"
            >

        </td>


        <!-- END DATE -->

        <td>

            <input
                type="date"
                class="end-date"
            >

        </td>


        <!-- DURATION -->

        <td>

            <input
                type="text"
                class="duration-display"
                placeholder="Akan dikira"
                readonly
            >

        </td>


        <!-- DELETE -->

        <td>

            <button
                type="button"
                class="delete-btn">

                Hapus

            </button>

        </td>

    `;


    tbody.appendChild(row);


    // ==========================================
    // ELEMENTS
    // ==========================================

    const positionSelect =
        row.querySelector(
            ".position-select"
        );


    const startDate =
        row.querySelector(
            ".start-date"
        );


    const endDate =
        row.querySelector(
            ".end-date"
        );


    const durationDisplay =
        row.querySelector(
            ".duration-display"
        );


    const deleteBtn =
        row.querySelector(
            ".delete-btn"
        );


    // ==========================================
    // EXISTING DATA
    // ==========================================

    if (record) {

        positionSelect.value =
            record.position_name || "";


        startDate.value =
            record.start_date || "";


        endDate.value =
            record.end_date || "";


        // Calculate duration again
        durationDisplay.value =
            calculateDurationText(
                record.start_date,
                record.end_date
            );

    }


    // ==========================================
    // UPDATE DURATION
    // ==========================================

    function updateDuration() {

        const start =
            startDate.value;

        const end =
            endDate.value;


        durationDisplay.value =
            calculateDurationText(
                start,
                end
            );

    }


    // ==========================================
    // DATE CHANGE
    // ==========================================

    startDate.addEventListener(
        "change",
        updateDuration
    );


    endDate.addEventListener(
        "change",
        updateDuration
    );


    // ==========================================
    // DELETE
    // ==========================================

    deleteBtn.addEventListener(
        "click",
        () => {

            row.remove();

        }
    );

}


// ==========================================
// SAVE
// ==========================================

async function saveLeadershipHistory(userId) {

    const message =
        document.getElementById(
            "message"
        );


    const rows =
        document.querySelectorAll(
            "#leadershipTableBody tr"
        );


    const records = [];


    try {

        // ======================================
        // VALIDATE + CALCULATE
        // ======================================

        for (const row of rows) {

            const position =
                row.querySelector(
                    ".position-select"
                ).value;


            const startDate =
                row.querySelector(
                    ".start-date"
                ).value;


            const endDate =
                row.querySelector(
                    ".end-date"
                ).value;


            // ==================================
            // POSITION REQUIRED
            // ==================================

            if (!position) {

                message.innerText =
                    "Please select a position for every row.";

                message.style.color =
                    "red";

                return;

            }


            // ==================================
            // START DATE REQUIRED
            // ==================================

            if (!startDate) {

                message.innerText =
                    "Please enter the start date.";

                message.style.color =
                    "red";

                return;

            }


            // ==================================
            // END DATE REQUIRED
            // ==================================

            if (!endDate) {

                message.innerText =
                    "Please enter the end date.";

                message.style.color =
                    "red";

                return;

            }


            // ==================================
            // DATE VALIDATION
            // ==================================

            const start =
                new Date(startDate);


            const end =
                new Date(endDate);


            if (end < start) {

                message.innerText =
                    "End date cannot be earlier than start date.";

                message.style.color =
                    "red";

                return;

            }


            // ==================================
            // CALCULATE DURATION
            // ==================================

            const days =
                (end - start) /
                (1000 * 60 * 60 * 24);


            const durationYears =
                Math.round(
                    (days / 365.25) * 100
                ) / 100;


            // ==================================
            // GET SCORE
            // ==================================

            const score =
                positionScores[position];


            // ==================================
            // TOTAL SCORE
            // ==================================

            const totalScore =
                Math.round(
                    score *
                    durationYears *
                    100
                ) / 100;


            // ==================================
            // STORE
            // ==================================

            records.push({

                user_id: userId,

                position_name: position,

                start_date: startDate,

                end_date: endDate,

                duration_years: durationYears,

                score: score,

                total_score: totalScore

            });

        }


        // ======================================
        // SAVING MESSAGE
        // ======================================

        message.innerText =
            "Menyimpan...";


        message.style.color =
            "#555";


        // ======================================
        // DELETE OLD RECORDS
        // ======================================

        const {
            error: deleteError
        } = await supabaseClient

            .from(
                "academic_leadership_history"
            )

            .delete()

            .eq(
                "user_id",
                userId
            );


        if (deleteError) {

            console.error(
                "Delete Error:",
                deleteError
            );


            message.innerText =
                "Failed to update data: " +
                deleteError.message;


            message.style.color =
                "red";


            return;

        }


        // ======================================
        // INSERT NEW RECORDS
        // ======================================

        if (records.length > 0) {

            const {
                error: insertError
            } = await supabaseClient

                .from(
                    "academic_leadership_history"
                )

                .insert(records);


            if (insertError) {

                console.error(
                    "Insert Error:",
                    insertError
                );


                message.innerText =
                    "Gagal menyimpan data: " +
                    insertError.message;


                message.style.color =
                    "red";


                return;

            }

        }


        // ======================================
        // SUCCESS
        // ======================================

        message.innerText =
            "Sejarah Jawatan Pentadbir Akademik berjaya disimpan!";


        message.style.color =
            "green";


        console.log(
            "Sejarah Jawatan Pentadbir Akademik berjaya:",
            records
        );


    } catch (error) {

        console.error(
            "Unexpected Error:",
            Ralat
        );


        message.innerText =
            "Ralat: " +
            error.message;


        message.style.color =
            "red";

    }

}