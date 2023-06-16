
function stripHtmlTags(input) {
    var doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.body.textContent || '';
}

function convertYaml(yamlString) {
    return jsyaml.load(yamlString);
}

function generateModals(apps) {
    const data = apps;
    let html = '';
    a = 0;
    for (const childCat of data.children) {
        for (const child of childCat.children) {
            a++;
            const appDescription = stripHtmlTags(child.data.description);
            const appTitle = child.name;
            const appUrl = child.data.url;
            const appSource = child.data.source_url
                            ? `<li><strong>Source Code</strong>: <a href="${child.data.source_url}">${child.data.source_url}</a></li>`
                            : '';
            const appBugs = child.data.bugs_url
                            ? `<li><strong>Report an Issue</strong>: <a href="${child.data.bugs_url}">${child.data.bugs_url}</a></li>`
                            : '';
            const appDocs = child.data.docs_url
                            ? `<li><strong>Documentation</strong>: <a href="${child.data.docs_url}">${child.data.docs_url}</a></li>`
                            : '';
            const appTeam = child.data.team
                            ? `<li><strong>Maintained by</strong>: ${child.data.team}</li>`
                            : '';

            const appIcon = child.data.icon
                ? `theme/icons/${child.data.icon}`
                : `theme/icons/none.png`;
            html += `
                <div class="modal fade" id="app-${a}" tabindex="-1" aria-labelledby="app-${a}-label" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="app-${a}-label">${appTitle}</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" data-bs-target="app-${a}" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>${appDescription}</p>
                                <ul>
                                    ${appTeam}
                                    ${appSource}
                                    ${appBugs}
                                    ${appDocs}                        
                                </ul>
                                <a href="https://discussion.fedoraproject.org/c/ask/6/none" class="btn btn-primary">Get Help in Ask Fedora</a>
                                <a href="${appUrl}" class="btn btn-secondary">Access App</a>
                            </div>
                        </div>
                    </div>
                </div>
                `;     
        }
    }
    return html;

}
function generateTiles(apps) {
    const data = apps;
    let html = '<div id="apps" class="row">\n';
    a = 0;
    for (const childCat of data.children) {
        const cat = childCat.name
        const slug = childCat.slug ? childCat.slug : childCat.name;
        for (const child of childCat.children) {
            a++;
            const appDescription = stripHtmlTags(child.data.description);
            const appTitle = child.name;
            const appUrl = child.data.url;
            const appIcon = child.data.icon
                ? `theme/icons/${child.data.icon}`
                : `theme/icons/none.png`;

            html += `    
            <div id="apptile" class="cat-${slug} col-md-2 col-4 my-3 px-2 text-center" title="${appDescription}">\n
                <a target="_blank" href="${appUrl}">\n
                    <img src="${appIcon}" class="img-thumbnail" alt="Logo for ${appTitle}"><br/>\n
                    ${appTitle}\n
                </a><br/>\n
                <button type="button" class="btn btn-secondary" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;"  data-bs-toggle="modal" data-bs-target="#app-${a}">?</button>\n
            </div>\n
            `;
        
        }
    }

    html += '\n</div>';

    return html;

}
function buildPills(apps) {
    const data = apps;
    let html = '<li class="nav-item active px-1"><a class="nav-link active" data-filter="all">All</a></li>';
    for (const childCat of data.children) {
        const cat = childCat.name
        const slug = childCat.slug ? childCat.slug : childCat.name;
        html += `<li class="nav-item px-1"><a class="nav-link" data-filter="cat-${slug}">${cat}</a></li>`;
    }
    return html;
}


function filterPills() {

    // Retrieve necessary elements from the DOM
    const pills = document.querySelectorAll('#filter-container .nav-link');
    const divList = document.getElementById('apps');

    // Attach click event listener to each pill
    pills.forEach(pill => {
    pill.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter'); // Get the filter category

        // Remove 'active' class from all pills
        pills.forEach(p => p.classList.remove('active'));

        // Add 'active' class to the clicked pill
        this.classList.add('active');

        // Filter the div list based on the selected category
        if (filter === 'all') {
        // Show all divs if 'All' is selected
        divList.querySelectorAll('#apptile').forEach(div => div.style.display = 'block');
        } else {
        // Show only divs that match the selected category
        divList.querySelectorAll('#apptile').forEach(div => {
            if (div.classList.contains(filter)) {
            div.style.display = 'block'; // Display matching divs
            } else {
            div.style.display = 'none'; // Hide non-matching divs
            }
        });
        }
    });
    });

}
function setup(yamlUrl) {
fetch(yamlUrl)
    .then(response => response.text())
    .then(yamlContent => {
        const apps = convertYaml(yamlContent);
        const htmlOutput = generateTiles(apps);
        document.getElementById('app-body').innerHTML = htmlOutput;
        const htmlModels = generateModals(apps);
        document.getElementById('app-modals').innerHTML = htmlModels;
        const htmlPills = buildPills(apps);
        document.getElementById('pill-cat').innerHTML = htmlPills;
        filterPills();
    })
    .catch(error => {
        console.error('Error fetching YAML file:', error);
    });
}
    