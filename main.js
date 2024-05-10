function fetchSvgSprite() {
    const iconUrl = "./tabler-icon.svg";
    return fetch(iconUrl)
    .then((response) => response.text())
    .then((svgText) => {
        const svgContainer = document.querySelector(".tabler-svg");
        svgContainer.insertAdjacentHTML("beforeend", svgText);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSvgSprite().then(() => {
        generateIconList()
        handleSearchForm();
    }).catch((error) => {
        const loadingText = document.querySelector(".loading-text");
        loadingText.textContent = "Error loading SVG icons";
        console.error("Error loading SVG icons:", error);
    });
});


let angle = 0;
let animationFrameId = null;

function updateLoadingProgress(current, total) {
    const loadingText = document.querySelector(".loading-text");
    const progress = (current / total * 100).toFixed(0);
    loadingText.textContent = `${progress}%`;
    startRotation();

    if (progress === "100") {
        cancelAnimationFrame(animationFrameId);
        document.querySelector(".loading-bar-container").style.display = "none";
        addIconClickListener();
    }
}

function startRotation() {
    const svgElement = document.querySelector(".loading-bar-container svg");

    function rotate() {
        angle = (angle + 20) % 360;
        svgElement.style.transform = `rotate(${angle}deg)`;
        animationFrameId = requestAnimationFrame(rotate);
    }

    if (!animationFrameId) {
        rotate();
    }
}

function processSymbols(symbols, index = 0) {
    const batchSize = 100; 
    const iconContainer = document.querySelector(".icon-container");

    for (let i = 0; i < batchSize && index < symbols.length; i++, index++) {
        const symbol = symbols[index];
        const iconTitle = symbol.getAttribute("id");
        const groupKey = iconTitle.split("-").slice(0, 2).join("-");

        if (!iconContainer.groupContainers[groupKey]) {
            iconContainer.groupContainers[groupKey] = createIconGroupContainer(groupKey.replace("tabler-", "").toUpperCase());
            iconContainer.appendChild(iconContainer.groupContainers[groupKey]);
        }

        const displayedIconTitle = iconTitle.replace("tabler-", "").replace("-outline", "").replace("-filled", "");
        const iconWrap = createIconItem(iconTitle, displayedIconTitle);
        iconContainer.groupContainers[groupKey].appendChild(iconWrap);
    }

    updateLoadingProgress(index, symbols.length);
    if (index < symbols.length) {
        requestAnimationFrame(() => processSymbols(symbols, index));
    }
}

function generateIconList() {
    const symbols = Array.from(document.querySelectorAll("symbol"));
    symbols.sort((a, b) => a.getAttribute("id").localeCompare(b.getAttribute("id")));
    const iconContainer = document.querySelector(".icon-container");
    iconContainer.groupContainers = {};

    requestAnimationFrame(() => processSymbols(symbols));
}

function createIconGroupContainer(groupTitleText) {
    const groupContainer = document.createElement("div");
    groupContainer.classList.add("icon-group");

    const groupTitle = document.createElement("div");
    groupTitle.classList.add("group-title");
    groupTitle.textContent = groupTitleText;

    groupContainer.appendChild(groupTitle);
    return groupContainer;
}

function createIconItem(iconTitle, displayedIconTitle) {
    const iconWrap = createIconBtn();
    const itemTitle = createItemTitleSpan(iconTitle, displayedIconTitle);
    const newSvg = createSvgElement(iconTitle);

    iconWrap.appendChild(newSvg);
    iconWrap.appendChild(itemTitle);

    return iconWrap;
}

function createIconBtn() {
    const button = document.createElement("button");
    button.classList.add("icon-item");
    return button;
}

function createItemTitleSpan(iconTitle, displayedIconTitle) {
    const span = document.createElement("span");
    span.classList.add("item-title");
    span.textContent = displayedIconTitle;
    span.dataset.iconName = iconTitle;
    return span;
}

function createSvgElement(iconTitle) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("tabler-icon");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${iconTitle}`);
    svg.appendChild(use);
    return svg;
}

function showPopUp(iconName) {
    const popUpWrap = createPopUpWrap(iconName);
    document.body.appendChild(popUpWrap);
    hljs.highlightAll();
    popUpWrap.style.display = "flex";

    popUpWrap.addEventListener("click", (e) => {
        if (e.target === popUpWrap) {
            document.body.removeChild(popUpWrap);
        }
    });
}

function createPopUpWrap(iconName) {
    const popUpWrap = createDivClass("pop-up-wrap");
    const popUp = createDivClass("pop-up");
    const popUpInner = createDivClass("pop-up-inner");
    const popUpTitle = createDivText("pop-up-title", iconName);
    const popUpMarkup = createPopUpMarkup(iconName);
    const popUpIcon = createPopUpIcon(iconName);

    assemblePopUp(popUp, popUpInner, popUpIcon, popUpTitle, popUpMarkup);
    popUpWrap.appendChild(popUp);

    addCopyBtn(popUpTitle);
    addCopyBtn(popUpMarkup);

    return popUpWrap;
}

function createDivClass(className) {
    const div = document.createElement("div");
    div.classList.add(className);
    return div;
}

function createDivText(className, text) {
    const div = createDivClass(className);
    div.textContent = text;
    return div;
}

function createPopUpMarkup(iconName) {
    const markup = createDivClass("pop-up-markup");
    const svgMarkup = `<pre><code>&lt;svg class="tabler-icon" width="24" height="24" viewBox="0 0 24 24"&gt;&lt;use href="#${iconName}"&gt;&lt;/use&gt;&lt;/svg&gt;</code></pre>`;
    markup.insertAdjacentHTML("beforeend", svgMarkup);
    return markup;
}

function createPopUpIcon(iconName) {
    const iconDiv = createDivClass("pop-up-icon");
    const svgIcon = `<svg class="tabler-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#${iconName}"></use></svg>`;
    iconDiv.insertAdjacentHTML("beforeend", svgIcon);
    return iconDiv;
}

function assemblePopUp(popUp, popUpInner, popUpIcon, popUpTitle, popUpMarkup) {
    popUp.appendChild(popUpIcon);
    popUp.appendChild(popUpInner);
    popUpInner.appendChild(popUpTitle);
    popUpInner.appendChild(popUpMarkup);
}

function addIconClickListener() {
    document.querySelector(".icon-container").addEventListener("click", (event) => {
        let iconItem = event.target.closest(".icon-item");
        if (iconItem) {
            const iconName = iconItem.querySelector(".item-title").dataset.iconName;
            if (!document.querySelector(".pop-up-wrap")) {
                showPopUp(iconName);
            }
        }
    });
}
function addCopyBtn(element) {
    const copyBtn = createCopyBtn();
    attachCopyFunctionality(copyBtn, element);
    element.appendChild(copyBtn);
}

function createCopyBtn() {
    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.classList.add("copy-btn");
    copyBtn.insertAdjacentHTML("beforeend", `
        <svg class="tabler-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2px">
            <use href="#tabler-copy-outline"></use>
        </svg>`
    );
    return copyBtn;
}

function attachCopyFunctionality(copyBtn, element) {
    copyBtn.addEventListener("click", async () => {
        try {
            await copyTextToClipboard(element.textContent);
            displayCopyConfirmation(copyBtn);
        } catch (error) {
            alert("다시 시도해주세요.");
            console.error("Copy failed", error);
        }
    });
}

async function copyTextToClipboard(text) {
    const trimmedText = text.trim();
    await navigator.clipboard.writeText(trimmedText);
}

function displayCopyConfirmation(copyBtn) {
    copyBtn.classList.add("complete");
    const copyMsg = document.createElement("span");
    copyMsg.textContent = "Copied~!";
    copyMsg.classList.add("copy-msg");
    copyBtn.appendChild(copyMsg);

    setTimeout(() => {
        copyBtn.classList.remove("complete");
        copyBtn.removeChild(copyMsg);
    }, 2000);
}

function handleSearchForm() {
    const searchBtn = document.querySelector(".search-btn");
    const searchInput = document.querySelector(".search-input");

    attachSearchListeners(searchBtn, searchInput);
}

function attachSearchListeners(searchBtn, searchInput) {
    searchBtn.addEventListener("click", executeSearch);
    searchInput.addEventListener("input", executeSearch);
}

function executeSearch() {
    const searchTerm = getSearchTerm();
    filterIconsByTerm(searchTerm);
}

function getSearchTerm() {
    const searchInput = document.querySelector(".search-input");
    return searchInput.value.toLowerCase();
}

function filterIconsByTerm(searchTerm) {
    const iconGroups = document.querySelectorAll("div.icon-group");

    iconGroups.forEach((group) => {
        filterIconsInGroup(group, searchTerm);
        toggleGroupVisibility(group);
    });
}

function filterIconsInGroup(group, searchTerm) {
    const icons = group.querySelectorAll(".icon-item");
    let hasVisibleIcons = false;

    icons.forEach((icon) => {
        const isVisible = checkIconAgainstSearchTerm(icon, searchTerm, group);
        icon.style.display = isVisible ? "flex" : "none";
        hasVisibleIcons = hasVisibleIcons || isVisible;
    });

    group.dataset.hasVisibleIcons = hasVisibleIcons;
}

function toggleGroupVisibility(group) {
    const hasVisibleIcons = group.dataset.hasVisibleIcons === "true";
    group.style.display = hasVisibleIcons ? "grid" : "none";
}

function checkIconAgainstSearchTerm(icon, searchTerm, group) {
    const title = icon.querySelector(".item-title").textContent.toLowerCase();
    const groupTitle = group.querySelector(".group-title").textContent.toLowerCase();
    return title.includes(searchTerm) || groupTitle.includes(searchTerm);
}