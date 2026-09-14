const employmentForm =
    document.getElementById("employmentForm");

const logoutBtn =
    document.getElementById("logoutBtn");

const message =
    document.getElementById("message");

const positionTableBody =
    document.getElementById("positionTableBody");

const apcList =
    document.getElementById("apcList");


// ==========================================
// CHECK LOGIN
// ==========================================

async function checkUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    await loadEmployment(user);
    await loadPositionHistory(user);
    await loadApcHistory(user);
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
                placeholder="Enter position"
                value="${data.position_name || ""}">
        </td>

        <td>
            <input
                type="date"
                class="start-date"
                value="${data.start_date || ""}">
        </td>

        <td>
            <input
                type="date"
                class="end-date"
                value="${data.end_date || ""}">
        </td>

        <td class="duration-cell">
            -
        </td>

        <td>
            <button
                type="button"
                class="delete-btn">
                Delete
            </button>
        </td>
    `;

    positionTableBody.appendChild(row);


    const startInput =
        row.querySelector(".start-date");

    const endInput =
        row.querySelector(".end-date");

    const durationCell =
        row.querySelector(".duration-cell");


    // ==========================================
    // CALCULATE DURATION
    // ==========================================

    function calculateDuration() {

        if (!startInput.value || !endInput.value) {
            durationCell.innerText = "-";
            return;
        }

        const start =
            new Date(startInput.value);

        const end =
            new Date(endInput.value);

        if (end < start) {
            durationCell.innerText =
                "Invalid date";
            return;
        }

        let years =
            end.getFullYear() -
            start.getFullYear();

        let months =
            end.getMonth() -
            start.getMonth();

        if (months < 0) {
            years--;
            months += 12;
        }

        durationCell.innerText =
            `${years} tahun ${months} bulan`;
    }


    startInput.addEventListener(
        "change",
        calculateDuration
    );

    endInput.addEventListener(
        "change",
        calculateDuration
    );


    // ==========================================
    // DELETE ROW
    // ==========================================

    row.querySelector(".delete-btn")
        .addEventListener(
            "click",
            function() {
                row.remove();
            }
        );


    calculateDuration();
}


// ==========================================
// LOAD EMPLOYMENT
// ==========================================

async function loadEmployment(user) {

    const { data, error } =
        await supabaseClient
            .from("employment")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();


    if (error) {

        console.error(
            "Employment Load Error:",
            error
        );

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

async function loadPositionHistory(user) {

    const { data, error } =
        await supabaseClient
            .from("position_history")
            .select("*")
            .eq("user_id", user.id)
            .order("start_date", {
                ascending: true
            });


    if (error) {

        console.error(
            "Position History Load Error:",
            error
        );

        return;
    }


    positionTableBody.innerHTML = "";


    if (data && data.length > 0) {

        data.forEach(function(item) {

            addPositionRow(item);

        });
    }
}


// ==========================================
// LOAD APC HISTORY
// ==========================================

async function loadApcHistory(user) {

    const { data, error } =
        await supabaseClient
            .from("apc_history")
            .select("*")
            .eq("user_id", user.id)
            .order("apc_year", {
                ascending: true
            });


    if (error) {

        console.error(
            "APC History Load Error:",
            error
        );

        return;
    }


    apcList.innerHTML = "";


    if (data && data.length > 0) {

        data.forEach(function(item) {

            addApcRow(item);

        });
    }
}


// ==========================================
// ADD APC ROW
// ==========================================

function addApcRow(data = {}) {

    const row =
        document.createElement("div");

    row.className = "apc-row";


    row.innerHTML = `
        <input
            type="text"
            class="apc-year"
            placeholder="Contoh: 2024"
            value="${data.apc_year || ""}">

        <button
            type="button"
            class="delete-btn">
            Delete
        </button>
    `;


    apcList.appendChild(row);


    row.querySelector(".delete-btn")
        .addEventListener(
            "click",
            function() {
                row.remove();
            }
        );
}


// ==========================================
// ADD POSITION BUTTON
// ==========================================

document.getElementById("addPositionBtn")
    .addEventListener(
        "click",
        function() {

            addPositionRow();

        }
    );


// ==========================================
// ADD APC BUTTON
// ==========================================

document.getElementById("addApcBtn")
    .addEventListener(
        "click",
        function() {

            addApcRow();

        }
    );


// ==========================================
// SAVE EMPLOYMENT
// ==========================================

employmentForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        message.innerText =
            "Saving...";

        message.style.color =
            "#163b65";


        const {
            data: { user }
        } = await supabaseClient.auth.getUser();


        if (!user) {

            window.location.href =
                "index.html";

            return;
        }


        // ==========================================
        // 1. SAVE EMPLOYMENT INFORMATION
        // ==========================================

        const employmentData = {

            user_id: user.id,

            salary_grade:
                document
                    .getElementById("salary_grade")
                    .value
                    .trim(),

            appointment_date:
                document
                    .getElementById("appointment_date")
                    .value,

            retirement_date:
                document
                    .getElementById("retirement_date")
                    .value,

            original_department:
                document
                    .getElementById("original_department")
                    .value
                    .trim(),

            current_department:
                document
                    .getElementById("current_department")
                    .value
                    .trim(),

            original_position:
                document
                    .getElementById("original_position")
                    .value
                    .trim(),

            current_position:
                document
                    .getElementById("current_position")
                    .value
                    .trim(),

            updated_at:
                new Date().toISOString()
        };


        const {
            error: employmentError
        } =
            await supabaseClient
                .from("employment")
                .upsert(
                    employmentData,
                    {
                        onConflict: "user_id"
                    }
                );


        if (employmentError) {

            console.error(
                "Employment Error:",
                employmentError
            );

            message.innerText =
                "Failed to save employment information: " +
                employmentError.message;

            message.style.color =
                "red";

            return;
        }


        // ==========================================
        // 2. GET POSITION DATA
        // ==========================================

        const positionRows =
            [
                ...positionTableBody
                    .querySelectorAll("tr")
            ];


        const positionData = [];


        positionRows.forEach(function(row) {

            const positionName =
                row
                    .querySelector(".position-name")
                    .value
                    .trim();

            const startDate =
                row
                    .querySelector(".start-date")
                    .value;

            const endDate =
                row
                    .querySelector(".end-date")
                    .value;


            if (positionName) {

                positionData.push({

                    user_id: user.id,

                    position_name:
                        positionName,

                    start_date:
                        startDate || null,

                    end_date:
                        endDate || null

                });
            }

        });


        // ==========================================
        // 3. DELETE OLD POSITION HISTORY
        // ==========================================

        const {
            error: deletePositionError
        } =
            await supabaseClient
                .from("position_history")
                .delete()
                .eq("user_id", user.id);


        if (deletePositionError) {

            console.error(
                "Delete Position Error:",
                deletePositionError
            );

            message.innerText =
                "Failed to update position history: " +
                deletePositionError.message;

            message.style.color =
                "red";

            return;
        }


        // ==========================================
        // 4. INSERT NEW POSITION HISTORY
        // ==========================================

        if (positionData.length > 0) {

            const {
                error: positionError
            } =
                await supabaseClient
                    .from("position_history")
                    .insert(positionData);


            if (positionError) {

                console.error(
                    "Position History Error:",
                    positionError
                );

                message.innerText =
                    "Failed to save position history: " +
                    positionError.message;

                message.style.color =
                    "red";

                return;
            }
        }


        // ==========================================
        // 5. GET APC DATA
        // ==========================================

        const apcRows =
            [
                ...apcList
                    .querySelectorAll(".apc-row")
            ];


        const apcData = [];


        apcRows.forEach(function(row) {

            const apcYear =
                row
                    .querySelector(".apc-year")
                    .value
                    .trim();


            if (apcYear) {

                apcData.push({

                    user_id: user.id,

                    apc_year:
                        apcYear

                });
            }

        });


        // ==========================================
        // 6. DELETE OLD APC HISTORY
        // ==========================================

        const {
            error: deleteApcError
        } =
            await supabaseClient
                .from("apc_history")
                .delete()
                .eq("user_id", user.id);


        if (deleteApcError) {

            console.error(
                "Delete APC Error:",
                deleteApcError
            );

            message.innerText =
                "Failed to update APC history: " +
                deleteApcError.message;

            message.style.color =
                "red";

            return;
        }


        // ==========================================
        // 7. INSERT NEW APC HISTORY
        // ==========================================

        if (apcData.length > 0) {

            const {
                error: apcError
            } =
                await supabaseClient
                    .from("apc_history")
                    .insert(apcData);


            if (apcError) {

                console.error(
                    "APC History Error:",
                    apcError
                );

                message.innerText =
                    "Failed to save APC history: " +
                    apcError.message;

                message.style.color =
                    "red";

                return;
            }
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        message.innerText =
            "Employment information saved successfully!";

        message.style.color =
            "green";

    }
);


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener(
    "click",
    async function() {

        await supabaseClient.auth.signOut();

        window.location.href =
            "index.html";

    }
);


// ==========================================
// START
// ==========================================

checkUser();