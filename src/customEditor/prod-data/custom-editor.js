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

    function sendGameObjectSelectedMessage(fileId) {
        sendMessage({
            command: "select-game-object",
            fileId: fileId
        });
    }

    /**
     * @type {(collapsed:string[])=>void} TreeNode
     */
    let applyFolds;

    /**
     * @type {(fileId:string)=>void}
     */
    let setSelection;

    let mainContainer = document.getElementById("main-container");
    let gitStatusText = document.getElementById("git-status-text");
    let hierarchyContainer = document.getElementById("hierarchy");
    let inspectorContainer = document.getElementById("inspector");

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

    /**
     * @typedef {Object} SerializedUnityFileDocument
     * @property {number} type
     * @property {string} text
     * @property {any} content
     * @property {number[]} range
     * @property {string} fileId
     */

    /**
     * @typedef {Object} SerializedUnityFileComponent
     * @property {SerializedUnityFileDocument} document
     */

    /**
     * @typedef {Object} SerializedUnityFileGameObject
     * @property {SerializedUnityFileDocument} document
     * @property {SerializedUnityFileComponent[]} components
     * @property {SerializedUnityFileGameObject[]} children
     * @property {string} name
     */

    /**
     * @typedef {Object} Hierarchy
     * @property {SerializedUnityFileGameObject[]} rootGameObjects
     */

    /**
     * @param {Hierarchy} hierarchy 
     */
    function fillHierarchy(hierarchy) {
        /**@type {TreeNode} */
        let treeSetup = {
            id: "root",
            name: "Hierarchy",
            children: hierarchy.rootGameObjects.map(go => treeSetupRecursive(go))
        };

        let returns = createTreeView(hierarchyContainer, treeSetup);
        console.log(returns);
        applyFolds = returns.applyFolds;
        setSelection = returns.setSelection;
    }

    /**
     * @param {SerializedUnityFileGameObject} gameObject 
     * @returns {TreeNode}
     */
    function treeSetupRecursive(gameObject) {
        let children = gameObject.children.map(child => treeSetupRecursive(child));
        return {
            name: gameObject.document.content.GameObject.m_Name,
            id: gameObject.document.fileId,
            children: children,
            onClick: () => {
                sendGameObjectSelectedMessage(gameObject.document.fileId);
            },
            onClickChevron: () => {
                sendHierarchyFoldingMessage(gameObject.document.fileId);
            }
        };
    }

    /**
     * 
     * @param {InspectorContent} inspectorContent 
     */
    function fillInspector(inspectorContent) {
        createInspector(inspectorContainer, inspectorContent);
    }

    function getProperties(content, componentId) {
        const propRootKey = Object.keys(content)[0];
        const propRootValues = content[propRootKey];

        const propKeys = Object.keys(propRootValues);

        return propKeys.map(key => {
            return {
                name: key,
                id: componentId + "-" + key,
                children: [
                    {
                        name: JSON.stringify(propRootValues[key]),
                        id: componentId + "-" + key + "-value"
                    }
                ]
            };
        });
    }


    // setup messages
    window.addEventListener("message", event => {
        const message = event.data;
        switch (message.command) {
            case "fill-hierarchy":
                fillHierarchy(message.hierarchy);
                break;
            case "fill-inspector":
                fillInspector(message.inspectorContent);
                break;
            case "set-git-status":
                setGitStatus(gitStates[message.state]);
                break;
            case "apply-folds":
                applyFolds(message.collapsed);
                break;
            case "set-selection":
                setSelection(message.fileId);
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