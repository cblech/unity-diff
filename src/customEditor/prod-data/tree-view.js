/**
 * @typedef {{children:TreeNode[], name:string, id:string, onClick:()=>void, onClickChevron: ()=>void}} TreeNode
 */


/**
 * @param {HTMLElement} hierarchyContainer
 * @param {TreeNode} treeSetup
 * @returns {{applyFolds: (collapsed:string[])=>void}} 
 */
function createTreeView(hierarchyContainer, treeSetup, ignoreFirstLayer = true) {
    let treeView = "";
    let chevronRight = "\uEAB6";
    let chevronDown = "\uEAB4";

    /**
     * 
     * @param {HTMLElement} parentElement 
     * @param {TreeNode} treeSetupNode 
     * @param {boolean} ignoreFirstLayer
     * @param {number} level 
     */

    function treeViewRecursive(parentElement, treeSetupNode, level = 0) {
        let chevron = "";
        if ((treeSetupNode.children?.length ?? 0) > 0) {
            chevron = chevronDown;
        }

        let liElement = document.createElement("li");
        liElement.setAttribute("level", level);
        liElement.setAttribute("treeId", treeSetupNode.id);
        liElement.setAttribute("childCount", treeSetupNode.children?.length ?? 0);
        liElement.style.paddingLeft = `${(level * 10) + 5}px`;

        {
            let chevronElement = document.createElement("span");
            chevronElement.classList.add("tree-view-chevron", "codicon", "codicon-");
            chevronElement.textContent = chevron;
            chevronElement.addEventListener("click", () => {
                if (treeSetupNode.onClickChevron) { treeSetupNode.onClickChevron(); }
            });
            liElement.appendChild(chevronElement);

            let textElement = document.createElement("span");
            textElement.classList.add("tree-view-text");
            textElement.textContent = treeSetupNode.name;
            textElement.addEventListener("click", () => {
                if (treeSetupNode.onClick) { treeSetupNode.onClick(); }
            });
            liElement.appendChild(textElement);
        }

        parentElement.appendChild(liElement);

        if (treeSetupNode.children?.length ?? 0 > 0) {
            let ulElement = document.createElement("ul");
            parentElement.appendChild(ulElement);
            for (let child of treeSetupNode.children) {
                treeViewRecursive(ulElement, child, level + 1);
            }
        }
    }

    if (ignoreFirstLayer) {
        for (let child of treeSetup.children) {
            treeViewRecursive(hierarchyContainer, child);
        }
    }
    else {
        treeViewRecursive(hierarchyContainer, treeSetup);
    }


    function applyFolds(collapsed) {
        let liElements = document.querySelectorAll("#hierarchy li");
        for (let liElement of liElements) {
            if (liElement.getAttribute("childCount") === "0") {
                continue;
            }

            let treeId = liElement.getAttribute("treeId");
            if (collapsed.includes(treeId)) {
                liElement.classList.add("collapsed");
                liElement.getElementsByClassName("tree-view-chevron")[0].textContent = chevronRight;
            } else {
                liElement.classList.remove("collapsed");
                liElement.getElementsByClassName("tree-view-chevron")[0].textContent = chevronDown;
            }
        }
    }


    return {
        applyFolds
    };
}