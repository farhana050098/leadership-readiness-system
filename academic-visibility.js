// ==========================================
// ACADEMIC VISIBILITY
// ==========================================

const EVIDENCE_BUCKET = "evidence";


// ==========================================
// RECORD CONFIGURATION
// ==========================================

const recordTypes = {

    // =========================
    // AKADEMIK
    // =========================

    "profesor-pelawat": {
        location: true,
        role: false
    },

    "pensyarah-pelawat": {
        location: true,
        role: false
    },

    "pakar-rujuk": {
        location: true,
        role: false
    },

    "keynote-speaker": {
        location: true,
        role: false
    },

    "invited-speaker": {
        location: true,
        role: false
    },

    "fasilitator": {
        location: true,
        role: false
    },

    "pemeriksa-luar-program": {
        location: true,
        role: false
    },

    "pemeriksa-luar-tesis": {
        location: true,
        role: false,
        level: true
    },

    "pemeriksa-dalaman-tesis": {
        location: false,
        role: false,
        level: true
    },

    "viva-voce": {
        location: true,
        role: true
    },

    "proposal-defence": {
        location: true,
        role: true
    },

    "lantikan-universiti-akademik": {
        location: true,
        role: true
    },


    // =========================
    // PENYELIDIKAN
    // =========================

    "editorial-board": {
        location: true,
        role: false
    },

    "penilai-penyemak": {
        location: true,
        role: false,
        reviewType: true
    },

    "jawatankuasa-persidangan": {
        location: true,
        role: true
    },

    "lantikan-universiti-penyelidikan": {
        location: true,
        role: true
    },

    "geran-semasa": {
        location: true,
        role: true,
        grantRole: true
    },

    "geran-selesai": {
        location: true,
        role: true,
        grantRole: true
    },

    "pelajar-semasa": {
        location: true,
        role: true,
        studentRole: true
    },

    "pelajar-selesai": {
        location: true,
        role: true,
        studentRole: true
    },


    // =========================
    // ICAN
    // =========================

    "khidmat-masyarakat": {
        location: true,
        role: true
    },

    "penglibatan-alumni": {
        location: true,
        role: true
    },

    "lantikan-universiti-ican": {
        location: true,
        role: true
    },


    // =========================
    // HEP
    // =========================

    "hal-ehwal-pelajar": {
        location: true,
        role: true
    },

    "lantikan-universiti-hep": {
        location: true,
        role: true
    }

};


// ==========================================
// CATEGORY
// ==========================================

const categoryMap = {

    "profesor-pelawat": "Akademik",
    "pensyarah-pelawat": "Akademik",
    "pakar-rujuk": "Akademik",
    "keynote-speaker": "Akademik",
    "invited-speaker": "Akademik",
    "fasilitator": "Akademik",
    "pemeriksa-luar-program": "Akademik",
    "pemeriksa-luar-tesis": "Akademik",
    "pemeriksa-dalaman-tesis": "Akademik",
    "viva-voce": "Akademik",
    "proposal-defence": "Akademik",
    "lantikan-universiti-akademik": "Akademik",

    "editorial-board": "Penyelidikan",
    "penilai-penyemak": "Penyelidikan",
    "jawatankuasa-persidangan": "Penyelidikan",
    "lantikan-universiti-penyelidikan": "Penyelidikan",
    "geran-semasa": "Penyelidikan",
    "geran-selesai": "Penyelidikan",
    "pelajar-semasa": "Penyelidikan",
    "pelajar-selesai": "Penyelidikan",

    "khidmat-masyarakat": "ICAN",
    "penglibatan-alumni": "ICAN",
    "lantikan-universiti-ican": "ICAN",

    "hal-ehwal-pelajar": "Hal Ehwal Pelajar",
    "lantikan-universiti-hep": "Hal Ehwal Pelajar"

};


// ==========================================
// ACTIVITY NAMES
// ==========================================

const activityNames = {

    "profesor-pelawat":
        "Profesor Pelawat",

    "pensyarah-pelawat":
        "Pensyarah Pelawat",

    "pakar-rujuk":
        "Pakar Rujuk",

    "keynote-speaker":
        "Keynote Speaker",

    "invited-speaker":
        "Invited Speaker",

    "fasilitator":
        "Fasilitator",

    "pemeriksa-luar-program":
        "Pemeriksa Luar (Program)",

    "pemeriksa-luar-tesis":
        "Pemeriksa Luar (Tesis)",

    "pemeriksa-dalaman-tesis":
        "Pemeriksa Dalaman (Tesis)",

    "viva-voce":
        "Jawatankuasa Viva Voce",

    "proposal-defence":
        "Jawatankuasa Proposal Defence",

    "lantikan-universiti-akademik":
        "Jawatankuasa Lantikan Universiti/Fakulti",


    "editorial-board":
        "Editorial Board Member Jurnal",

    "penilai-penyemak":
        "Penilai / Penyemak",

    "jawatankuasa-persidangan":
        "Jawatankuasa Persidangan",

    "lantikan-universiti-penyelidikan":
        "Jawatankuasa Lantikan Universiti/Fakulti",

    "geran-semasa":
        "Geran Penyelidikan Semasa",

    "geran-selesai":
        "Geran Penyelidikan Selesai",

    "pelajar-semasa":
        "Pelajar Pascasiswazah Semasa",

    "pelajar-selesai":
        "Pelajar Pascasiswazah Selesai",


    "khidmat-masyarakat":
        "Penglibatan Khidmat Masyarakat",

    "penglibatan-alumni":
        "Penglibatan Alumni",

    "lantikan-universiti-ican":
        "Jawatankuasa Lantikan Universiti/Fakulti",


    "hal-ehwal-pelajar":
        "Penglibatan Hal Ehwal Pelajar",

    "lantikan-universiti-hep":
        "Jawatankuasa Lantikan Universiti/Fakulti"

};


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const {
            data: { user }
        } = await supabaseClient.auth.getUser();


        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        // Load existing records
        await loadVisibility(user.id);


        // Logout
        document
            .getElementById("logoutBtn")
            .addEventListener(
                "click",
                async () => {

                    await supabaseClient.auth.signOut();

                    window.location.href =
                        "index.html";

                }
            );


        // Save
        document
            .getElementById("saveBtn")
            .addEventListener(
                "click",
                async () => {

                    await saveVisibility(user.id);

                }
            );

    }
);


// ==========================================
// ADD RECORD
// ==========================================

function addRecord(
    type,
    existing = null
) {

    const container =
        document.getElementById(type);

    const config =
        recordTypes[type];


    if (!container || !config) {

        return;

    }


    const record =
        document.createElement("div");


    record.className =
        "visibility-record";


    // Existing database ID
    if (existing?.id) {

        record.dataset.recordId =
            existing.id;

    }


    // Existing evidence
    if (existing?.evidence_path) {

        record.dataset.evidencePath =
            existing.evidence_path;

    }


    let html = `

        <div class="record-grid">

    `;


    // ==========================================
    // LOCATION
    // ==========================================

    if (config.location) {

        html += `

            <div class="form-group">

                <label>
                    Peringkat
                </label>

                <select
                    class="country-level"
                >

                    <option value="">
                        -- Pilih --
                    </option>

                    <option value="Dalam Negara">
                        Dalam Negara
                    </option>

                    <option value="Luar Negara">
                        Luar Negara
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Tempat / Institusi
                </label>

                <input
                    type="text"
                    class="location"
                    placeholder="Masukkan tempat / institusi"
                >

            </div>

        `;

    }


    // ==========================================
    // THESIS LEVEL
    // ==========================================

    if (config.level) {

        html += `

            <div class="form-group">

                <label>
                    Peringkat Tesis
                </label>

                <select class="level">

                    <option value="">
                        -- Pilih --
                    </option>

                    <option value="PhD">
                        PhD
                    </option>

                    <option value="Master">
                        Master
                    </option>

                </select>

            </div>

        `;

    }


    // ==========================================
    // REVIEW TYPE
    // ==========================================

    if (config.reviewType) {

        html += `

            <div class="form-group">

                <label>
                    Jenis Penilaian
                </label>

                <select class="review-type">

                    <option value="">
                        -- Pilih --
                    </option>

                    <option value="Artikel Jurnal">
                        Artikel Jurnal
                    </option>

                    <option value="Geran Penyelidikan">
                        Geran Penyelidikan
                    </option>

                </select>

            </div>

        `;

    }


    // ==========================================
    // GRANT ROLE
    // ==========================================

    if (config.grantRole) {

        html += `

            <div class="form-group">

                <label>
                    Peranan
                </label>

                <select class="role">

                    <option value="">
                        -- Pilih --
                    </option>

                    <option value="Ketua">
                        Ketua
                    </option>

                    <option value="Ahli">
                        Ahli
                    </option>

                </select>

            </div>

        `;

    }


    // ==========================================
    // STUDENT ROLE
    // ==========================================

    else if (config.studentRole) {

        html += `

            <div class="form-group">

                <label>
                    Peranan
                </label>

                <select class="role">

                    <option value="">
                        -- Pilih --
                    </option>

                    <option value="Penyelia">
                        Penyelia
                    </option>

                    <option value="Penyelia Bersama">
                        Penyelia Bersama
                    </option>

                </select>

            </div>

        `;

    }


    // ==========================================
    // GENERAL ROLE
    // ==========================================

    else if (config.role) {

        html += `

            <div class="form-group">

                <label>
                    Peranan
                </label>

                <select class="role">

                    <option value="">
                        -- Pilih --
                    </option>

                    <option value="Pengerusi">
                        Pengerusi
                    </option>

                    <option value="Timbalan">
                        Timbalan
                    </option>

                    <option value="Bendahari">
                        Bendahari
                    </option>

                    <option value="Setiausaha">
                        Setiausaha
                    </option>

                    <option value="Pencatat Minit">
                        Pencatat Minit
                    </option>

                    <option value="Ahli Jawatankuasa">
                        Ahli Jawatankuasa
                    </option>

                </select>

            </div>

        `;

    }


    // ==========================================
    // YEAR
    // ==========================================

    html += `

        <div class="form-group">

            <label>
                Tahun
            </label>

            <input
                type="number"
                class="year"
                min="1900"
                max="2100"
                placeholder="Contoh: 2025"
            >

        </div>

    `;


    // ==========================================
    // EVIDENCE
    // ==========================================

    html += `

        <div class="form-group">

            <label>
                Dokumen Sokongan
            </label>

            <input
                type="file"
                class="evidence"
                accept=".pdf,.jpg,.jpeg,.png"
            >

            ${
                existing?.evidence_path
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


    html += `

        </div>

        <button
            type="button"
            class="delete-record"
        >
            Hapus
        </button>

    `;


    record.innerHTML =
        html;


    container.appendChild(
        record
    );


    // ==========================================
    // LOAD EXISTING VALUES
    // ==========================================

    if (existing) {

        const scope =
            record.querySelector(
                ".country-level"
            );

        const location =
            record.querySelector(
                ".location"
            );

        const level =
            record.querySelector(
                ".level"
            );

        const reviewType =
            record.querySelector(
                ".review-type"
            );

        const role =
            record.querySelector(
                ".role"
            );

        const year =
            record.querySelector(
                ".year"
            );


        if (scope) {

            scope.value =
                existing.scope || "";

        }


        if (location) {

            location.value =
                existing.institution || "";

        }


        if (level) {

            level.value =
                existing.thesis_level || "";

        }


        if (reviewType) {

            reviewType.value =
                existing.review_type || "";

        }


        if (role) {

            role.value =
                existing.role || "";

        }


        if (year) {

            year.value =
                existing.year || "";

        }


        // Existing evidence link
        if (
            existing.evidence_path
        ) {

            const viewButton =
                record.querySelector(
                    ".view-evidence"
                );


            if (viewButton) {

                viewButton.addEventListener(
                    "click",
                    async (e) => {

                        e.preventDefault();


                        const url =
                            await getEvidenceUrl(
                                existing.evidence_path
                            );


                        if (url) {

                            window.open(
                                url,
                                "_blank"
                            );

                        }

                    }
                );

            }

        }

    }


    // ==========================================
    // DELETE
    // ==========================================

    record
        .querySelector(
            ".delete-record"
        )
        .addEventListener(
            "click",
            () => {

                record.remove();

            }
        );

}


// ==========================================
// LOAD EXISTING DATA
// ==========================================

async function loadVisibility(
    userId
) {

    const {
        data,
        error
    } = await supabaseClient
        .from("academic_visibility")
        .select("*")
        .eq(
            "user_id",
            userId
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(error);

        document.getElementById(
            "message"
        ).innerText =
            "Gagal memuatkan maklumat Ketampakan Pensyarah (Akademik): " +
            error.message;

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    data.forEach(record => {

        const type =
            Object.keys(
                activityNames
            ).find(
                key =>
                    activityNames[key] ===
                    record.activity_type
            );


        if (type) {

            addRecord(
                type,
                record
            );

        }

    });

}


// ==========================================
// UPLOAD EVIDENCE
// ==========================================

async function uploadEvidence(
    file,
    userId,
    activityType
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
            "Evidence must be PDF, JPG or PNG."
        );

    }


    // ==========================================
    // FILE SIZE
    // Maximum 10 MB
    // ==========================================

    const maxSize =
        10 * 1024 * 1024;


    if (
        file.size > maxSize
    ) {

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
        `${userId}/academic-visibility/${activityType}/${Date.now()}_${safeName}`;


    // ==========================================
    // UPLOAD
    // ==========================================

    const {
        error
    } = await supabaseClient.storage
        .from(
            EVIDENCE_BUCKET
        )
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

async function getEvidenceUrl(
    pathOrUrl
) {

    if (!pathOrUrl) {

        return null;

    }


    // If URL already
    if (
        pathOrUrl.startsWith(
            "http://"
        ) ||
        pathOrUrl.startsWith(
            "https://"
        )
    ) {

        return pathOrUrl;

    }


    const {
        data,
        error
    } = await supabaseClient.storage
        .from(
            EVIDENCE_BUCKET
        )
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
// SAVE VISIBILITY
// ==========================================

async function saveVisibility(
    userId
) {

    const message =
        document.getElementById(
            "message"
        );


    message.innerText =
        "Menyimpan...";


    const records = [];


    try {

        // ==========================================
        // LOOP THROUGH ALL ACTIVITY TYPES
        // ==========================================

        for (
            const type of Object.keys(
                recordTypes
            )
        ) {

            const container =
                document.getElementById(
                    type
                );


            if (!container) {

                continue;

            }


            const rows =
                container.querySelectorAll(
                    ".visibility-record"
                );


            // ==========================================
            // EACH RECORD
            // ==========================================

            for (
                const row of rows
            ) {

                const config =
                    recordTypes[type];


                const scope =
                    row.querySelector(
                        ".country-level"
                    )?.value || null;


                const institution =
                    row.querySelector(
                        ".location"
                    )?.value.trim() || null;


                const thesisLevel =
                    row.querySelector(
                        ".level"
                    )?.value || null;


                const reviewType =
                    row.querySelector(
                        ".review-type"
                    )?.value || null;


                const role =
                    row.querySelector(
                        ".role"
                    )?.value || null;


                const yearValue =
                    row.querySelector(
                        ".year"
                    )?.value || null;


                const evidenceInput =
                    row.querySelector(
                        ".evidence"
                    );


                // ==========================================
                // CHECK EMPTY ROW
                // ==========================================

                const hasAnyData =

                    scope ||

                    institution ||

                    thesisLevel ||

                    reviewType ||

                    role ||

                    yearValue ||

                    (
                        evidenceInput &&
                        evidenceInput.files.length > 0
                    );


                // Empty row = ignore
                if (!hasAnyData) {

                    continue;

                }


                // ==========================================
                // VALIDATION
                // ==========================================

                if (
                    config.location &&
                    !scope
                ) {

                    throw new Error(
                        `Sila pilih peringkat untuk ${activityNames[type]}.`
                    );

                }


                if (
                    config.location &&
                    !institution
                ) {

                    throw new Error(
                        `Sila masukkan tempat / institusi untuk ${activityNames[type]}.`
                    );

                }


                if (
                    config.level &&
                    !thesisLevel
                ) {

                    throw new Error(
                        `Sila pilih peringkat tesis untuk ${activityNames[type]}.`
                    );

                }


                if (
                    config.reviewType &&
                    !reviewType
                ) {

                    throw new Error(
                        `Sila pilih jenis penilaian untuk ${activityNames[type]}.`
                    );

                }


                if (
                    config.role &&
                    !role
                ) {

                    throw new Error(
                        `Sila pilih peranan untuk ${activityNames[type]}.`
                    );

                }


                if (!yearValue) {

                    throw new Error(
                        `Sila masukkan tahun untuk ${activityNames[type]}.`
                    );

                }


                const year =
                    parseInt(
                        yearValue
                    );


                if (
                    year < 1900 ||
                    year > 2100
                ) {

                    throw new Error(
                        `Tahun tidak sah untuk ${activityNames[type]}.`
                    );

                }


                // ==========================================
                // EVIDENCE
                // ==========================================

                let evidencePath =
                    null;


                const selectedFile =
                    evidenceInput?.files[0];


                // New file selected
                if (selectedFile) {

                    evidencePath =
                        await uploadEvidence(
                            selectedFile,
                            userId,
                            type
                        );

                }

                // Existing file
                else {

                    evidencePath =
                        row.dataset.evidencePath ||
                        null;

                }


                // Evidence wajib
                if (!evidencePath) {

                    throw new Error(
                        `Sila masukkan Dokumen Sokongan untuk ${activityNames[type]}.`
                    );

                }


                // ==========================================
                // CREATE RECORD
                // ==========================================

                records.push({

                    user_id:
                        userId,

                    category:
                        categoryMap[type],

                    activity_type:
                        activityNames[type],

                    scope:
                        scope,

                    institution:
                        institution,

                    thesis_level:
                        thesisLevel,

                    review_type:
                        reviewType,

                    role:
                        role,

                    year:
                        year,

                    evidence_path:
                        evidencePath

                });

            }

        }


        // ==========================================
        // DELETE OLD DATA
        // ==========================================

        const {
            error: deleteError
        } = await supabaseClient
            .from(
                "academic_visibility"
            )
            .delete()
            .eq(
                "user_id",
                userId
            );


        if (deleteError) {

            throw deleteError;

        }


        // ==========================================
        // INSERT NEW DATA
        // ==========================================

        if (
            records.length > 0
        ) {

            const {
                error: insertError
            } = await supabaseClient
                .from(
                    "academic_visibility"
                )
                .insert(
                    records
                );


            if (insertError) {

                throw insertError;

            }

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        message.innerText =
            "Maklumat Ketampakan Pensyarah berjaya disimpan!";

        message.style.color =
            "green";

    } catch (error) {

        console.error(
            "Ralat:",
            error
        );


        message.innerText =
            "Gagal menyimpan Maklumat Ketampakan Pensyarah: " +
            error.message;

    }

}