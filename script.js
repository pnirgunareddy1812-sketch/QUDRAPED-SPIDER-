"use strict";

/*
    This password is a basic browser-side access screen.
    It is not a replacement for secure server-side authentication.
*/
const DASHBOARD_PASSWORD = "963369";

let sensorDashboardUrl = "";
let cameraPageUrl = "";

let sensorZoom = 100;
let cameraZoom = 100;

const MIN_ZOOM = 50;
const MAX_ZOOM = 180;
const ZOOM_STEP = 10;

const elements = {
    loginScreen: document.getElementById("loginScreen"),
    dashboardScreen: document.getElementById("dashboardScreen"),
    passwordInput: document.getElementById("passwordInput"),
    loginButton: document.getElementById("loginButton"),
    loginError: document.getElementById("loginError"),
    logoutButton: document.getElementById("logoutButton"),

    sensorDashboardUrl: document.getElementById("sensorDashboardUrl"),
    cameraUrl: document.getElementById("cameraUrl"),
    loadSensorButton: document.getElementById("loadSensorButton"),
    loadCameraButton: document.getElementById("loadCameraButton"),

    sensorFrame: document.getElementById("sensorFrame"),
    cameraFrame: document.getElementById("cameraFrame"),

    sensorFramePanel: document.getElementById("sensorFramePanel"),
    cameraFramePanel: document.getElementById("cameraFramePanel"),

    sensorFrameScaleArea: document.getElementById("sensorFrameScaleArea"),
    cameraFrameScaleArea: document.getElementById("cameraFrameScaleArea"),

    sensorPlaceholder: document.getElementById("sensorPlaceholder"),
    cameraPlaceholder: document.getElementById("cameraPlaceholder"),

    sensorStatus: document.getElementById("sensorStatus"),
    cameraStatus: document.getElementById("cameraStatus"),

    sensorStatusText: document.getElementById("sensorStatusText"),
    cameraStatusText: document.getElementById("cameraStatusText"),

    sensorZoomOut: document.getElementById("sensorZoomOut"),
    sensorZoomIn: document.getElementById("sensorZoomIn"),
    sensorResetZoom: document.getElementById("sensorResetZoom"),
    sensorZoomValue: document.getElementById("sensorZoomValue"),
    sensorRefresh: document.getElementById("sensorRefresh"),
    sensorFullscreen: document.getElementById("sensorFullscreen"),
    sensorOpenTab: document.getElementById("sensorOpenTab"),

    cameraZoomOut: document.getElementById("cameraZoomOut"),
    cameraZoomIn: document.getElementById("cameraZoomIn"),
    cameraResetZoom: document.getElementById("cameraResetZoom"),
    cameraZoomValue: document.getElementById("cameraZoomValue"),
    cameraRefresh: document.getElementById("cameraRefresh"),
    cameraFullscreen: document.getElementById("cameraFullscreen"),
    cameraOpenTab: document.getElementById("cameraOpenTab")
};

function normalizeUrl(value) {
    let url = value.trim();

    if (url === "") {
        return "";
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }

    return url.replace(/\/+$/, "");
}

function isValidHttpUrl(url) {
    try {
        const parsedUrl = new URL(url);

        return (
            parsedUrl.protocol === "http:" ||
            parsedUrl.protocol === "https:"
        );
    } catch (error) {
        return false;
    }
}

function updatePanelStatus(statusElement, textElement, statusClass, text) {
    statusElement.className = "panel-status " + statusClass;
    textElement.textContent = text;
}

function setSensorToolsEnabled(enabled) {
    elements.sensorZoomOut.disabled = !enabled;
    elements.sensorZoomIn.disabled = !enabled;
    elements.sensorResetZoom.disabled = !enabled;
    elements.sensorRefresh.disabled = !enabled;
    elements.sensorFullscreen.disabled = !enabled;
    elements.sensorOpenTab.disabled = !enabled;
}

function setCameraToolsEnabled(enabled) {
    elements.cameraZoomOut.disabled = !enabled;
    elements.cameraZoomIn.disabled = !enabled;
    elements.cameraResetZoom.disabled = !enabled;
    elements.cameraRefresh.disabled = !enabled;
    elements.cameraFullscreen.disabled = !enabled;
    elements.cameraOpenTab.disabled = !enabled;
}

function updateZoom(frameScaleArea, zoomValueElement, zoomPercent) {
    const scale = zoomPercent / 100;

    frameScaleArea.style.transform = "scale(" + scale + ")";
    frameScaleArea.style.width = (100 / scale) + "%";
    frameScaleArea.style.height = (100 / scale) + "%";

    zoomValueElement.textContent = zoomPercent + "%";
}

function changeSensorZoom(amount) {
    sensorZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, sensorZoom + amount));

    updateZoom(
        elements.sensorFrameScaleArea,
        elements.sensorZoomValue,
        sensorZoom
    );
}

function changeCameraZoom(amount) {
    cameraZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cameraZoom + amount));

    updateZoom(
        elements.cameraFrameScaleArea,
        elements.cameraZoomValue,
        cameraZoom
    );
}

function resetSensorZoom() {
    sensorZoom = 100;

    updateZoom(
        elements.sensorFrameScaleArea,
        elements.sensorZoomValue,
        sensorZoom
    );
}

function resetCameraZoom() {
    cameraZoom = 100;

    updateZoom(
        elements.cameraFrameScaleArea,
        elements.cameraZoomValue,
        cameraZoom
    );
}

function loadSensorDashboard() {
    const enteredUrl = normalizeUrl(elements.sensorDashboardUrl.value);

    if (enteredUrl === "") {
        alert("Please enter the Sensor ESP32 Dashboard URL.");
        elements.sensorDashboardUrl.focus();
        return;
    }

    if (!isValidHttpUrl(enteredUrl)) {
        updatePanelStatus(
            elements.sensorStatus,
            elements.sensorStatusText,
            "failed",
            "Invalid URL"
        );

        alert("Enter a valid Sensor ESP32 HTTP or HTTPS URL.");
        return;
    }

    sensorDashboardUrl = enteredUrl;
    elements.sensorDashboardUrl.value = sensorDashboardUrl;

    updatePanelStatus(
        elements.sensorStatus,
        elements.sensorStatusText,
        "loading",
        "Loading..."
    );

    elements.sensorFrameScaleArea.classList.add("visible");
    elements.sensorPlaceholder.classList.add("hidden");

    resetSensorZoom();

    elements.sensorFrame.src = sensorDashboardUrl;

    setSensorToolsEnabled(true);
}

function loadCameraPage() {
    const enteredUrl = normalizeUrl(elements.cameraUrl.value);

    if (enteredUrl === "") {
        alert("Please enter the ESP32-CAM URL.");
        elements.cameraUrl.focus();
        return;
    }

    if (!isValidHttpUrl(enteredUrl)) {
        updatePanelStatus(
            elements.cameraStatus,
            elements.cameraStatusText,
            "failed",
            "Invalid URL"
        );

        alert("Enter a valid ESP32-CAM HTTP or HTTPS URL.");
        return;
    }

    cameraPageUrl = enteredUrl;
    elements.cameraUrl.value = cameraPageUrl;

    updatePanelStatus(
        elements.cameraStatus,
        elements.cameraStatusText,
        "loading",
        "Loading..."
    );

    elements.cameraFrameScaleArea.classList.add("visible");
    elements.cameraPlaceholder.classList.add("hidden");

    resetCameraZoom();

    elements.cameraFrame.src = cameraPageUrl;

    setCameraToolsEnabled(true);
}

function refreshSensorDashboard() {
    if (sensorDashboardUrl === "") {
        return;
    }

    updatePanelStatus(
        elements.sensorStatus,
        elements.sensorStatusText,
        "loading",
        "Refreshing..."
    );

    const separator = sensorDashboardUrl.includes("?") ? "&" : "?";

    elements.sensorFrame.src =
        sensorDashboardUrl +
        separator +
        "refresh=" +
        Date.now();
}

function refreshCameraPage() {
    if (cameraPageUrl === "") {
        return;
    }

    updatePanelStatus(
        elements.cameraStatus,
        elements.cameraStatusText,
        "loading",
        "Refreshing..."
    );

    const separator = cameraPageUrl.includes("?") ? "&" : "?";

    elements.cameraFrame.src =
        cameraPageUrl +
        separator +
        "refresh=" +
        Date.now();
}

function openInNewTab(url) {
    if (url === "") {
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
}

function openFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else {
        alert("Fullscreen mode is not supported by this browser.");
    }
}

function unlockDashboard() {
    const enteredPassword = elements.passwordInput.value;

    if (enteredPassword === DASHBOARD_PASSWORD) {
        sessionStorage.setItem("coalMineDashboardAccess", "granted");

        elements.loginError.textContent = "";
        elements.loginScreen.classList.add("hidden");
        elements.dashboardScreen.classList.remove("hidden");

        elements.passwordInput.value = "";
        return;
    }

    elements.loginError.textContent = "Incorrect password. Try again.";
    elements.passwordInput.value = "";
    elements.passwordInput.focus();
}

function logoutDashboard() {
    sessionStorage.removeItem("coalMineDashboardAccess");

    elements.dashboardScreen.classList.add("hidden");
    elements.loginScreen.classList.remove("hidden");

    elements.passwordInput.value = "";
    elements.loginError.textContent = "";
    elements.passwordInput.focus();
}

function restoreLoginSession() {
    const accessGranted = sessionStorage.getItem("coalMineDashboardAccess");

    if (accessGranted === "granted") {
        elements.loginScreen.classList.add("hidden");
        elements.dashboardScreen.classList.remove("hidden");
    } else {
        elements.loginScreen.classList.remove("hidden");
        elements.dashboardScreen.classList.add("hidden");
        elements.passwordInput.focus();
    }
}

/* Sensor iframe events */

elements.sensorFrame.addEventListener("load", () => {
    if (sensorDashboardUrl !== "") {
        updatePanelStatus(
            elements.sensorStatus,
            elements.sensorStatusText,
            "loaded",
            "Page loaded"
        );
    }
});

elements.sensorFrame.addEventListener("error", () => {
    updatePanelStatus(
        elements.sensorStatus,
        elements.sensorStatusText,
        "failed",
        "Load failed"
    );
});

/* ESP32-CAM iframe events */

elements.cameraFrame.addEventListener("load", () => {
    if (cameraPageUrl !== "") {
        updatePanelStatus(
            elements.cameraStatus,
            elements.cameraStatusText,
            "loaded",
            "Page loaded"
        );
    }
});

elements.cameraFrame.addEventListener("error", () => {
    updatePanelStatus(
        elements.cameraStatus,
        elements.cameraStatusText,
        "failed",
        "Load failed"
    );
});

/* Login events */

elements.loginButton.addEventListener("click", unlockDashboard);

elements.passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        unlockDashboard();
    }
});

elements.logoutButton.addEventListener("click", logoutDashboard);

/* Load URL events */

elements.loadSensorButton.addEventListener("click", loadSensorDashboard);
elements.loadCameraButton.addEventListener("click", loadCameraPage);

elements.sensorDashboardUrl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        loadSensorDashboard();
    }
});

elements.cameraUrl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        loadCameraPage();
    }
});

/* Sensor tools */

elements.sensorZoomOut.addEventListener("click", () => {
    changeSensorZoom(-ZOOM_STEP);
});

elements.sensorZoomIn.addEventListener("click", () => {
    changeSensorZoom(ZOOM_STEP);
});

elements.sensorResetZoom.addEventListener("click", resetSensorZoom);

elements.sensorRefresh.addEventListener("click", refreshSensorDashboard);

elements.sensorFullscreen.addEventListener("click", () => {
    openFullscreen(elements.sensorFramePanel);
});

elements.sensorOpenTab.addEventListener("click", () => {
    openInNewTab(sensorDashboardUrl);
});

/* Camera tools */

elements.cameraZoomOut.addEventListener("click", () => {
    changeCameraZoom(-ZOOM_STEP);
});

elements.cameraZoomIn.addEventListener("click", () => {
    changeCameraZoom(ZOOM_STEP);
});

elements.cameraResetZoom.addEventListener("click", resetCameraZoom);

elements.cameraRefresh.addEventListener("click", refreshCameraPage);

elements.cameraFullscreen.addEventListener("click", () => {
    openFullscreen(elements.cameraFramePanel);
});

elements.cameraOpenTab.addEventListener("click", () => {
    openInNewTab(cameraPageUrl);
});

/* Start page */

restoreLoginSession();
resetSensorZoom();
resetCameraZoom();