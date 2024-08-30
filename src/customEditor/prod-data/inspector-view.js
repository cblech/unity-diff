/**
 * @typedef {Object} Property
 * @property {string} key
 * @property {string} value
 * @property {{fileID: String}|null|undefined} link
 */

/**
 * @typedef {Object} Block
 * @property {Property[]} properties
 * @property {string} header
 */

/**
 * @typedef {Object} InspectorContent
 * @property {Block[]} blocks
 */

/**
 * @param {HTMLElement} hierarchyContainer 
 * @param {InspectorContent} inspectorContent 
 */

function createInspector(hierarchyContainer, inspectorContent) {

    for (const block of inspectorContent.blocks) {

        let rootElement = document.createElement("div");
        rootElement.classList.add("inspector-component");
        hierarchyContainer.appendChild(rootElement);

        let headerElement = document.createElement("h3");
        headerElement.innerHTML = block.header;
        rootElement.appendChild(headerElement);

        let propertiesElement = document.createElement("table");
        propertiesElement.classList.add("inspector-properties");
        rootElement.appendChild(propertiesElement);

        for (const property of block.properties) {
            let trElement = document.createElement("tr");
            propertiesElement.appendChild(trElement);

            let tdKeyElement = document.createElement("td");
            tdKeyElement.innerHTML = property.key;
            trElement.appendChild(tdKeyElement);

            let tdValueElement = document.createElement("td");
            tdValueElement.innerHTML = property.value;
            if(property.link !== undefined){
                tdValueElement.classList.add("inspector-link");
            }
            trElement.appendChild(tdValueElement);
        }
    }
}