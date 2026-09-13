// ==========================================
// TRAINING SYSTEM
// ==========================================

const EVIDENCE_BUCKET = "evidence";

document.addEventListener("DOMContentLoaded", async () => {

    const message = document.getElementById("message");

    // ==========================================
    // CHECK USER LOGIN
    // ==========================================

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        window.location.href = "index.html";
        return;
    }


    // ==========================================
    // LOAD TRAINING DATA
    // ==========================================

    await loadTraining(user.id);


    // ==========================================
    // FORM SUBMIT
    // ==========================================

    document
        .getElementById("trainingForm")
        .addEventListener("submit", async (e) => {

            e.preventDefault();

            await saveTraining(user.id);

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
// LOAD TRAINING
// ==========================================

async function loadTraining(userId) {

    const mandatoryContainer =
        document.getElementById("mandatoryCourses");

    const pkaContainer =
        document.getElementById("pkaModules");

    const pkiContainer =
        document.getElementById("pkiModules");


    mandatoryContainer.innerHTML = "";
    pkaContainer.innerHTML = "";
    pkiContainer.innerHTML = "";


    // ==========================================
    // GET COURSES
    // ==========================================

    const {
        data: courses,
        error: courseError
    } = await supabaseClient
        .from("training_courses")
        .select("*")
        .order("course_code");


    if (courseError) {

        console.error(courseError);

        document.getElementById("message").innerText =
            "Failed to load training courses.";

        return;
    }


    // ==========================================
    // GET MODULES
    // ==========================================

    const {
        data: modules,
        error: moduleError
    } = await supabaseClient
        .from("training_modules")
        .select("*")
        .order("module_no");


    if (moduleError) {

        console.error(moduleError);

        document.getElementById("message").innerText =
            "Failed to load training modules.";

        return;
    }


    // ==========================================
    // GET USER TRAINING
    // ==========================================

    const {
        data: userTraining,
        error: trainingError
    } = await supabaseClient
        .from("user_training")
        .select("*")
        .eq("user_id", userId);


    if (trainingError) {

        console.error(trainingError);

        document.getElementById("message").innerText =
            "Failed to load your training records.";

        return;
    }


    // ==========================================
    // MANDATORY COURSES
    // ==========================================

    const mandatoryCodes = [
        "PTM",
        "HETL",
        "LEAP"
    ];


    const mandatoryCourses =
        courses.filter(course =>
            mandatoryCodes.includes(course.course_code)
        );


    mandatoryCourses.forEach(course => {

        const record =
            userTraining.find(item =>
                item.course_id === course.id &&
                item.module_id === null
            );


        mandatoryContainer.appendChild(
            createTrainingItem(
                course,
                null,
                record
            )
        );

    });


    // ==========================================
    // PKA
    // ==========================================

    const pkaCourse =
        courses.find(course =>
            course.course_code === "PKA"
        );


    if (pkaCourse) {

        const pkaModules =
            modules.filter(module =>
                module.course_id === pkaCourse.id
            );


        pkaModules.forEach(module => {

            const record =
                userTraining.find(item =>
                    item.module_id === module.id
                );


            pkaContainer.appendChild(
                createTrainingItem(
                    pkaCourse,
                    module,
                    record
                )
            );

        });

    }


    // ==========================================
    // PKI
    // ==========================================

    const pkiCourse =
        courses.find(course =>
            course.course_code === "PKI"
        );


    if (pkiCourse) {

        const pkiModules =
            modules.filter(module =>
                module.course_id === pkiCourse.id
            );


        pkiModules.forEach(module => {

            const record =
                userTraining.find(item =>
                    item.module_id === module.id
                );


            pkiContainer.appendChild(
                createTrainingItem(
                    pkiCourse,
                    module,
                    record
                )
            );

        });

    }

}


// ==========================================
// CREATE TRAINING ITEM
// ==========================================

function createTrainingItem(course, module, record) {

    const div = document.createElement("div");

    div.className = "training-item";


    const uniqueId =
        module
            ? module.id
            : course.id;


    const title =
        module
            ? `${module.module_no}. ${module.module_name}`
            : `${course.course_code} – ${course.course_name}`;


    const existingEvidence =
        record?.evidence_url || "";


    div.innerHTML = `

        <div class="training-name">
            ${title}
        </div>


        <div class="attendance-label">
            Attendance
        </div>


        <div class="radio-group">

            <label>

                <input
                    type="radio"
                    name="attendance_${uniqueId}"
                    value="Ya"
                    data-course-id="${course.id}"
                    data-module-id="${module ? module.id : ""}"
                    ${record?.attendance === "Ya" ? "checked" : ""}
                >

                Ya

            </label>


            <label>

                <input
                    type="radio"
                    name="attendance_${uniqueId}"
                    value="Tidak"
                    data-course-id="${course.id}"
                    data-module-id="${module ? module.id : ""}"
                    ${record?.attendance === "Tidak" ? "checked" : ""}
                >

                Tidak

            </label>

        </div>


        <div
            class="extra-info ${record?.attendance === "Ya" ? "active" : ""}"
            id="extra_${uniqueId}"
        >

            <label>
                Tahun Penyertaan
            </label>


            <input
                type="number"
                class="training-year"
                min="1900"
                max="2100"
                placeholder="Contoh: 2025"
                value="${record?.training_year || ""}"
            >


            <label>
                Evidence / Certificate
            </label>


            <input
                type="file"
                class="training-evidence"
                accept=".pdf,.jpg,.jpeg,.png"
            >


            ${
                existingEvidence
                    ? `
                        <small class="existing-evidence">

                            Existing evidence:

                            <a
                                href="#"
                                class="view-evidence"
                            >
                                View Certificate
                            </a>

                        </small>
                      `
                    : ""
            }

        </div>

    `;


    // ==========================================
    // EXISTING EVIDENCE
    // ==========================================

    if (existingEvidence) {

        div.dataset.evidencePath =
            existingEvidence;


        div
            .querySelector(".view-evidence")
            .addEventListener("click", async (e) => {

                e.preventDefault();

                const url =
                    await getEvidenceUrl(
                        existingEvidence
                    );


                if (url) {

                    window.open(
                        url,
                        "_blank"
                    );

                }

            });

    }


    // ==========================================
    // RADIO EVENT
    // ==========================================

    const radios =
        div.querySelectorAll(
            `input[name="attendance_${uniqueId}"]`
        );


    radios.forEach(radio => {

        radio.addEventListener("change", () => {

            const extra =
                document.getElementById(
                    `extra_${uniqueId}`
                );


            if (radio.value === "Ya") {

                extra.classList.add("active");

            } else {

                extra.classList.remove("active");

            }

        });

    });


    return div;

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
    // CHECK FILE TYPE
    // ==========================================

    const allowedTypes = [

        "application/pdf",

        "image/jpeg",

        "image/png"

    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Evidence must be PDF, JPG or PNG."
        );

    }


    // ==========================================
    // CHECK FILE SIZE
    // Maximum 10 MB
    // ==========================================

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        throw new Error(
            "Evidence file must not exceed 10 MB."
        );

    }


    // ==========================================
    // SAFE FILE NAME
    // ==========================================

    const safeName =
        file.name.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );


    const filePath =
        `${userId}/training/${folder}/${Date.now()}_${safeName}`;


    // ==========================================
    // UPLOAD TO SUPABASE STORAGE
    // ==========================================

    const {
        error
    } = await supabaseClient.storage
        .from(EVIDENCE_BUCKET)
        .upload(
            filePath,
            file,
            {
                upsert: false,
                contentType: file.type
            }
        );


    if (error) {

        throw error;

    }


    return filePath;

}


// ==========================================
// GET PRIVATE EVIDENCE URL
// ==========================================

async function getEvidenceUrl(pathOrUrl) {

    if (!pathOrUrl) {

        return null;

    }


    // If already a URL
    if (
        pathOrUrl.startsWith("http://") ||
        pathOrUrl.startsWith("https://")
    ) {

        return pathOrUrl;

    }


    const {
        data,
        error
    } = await supabaseClient.storage
        .from(EVIDENCE_BUCKET)
        .createSignedUrl(
            pathOrUrl,
            3600
        );


    if (error) {

        console.error(error);

        return null;

    }


    return data.signedUrl;

}


// ==========================================
// SAVE TRAINING
// ==========================================

async function saveTraining(userId) {

    const message =
        document.getElementById("message");


    message.innerText =
        "Saving training information...";


    const items =
        document.querySelectorAll(
            ".training-item"
        );


    const trainingRecords = [];


    try {

        // ==========================================
        // VALIDATE & PREPARE RECORDS
        // ==========================================

        for (const item of items) {

            const selected =
                item.querySelector(
                    'input[type="radio"]:checked'
                );


            // Attendance wajib
            if (!selected) {

                message.innerText =
                    "Please select attendance for every training.";

                return;

            }


            const attendance =
                selected.value;


            const courseId =
                selected.dataset.courseId;


            const moduleId =
                selected.dataset.moduleId ||
                null;


            const yearInput =
                item.querySelector(
                    ".training-year"
                );


            const evidenceInput =
                item.querySelector(
                    ".training-evidence"
                );


            let year = null;

            let evidencePath = null;


            // ==========================================
            // IF ATTENDANCE = YA
            // ==========================================

            if (attendance === "Ya") {

                year =
                    yearInput.value;


                // Year wajib
                if (!year) {

                    message.innerText =
                        "Please enter the year for every training attended.";

                    return;

                }


                // ==========================================
                // CHECK NEW FILE
                // ==========================================

                const selectedFile =
                    evidenceInput.files[0];


                if (selectedFile) {

                    const folderName =
                        moduleId ||
                        courseId;


                    evidencePath =
                        await uploadEvidence(
                            selectedFile,
                            userId,
                            folderName
                        );

                } else {

                    // Use existing evidence
                    evidencePath =
                        item.dataset.evidencePath ||
                        null;

                }


                // Evidence wajib
                if (!evidencePath) {

                    message.innerText =
                        "Please upload evidence/certificate for every training marked Ya.";

                    return;

                }

            }


            // ==========================================
            // PREPARE RECORD
            // ==========================================

            trainingRecords.push({

                user_id:
                    userId,

                course_id:
                    courseId,

                module_id:
                    moduleId,

                attendance:
                    attendance,

                training_year:
                    year
                        ? parseInt(year)
                        : null,

                evidence_url:
                    evidencePath

            });

        }


        // ==========================================
        // DELETE OLD RECORDS
        // ==========================================

        const {
            error: deleteError
        } = await supabaseClient
            .from("user_training")
            .delete()
            .eq(
                "user_id",
                userId
            );


        if (deleteError) {

            throw deleteError;

        }


        // ==========================================
        // INSERT NEW RECORDS
        // ==========================================

        if (
            trainingRecords.length > 0
        ) {

            const {
                error: insertError
            } = await supabaseClient
                .from("user_training")
                .insert(
                    trainingRecords
                );


            if (insertError) {

                throw insertError;

            }

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        message.innerText =
            "Training information saved successfully!";


        // Go to Academic Leadership
        setTimeout(() => {

            window.location.href =
                "academic-leadership.html";

        }, 700);


    } catch (error) {

        console.error(
            "Training save error:",
            error
        );


        message.innerText =
            "Failed to save training information: " +
            error.message;

    }

}