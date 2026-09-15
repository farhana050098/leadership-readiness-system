// ==========================================
// TRAINING SYSTEM
// ==========================================

const EVIDENCE_BUCKET = "evidence";


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    const message = document.getElementById("message");

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href = "index.html";
        return;

    }


    await loadTraining(user.id);


    // Submit
    document
        .getElementById("trainingForm")
        .addEventListener("submit", async (e) => {

            e.preventDefault();

            await saveTraining(user.id);

        });


    // Logout
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

    const pkaContainer =
        document.getElementById("pkaModules");

    const pkiContainer =
        document.getElementById("pkiModules");


    // Clear containers
    pkaContainer.innerHTML = "";
    pkiContainer.innerHTML = "";


    // ==========================================
    // LOAD MODULES
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
    // LOAD COURSES
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
    // LOAD USER TRAINING
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

function createTrainingItem(
    course,
    module,
    record
) {

    const div =
        document.createElement("div");


    div.className =
        "training-item";


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


    // Save existing evidence path
    if (existingEvidence) {

        div.dataset.evidencePath =
            existingEvidence;

    }


    div.innerHTML = `

        <div class="training-name">
            ${title}
        </div>


        <div class="attendance-label">
            Kehadiran
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
            class="extra-info ${
                record?.attendance === "Ya"
                    ? "active"
                    : ""
            }"
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
                Dokumen Sokongan
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

                        

                            <a
                                href="#"
                                class="view-evidence"
                            >
                                📄 Lihat Dokumen Sokongan
                            </a>

                        </small>
                    `
                    : ""
            }

        </div>

    `;


    // ==========================================
    // VIEW EXISTING EVIDENCE
    // ==========================================

    if (existingEvidence) {

        const viewButton =
            div.querySelector(
                ".view-evidence"
            );


        if (viewButton) {

            viewButton.addEventListener(
                "click",
                async (e) => {

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

                    } else {

                        alert(
                            "Gagal membuka Dokumen Sokongan."
                        );

                    }

                }
            );

        }

    }


    // ==========================================
    // ATTENDANCE CHANGE
    // ==========================================

    const radios =
        div.querySelectorAll(
            `input[name="attendance_${uniqueId}"]`
        );


    radios.forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                const extra =
                    document.getElementById(
                        `extra_${uniqueId}`
                    );


                if (radio.value === "Ya") {

                    extra.classList.add(
                        "active"
                    );

                } else {

                    extra.classList.remove(
                        "active"
                    );

                }

            }
        );

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
    // FILE TYPE
    // ==========================================

    const allowedTypes = [

        "application/pdf",
        "image/jpeg",
        "image/png"

    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        throw new Error(
            "Dokumen Sokongan mesti format PDF, JPG or PNG."
        );

    }


    // ==========================================
    // FILE SIZE
    // Maximum 10 MB
    // ==========================================

    const maxSize =
        10 * 1024 * 1024;


    if (file.size > maxSize) {

        throw new Error(
            "Dokumen Sokongan maksimum  10 MB."
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
    // UPLOAD TO STORAGE
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

        console.error(
            "Storage upload error:",
            error
        );

        throw error;

    }


    return filePath;

}


// ==========================================
// GET SIGNED URL
// ==========================================

async function getEvidenceUrl(
    path
) {

    if (!path) {

        return null;

    }


    // Already URL
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
        .createSignedUrl(
            path,
            3600
        );


    if (error) {

        console.error(
            "Signed URL error:",
            error
        );

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
        "Menyimpan...";


    message.style.color =
        "";


    const items =
        document.querySelectorAll(
            ".training-item"
        );


    const trainingRecords = [];


    try {

        // ==========================================
        // VALIDATE EACH TRAINING
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

                message.style.color =
                    "red";

                return;

            }


            const attendance =
                selected.value;


            const courseId =
                selected.dataset.courseId;


            const moduleId =
                selected.dataset.moduleId || null;


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
            // ATTENDANCE = YA
            // ==========================================

            if (attendance === "Ya") {

                year =
                    yearInput.value;


                // Year wajib
                if (!year) {

                    message.innerText =
                        "Sila masukkan tahun bagi setiap latihan yang dihadiri.";

                    message.style.color =
                        "red";

                    return;

                }


                // ==========================================
                // NEW EVIDENCE
                // ==========================================

                const selectedFile =
                    evidenceInput.files[0];


                if (selectedFile) {

                    const folder =
                        moduleId || courseId;


                    evidencePath =
                        await uploadEvidence(
                            selectedFile,
                            userId,
                            folder
                        );

                }


                // ==========================================
                // EXISTING EVIDENCE
                // ==========================================

                else {

                    evidencePath =
                        item.dataset.evidencePath ||
                        null;

                }


                // Evidence wajib
                if (!evidencePath) {

                    message.innerText =
                        "Muat Naik Dokumen Sokongan (Jika Ya).";

                    message.style.color =
                        "red";

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

        if (trainingRecords.length > 0) {

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
            "Maklumat Latihan berjaya disimpan!";

        message.style.color =
            "green";


    } catch (error) {

        console.error(
            "Training save error:",
            error
        );


        message.innerText =
            "Gagal menyimpan Maklumat Latihan: " +
            error.message;

        message.style.color =
            "red";

    }

}