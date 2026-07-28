// --- Ocean Recruitment & Bias-Free Portal Logic ---

// Memory database of candidates
let candidates = [];

// Pre-defined mock data to ensure evaluator has items to grade immediately
const mockCandidates = [
    {
        id: "NTU-OCEAN-2026-X1",
        name: "Confidential Candidate A",
        email: "hidden-a@example.com",
        writing: "This velocity drop at 15 km depth beneath the Okinawa Trough likely represents regional crustal extension and high thermal gradient associated with active back-arc basin rifting. The intrusion of hot magma or localized partial melting within the continental crust could dramatically reduce shear wave and compressional wave velocities. Further petrological analysis is required to model the exact fluid/melt volume fraction in the crust.",
        code: "def run_simulation(grid_size, time_steps):\n    u = np.zeros(grid_size)\n    v = np.zeros(grid_size)\n    \n    # Setup PML (Perfect Matching Layer) damping profile\n    damp = np.zeros(grid_size)\n    pml_width = 20\n    for i in range(pml_width):\n        damp[i] = ( (pml_width - i) / pml_width ) ** 2 * 0.1\n        damp[-i-1] = ( (pml_width - i) / pml_width ) ** 2 * 0.1\n        \n    for t in range(time_steps):\n        # Incorporate damping directly into wave field updates to prevent boundary reflection\n        u[1:-1] = (2 * u[1:-1] - v[1:-1] + dt**2 * c**2 * np.diff(u, 2)) * (1.0 - damp[1:-1])\n        \n    return u",
        system: "To establish a secure lab file server, I would deploy a Linux-based server (e.g., Rocky Linux) inside the NTU campus firewall, utilizing SSH keys for access control. For backups, I would configure a daily cron programme to execute an rsync script that synchronises geophysical datasets to a secondary NAS. An off-site backup would be automated weekly using encrypted cloud storage.",
        status: "Pending Review",
        scores: null,
        faeReflection: ""
    },
    {
        id: "NTU-OCEAN-2026-X2",
        name: "Confidential Candidate B",
        email: "hidden-b@example.com",
        writing: "The velocity drop at 15 km is indicative of an anomalous low-velocity zone. In active tectonic zones such as the Okinawa Trough, this could point to thermal anomalies or hydrothermal circulation systems. Velocity decreases are caused by high temperatures and cracking. We can investigate this utilizing high-resolution regional seismic tomography.",
        code: "def run_simulation(grid_size, time_steps):\n    # Simple boundary absorption by setting boundary values to zero\n    # (This is basic and still causes minor reflections)\n    u[0] = 0\n    u[-1] = 0",
        system: "I will setup a web server using Apache/Nginx. For data, I can schedule a Python script that copies files to a backup drive every night.",
        status: "Reviewed",
        scores: { writing: 3, code: 2, system: 3, total: 8 },
        faeReflection: "Accounted for potential lack of deep Python experience since the candidate has a strong geology background."
    }
];

// Initialize application state
window.onload = function() {
    // Load mock data if no storage exists
    if (!localStorage.getItem("ntu_ocean_candidates")) {
        candidates = [...mockCandidates];
        saveToStorage();
    } else {
        candidates = JSON.parse(localStorage.getItem("ntu_ocean_candidates"));
    }
    
    renderCandidateList();
    renderLeaderboard();
};

function saveToStorage() {
    localStorage.setItem("ntu_ocean_candidates", JSON.stringify(candidates));
}

// Switching primary tabs (Candidate vs Evaluator)
function switchTab(tabId) {
    document.querySelectorAll('.portal-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`portal-${tabId}`).classList.add('active');
    document.getElementById(`nav-${tabId}`).classList.add('active');
}

// Switching subcontent tabs in grading panel
function switchSubTab(subTabId) {
    document.querySelectorAll('.sub-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.sub-content').forEach(content => {
        content.classList.remove('active');
    });

    // Find the event source button and activate it
    const activeBtn = Array.from(document.querySelectorAll('.sub-tab')).find(b => b.textContent.toLowerCase().includes(subTabId));
    if (activeBtn) activeBtn.classList.add('active');
    
    document.getElementById(`subcontent-${subTabId}`).classList.add('active');
}

// Update Range score text indicators
const scoreLabels = {
    1: "Unsatisfactory",
    2: "Needs Development",
    3: "Competent",
    4: "Very Good",
    5: "Outstanding"
};

function updateScoreLabel(field) {
    const val = document.getElementById(`score-${field}`).value;
    document.getElementById(`val-${field}`).textContent = `${val}/5 (${scoreLabels[val]})`;
}

// Handle candidate registration / submission
function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const randomId = `NTU-OCEAN-2026-X${Math.floor(100 + Math.random() * 900)}`;
    
    const newCandidate = {
        id: randomId,
        name: document.getElementById("candidate-name").value,
        email: document.getElementById("candidate-email").value,
        writing: document.getElementById("sample-writing").value,
        code: document.getElementById("sample-code").value,
        system: document.getElementById("sample-system").value,
        status: "Pending Review",
        scores: null,
        faeReflection: ""
    };
    
    candidates.push(newCandidate);
    saveToStorage();
    
    showToast(`Application submitted successfully! Your anonymous ID is ${randomId}`);
    
    // Reset form
    document.getElementById("application-form").reset();
    
    // Refresh views
    renderCandidateList();
    renderLeaderboard();
}

// Render candidate list in the sidebar
function renderCandidateList() {
    const listElement = document.getElementById("candidate-list");
    listElement.innerHTML = "";
    
    candidates.forEach(c => {
        const li = document.createElement("li");
        li.className = "candidate-item";
        li.id = `item-${c.id}`;
        li.onclick = () => selectCandidate(c.id);
        
        const isReviewed = c.status === "Reviewed";
        const statusClass = isReviewed ? "reviewed" : "pending";
        const statusText = isReviewed ? "Reviewed" : "Pending";
        
        li.innerHTML = `
            <span class="candidate-item-id">${c.id}</span>
            <span class="badge-status ${statusClass}">${statusText}</span>
        `;
        listElement.appendChild(li);
    });
}

let activeCandidateId = null;

// Select a candidate to review
function selectCandidate(id) {
    activeCandidateId = id;
    
    // Highlight list item
    document.querySelectorAll(".candidate-item").forEach(item => {
        item.classList.remove("active");
    });
    document.getElementById(`item-${id}`).classList.add("active");
    
    // Show grading panel
    document.getElementById("no-candidate-selected").style.display = "none";
    document.getElementById("active-grading").style.display = "block";
    
    const candidate = candidates.find(c => c.id === id);
    document.getElementById("display-candidate-id").textContent = candidate.id;
    document.getElementById("display-candidate-status").textContent = candidate.status;
    
    // Fill text answers
    document.getElementById("resp-writing").textContent = candidate.writing;
    document.getElementById("resp-code").textContent = candidate.code;
    document.getElementById("resp-system").textContent = candidate.system;
    
    // Reset or load grading values
    if (candidate.scores) {
        document.getElementById("score-writing").value = candidate.scores.writing;
        document.getElementById("score-code").value = candidate.scores.code;
        document.getElementById("score-system").value = candidate.scores.system;
        document.getElementById("fae-reflection").value = candidate.faeReflection || "";
        
        document.getElementById("fae-check-1").checked = true;
        document.getElementById("fae-check-2").checked = true;
    } else {
        document.getElementById("score-writing").value = 3;
        document.getElementById("score-code").value = 3;
        document.getElementById("score-system").value = 3;
        document.getElementById("fae-reflection").value = "";
        
        document.getElementById("fae-check-1").checked = false;
        document.getElementById("fae-check-2").checked = false;
    }
    
    // Update display labels
    updateScoreLabel("writing");
    updateScoreLabel("code");
    updateScoreLabel("system");
    
    // Default to first sub tab
    switchSubTab("writing");
}

// Submit score with FAE validation
function submitCandidateGrade(e) {
    e.preventDefault();
    
    if (!activeCandidateId) return;
    
    const candidate = candidates.find(c => c.id === activeCandidateId);
    
    const scoreWriting = parseInt(document.getElementById("score-writing").value);
    const scoreCode = parseInt(document.getElementById("score-code").value);
    const scoreSystem = parseInt(document.getElementById("score-system").value);
    
    candidate.scores = {
        writing: scoreWriting,
        code: scoreCode,
        system: scoreSystem,
        total: scoreWriting + scoreCode + scoreSystem
    };
    
    candidate.status = "Reviewed";
    candidate.faeReflection = document.getElementById("fae-reflection").value;
    
    saveToStorage();
    showToast(`Calibrated scoring for candidate ${candidate.id} saved.`);
    
    // Update views
    renderCandidateList();
    renderLeaderboard();
    selectCandidate(candidate.id);
}

// Render rankings table
function renderLeaderboard() {
    const body = document.getElementById("leaderboard-body");
    body.innerHTML = "";
    
    // Filter and sort candidates who have been reviewed
    const rankedCandidates = candidates
        .filter(c => c.status === "Reviewed")
        .sort((a, b) => b.scores.total - a.scores.total);
        
    if (rankedCandidates.length === 0) {
        body.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted);">No candidates reviewed yet.</td></tr>`;
        return;
    }
    
    rankedCandidates.forEach((c, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>#${index + 1}</strong></td>
            <td>${c.id}</td>
            <td>${c.scores.writing}/5</td>
            <td>${c.scores.code}/5</td>
            <td>${c.scores.system}/5</td>
            <td><strong>${c.scores.total}/15</strong></td>
        `;
        body.appendChild(row);
    });
}

// System Toast notification utility
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.display = "block";
    
    setTimeout(() => {
        toast.style.display = "none";
    }, 4500);
}
