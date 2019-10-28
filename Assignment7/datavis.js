const base = "http://augur.osshealth.io:5000/api/unstable";
let groups;
let repos;
function filterRepos(keyw){
    let list = document.getElementById("repoList");
    let included = new Array();
    for(var i=0;i<list.length;i++){
        let txt = list.options[i].text;
        let include = txt.toLowerCase().startsWith(keyw);
        if(include){
            list.options[i].style.display = 'list-item';
            included.push(i);
        } else {
            list.options[i].style.display = 'none';
        }
    }
    list.selectedIndex = included[0];
}    

async function groupList(){
    groups = await getGroups();
    let list = document.getElementById("groupList");
    for(let group of groups){
        var option = document.createElement("option");
        option.value = group.repo_group_id;
        option.innerHTML = group.rg_name;
        list.options.add(option);
    }
}
async function getGroups(){
    let groupsUrl = base + "/repo-groups/";
    groups = await fetchData(groupsUrl);
    return groups;
}

async function repoList(groupIndex){
    let list = document.getElementById("repoList");
    while(list.options.length) list.options.remove(0);

    repos = await getRepos(groupIndex);  
    for(let repo of repos){
        var option = document.createElement("option");
        option.value = repo.repo_id;
        option.innerHTML = repo.repo_name;
        list.options.add(option);
    }
}
async function getRepos(groupIndex){
    let group = groups[groupIndex];
    let reposUrl = base + "/repo-groups/" + group.repo_group_id + "/repos/";
    let repos = await fetchData(reposUrl);
    return repos;
}

function selectRepo(){ 
    let repoIndex = document.getElementById("repoList").selectedIndex;
    let repo = repos[repoIndex];
    let groupIndex = document.getElementById("groupList").selectedIndex - 1;
    let group = groups[groupIndex];

    google.charts.load('current', {packages:['corechart']});
    getTopCommitters(group.repo_group_id, repo.repo_id);
    getPullAcceptance(group.repo_group_id, repo.repo_id);
    getNewIssues(group.repo_group_id, repo.repo_id);
}

async function getNewIssues(groupID, repoID){
    let issueURL = base + "/repo-groups/" + groupID + "/repos/" + repoID + "/issues-new?period=week";
    try{
        let newIssues = await fetchData(issueURL);
        let issueList = new Array();
        for(let issue of newIssues){
            issue.date = issue.date.slice(0,10);
            if (issue.issues>=100){issue.issues = 100;} //normalization
            issueList.push(issue);
        }
        google.charts.setOnLoadCallback(drawNewIssueChart(issueList));
    } catch(e){
        document.getElementById("colGraph").innerHTML = "The selected repo is not providing any data on new issues";
    }
}
let drawNewIssueChart = function(issueList){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');
    data.addColumn('number', 'Issues');
    for(let item of issueList){
        data.addRow([item.date, item.issues]);
    }
    var options = { width : 600, height : 400}
    var chart = new google.visualization.ColumnChart(document.getElementById('colGraph'));
    chart.draw(data, options);
}

async function getPullAcceptance(groupID, repoID){
    let acceptUrl = base + "/repo-groups/" + groupID + "/repos/" + repoID + "/pull-request-acceptance-rate";
    try{
        let acceptanceRate = await fetchData(acceptUrl);
        let acceptList = new Array();
        for(let acceptance of acceptanceRate){
            acceptance.date = acceptance.date.slice(0,10);
            acceptList.push(acceptance);
        }
        google.charts.setOnLoadCallback(drawAcceptanceChart(acceptList));
    }catch(e){
        document.getElementById("pullGraph").innerHTML = "The selected repo is not providing any data on pull acceptance rate";
    }
}
let drawAcceptanceChart = function(acceptList){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');
    data.addColumn('number', 'Rate');
    for(let item of acceptList){ 
        data.addRow([item.date, item.rate]);
    }
    var options = {'width':600, 'height' :400};
    var chart = new google.visualization.LineChart(document.getElementById('pullGraph'));
    chart.draw(data, options);
}

async function getTopCommitters(groupID, repoID){
    let topUrl = base + "/repo-groups/" + groupID + "/repos/" + repoID + "/top-committers?threshold=0.7";
    try{
        let topComitters = await fetchData(topUrl);
        let shortList = new Array();
        for(let committer of topComitters){
            shortList.push(committer);
        }
        google.charts.setOnLoadCallback(drawTopChart(shortList));
    } catch(e) {
        document.getElementById("piechart").innerHTML = "The selected repo is not providing any data on top committers";
    }
}
let drawTopChart = function(shortList){
    let data = new google.visualization.DataTable();
    data.addColumn('string', 'email');
    data.addColumn('number', 'commits');
    for(let item of shortList){
        data.addRow([item.email, item.commits]);
    }
    var options = {'width':600, 'height' :400};
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

