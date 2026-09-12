const markdownFiles = {
    "data-exfiltration": {
        title: "Data Exfiltration",
        file: "https://raw.githubusercontent.com/irembezci/data-exfiltration/main/README.md"
    }
};

let currentDocument = null;
let currentSection = null;


// ==============================
// INITIALIZE
// ==============================

document.addEventListener("DOMContentLoaded", () => {
    loadDocument("data-exfiltration");
});


// ==============================
// LOAD MARKDOWN DOCUMENT
// ==============================

async function loadDocument(documentId) {
    const documentInfo = markdownFiles[documentId];

    if (!documentInfo) {
        console.error("Document not found:", documentId);
        return;
    }

    currentDocument = documentId;

    const content = document.getElementById("content");

    content.innerHTML = `
        <div class="loading">
            Loading...
        </div>
    `;

    try {
        const response = await fetch(documentInfo.file);

        if (!response.ok) {
            throw new Error(
                `Could not load Markdown file: ${response.status}`
            );
        }

        const markdown = await response.text();

        renderMarkdown(markdown);
        updateSidebar();

    } catch (error) {
        console.error(error);

        content.innerHTML = `
            <div class="error">
                <h2>Unable to load content</h2>
                <p>
                    The Markdown file could not be loaded.
                </p>
                <code>${documentInfo.file}</code>
            </div>
        `;
    }
}


// ==============================
// RENDER MARKDOWN
// ==============================

function renderMarkdown(markdown) {
    const content = document.getElementById("content");

    content.innerHTML = marked.parse(markdown);

    generateSectionNavigation();

    addCompletionButton();
}


// ==============================
// GENERATE SIDEBAR SECTIONS
// ==============================

function generateSectionNavigation() {
    const content = document.getElementById("content");
    const headings = content.querySelectorAll("h2");

    const sidebar = document.querySelector(".lesson-list");

    if (!sidebar) {
        return;
    }

    sidebar.innerHTML = "";

    headings.forEach((heading, index) => {

        if (!heading.id) {
            heading.id = createSlug(heading.textContent);
        }

        const sectionId = heading.id;

        const item = document.createElement("div");

        item.className = "lesson-item";

        item.dataset.section = sectionId;

        item.innerHTML = `
            <span class="lesson-status"></span>
            <span>${heading.textContent}</span>
        `;

        item.addEventListener("click", () => {
            navigateToSection(sectionId);
        });

        sidebar.appendChild(item);
    });

    updateSidebar();
}


// ==============================
// NAVIGATE TO SECTION
// ==============================

function navigateToSection(sectionId) {

    const heading = document.getElementById(sectionId);

    if (!heading) {
        return;
    }

    currentSection = sectionId;

    heading.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    updateSidebar();
}


// ==============================
// CREATE SLUG
// ==============================

function createSlug(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}


// ==============================
// COMPLETION
// ==============================

function getCompletedSections() {

    return JSON.parse(
        localStorage.getItem("completedSections") || "[]"
    );
}


function saveCompletedSections(sections) {

    localStorage.setItem(
        "completedSections",
        JSON.stringify(sections)
    );
}


function toggleSectionComplete(sectionId) {

    let completed = getCompletedSections();

    if (completed.includes(sectionId)) {

        completed = completed.filter(
            id => id !== sectionId
        );

    } else {

        completed.push(sectionId);
    }

    saveCompletedSections(completed);

    updateSidebar();
    updateProgress();
}


// ==============================
// SIDEBAR
// ==============================

function updateSidebar() {

    const completed = getCompletedSections();

    document
        .querySelectorAll(".lesson-item")
        .forEach(item => {

            const sectionId = item.dataset.section;

            item.classList.toggle(
                "completed",
                completed.includes(sectionId)
            );

            item.classList.toggle(
                "active",
                sectionId === currentSection
            );

            const status =
                item.querySelector(".lesson-status");

            if (status) {
                status.textContent =
                    completed.includes(sectionId)
                        ? "✓"
                        : "";
            }
        });
}


// ==============================
// COMPLETION BUTTON
// ==============================

function addCompletionButton() {

    const content = document.getElementById("content");

    const headings = content.querySelectorAll("h2");

    headings.forEach(heading => {

        const sectionId = heading.id;

        const button = document.createElement("button");

        button.className = "complete-section";

        button.textContent = "Mark as Complete";

        button.addEventListener("click", () => {

            toggleSectionComplete(sectionId);

            const completed =
                getCompletedSections();

            button.textContent =
                completed.includes(sectionId)
                    ? "✓ Completed"
                    : "Mark as Complete";
        });

        heading.insertAdjacentElement(
            "afterend",
            button
        );
    });
}


// ==============================
// PROGRESS
// ==============================

function updateProgress() {

    const total =
        document.querySelectorAll(
            ".lesson-item"
        ).length;

    if (total === 0) {
        return;
    }

    const completed =
        getCompletedSections();

    const visibleCompleted =
        [...document.querySelectorAll(".lesson-item")]
            .filter(item =>
                completed.includes(
                    item.dataset.section
                )
            ).length;

    const percentage =
        Math.round(
            (visibleCompleted / total) * 100
        );

    const progressText =
        document.getElementById("progressText");

    const progressFill =
        document.getElementById("progressFill");

    const progressCount =
        document.getElementById("progressCount");

    if (progressText) {
        progressText.textContent =
            `${percentage}% Complete`;
    }

    if (progressFill) {
        progressFill.style.width =
            `${percentage}%`;
    }

    if (progressCount) {
        progressCount.textContent =
            `${visibleCompleted} / ${total} sections`;
    }
}
