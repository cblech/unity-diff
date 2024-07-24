"strict-mode";

(() => {
    let vscode = acquireVsCodeApi();

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
        addClickEventToHierarchy();
        setPaddingLeft();
    }

    function gameObjectTreeRecursive(gameObjects, level = 0) {
        let result = "";
        let chevronRight = "\uEAB6";
        let chevronDown = "\uEAB4";

        for (let gameObject of gameObjects) {
            let chevron = "";
            if (gameObject.children.length > 0) {
                chevron = chevronDown;
            }

            result += `
            <li level=${level}>
                <span class='codicon codicon-'>
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
            liElement.addEventListener("click", () => {
                let classes = ["opened", "closed", ""];
                let currentClass = liElement.className;
                let currentIndex = classes.indexOf(currentClass);
                let nextIndex = (currentIndex + 1) % classes.length;
                liElement.className = classes[nextIndex];
            });
        }
    }

    // for all li elements, apply the correct padding-left based on the level attribute
    function setPaddingLeft() {
        let liElements = document.querySelectorAll("#hierarchy li");
        for (let liElement of liElements) {
            let level = liElement.getAttribute("level");
            liElement.style.paddingLeft = `${(level * 10)+5}px`;
        }
    }

    // setup messages
    window.addEventListener("message", event => {
        const message = event.data;
        switch (message.command) {
            case "fill-hierarchy":
                fillHierarchy(message.hierarchy);
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