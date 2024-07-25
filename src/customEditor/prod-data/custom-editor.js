"strict-mode";

(() => {
    let vscode = acquireVsCodeApi();

    function sendMessage(message) {
        vscode.postMessage(message);
    }

    function sendHierarchyFoldingMessage(fileId) {
        sendMessage({
            command: "fold-hierarchy",
            fileId: fileId
        });
    }


    let mainContainer = document.getElementById("main-container");
    let gitStatusText = document.getElementById("git-status-text");
    let hierarchyContainer = document.getElementById("hierarchy");

    let gitStates = {
        none: {
            message: "",
            mainContainerClass: "main-container"
        },
        mergeConflict: {
            message: "File has merge conflicts",
            mainContainerClass: "main-container git-merge-conflict"
        },
        fileChanged: {
            message: "Changed",
            mainContainerClass: "main-container git-file-changed"
        },
        fileAdded: {
            message: "Added",
            mainContainerClass: "main-container git-file-added"
        }
    };

    /** @param {{message:string, mainContainerClass:string}} state */
    function setGitStatus(state) {
        gitStatusText.textContent = state.message;
        mainContainer.className = state.mainContainerClass;
    }

    function fillHierarchy(hierarchy) {
        hierarchyContainer.innerHTML = gameObjectTreeRecursive(hierarchy.rootGameObjects);
        setPaddingLeft();
        addClickEventToHierarchy();
    }

    let chevronRight = "\uEAB6";
    let chevronDown = "\uEAB4";

    function gameObjectTreeRecursive(gameObjects, level = 0) {
        let result = "";

        for (let gameObject of gameObjects) {
            let chevron = "";
            if (gameObject.children.length > 0) {
                chevron = chevronDown;
            }

            result += `
            <li level=${level} fileId="${gameObject.document.fileId}" childCount="${gameObject.children.length}">
                <span class='tree-view-chevron codicon codicon-'>
                    ${chevron}
                </span>
                <span class="tree-view-text">
                    ${gameObject.document.content.GameObject.m_Name}
                </span>
            </li>`;
            
            if (gameObject.children.length > 0) {
                result += "<ul>";
                result += gameObjectTreeRecursive(gameObject.children, level + 1);
                result += "</ul>";
            }
        }
        return result;
    }

    // for all li elements, add click event to circle through classes, "open" -> "closed" -> "" -> "open" -> ...
    function addClickEventToHierarchy() {
        let liElements = document.querySelectorAll("#hierarchy li");
        for (let liElement of liElements) {
            liElement.getElementsByClassName("tree-view-chevron")[0]?.addEventListener("click", () => {
                sendHierarchyFoldingMessage(liElement.getAttribute("fileId"));
            });

            liElement.getElementsByClassName("tree-view-text")[0]?.addEventListener("click", () => {
            });
        }
    }

    // for all li elements, apply the correct padding-left based on the level attribute
    function setPaddingLeft() {
        let liElements = document.querySelectorAll("#hierarchy li");
        for (let liElement of liElements) {
            let level = liElement.getAttribute("level");
            liElement.style.paddingLeft = `${(level * 10) + 5}px`;
        }
    }

    function applyFolds(collapsed) {
        let liElements = document.querySelectorAll("#hierarchy li");
        for (let liElement of liElements) {
            if(liElement.getAttribute("childCount") === "0") {
                continue;
            }

            let fileId = liElement.getAttribute("fileId");
            if (collapsed.includes(fileId)) {
                liElement.classList.add("collapsed");
                liElement.getElementsByClassName("tree-view-chevron")[0].textContent = chevronRight;
            } else {
                liElement.classList.remove("collapsed");
                liElement.getElementsByClassName("tree-view-chevron")[0].textContent = chevronDown;
            }
        }
    }


    // setup messages
    window.addEventListener("message", event => {
        const message = event.data;
        switch (message.command) {
            case "fill-hierarchy":
                fillHierarchy(message.hierarchy);
                break;
            case "apply-folds":
                applyFolds(message.collapsed);
                break;
        }
    });

    // create timer to switch between classes
    //let timer = setInterval(() => {
    //    let randomState = Math.floor(Math.random() * 4);
    //    let state = Object.values(gitStates)[randomState];
    //    setGitStatus(state);
    //}, 1000);

})();