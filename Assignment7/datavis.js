const base = "http://augur.osshealth.io:5000/api/unstable";
let groups;
let repos;
let shortList = new Array();
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
    getTopCommitters(group.repo_group_id, repo.repo_id);
}

async function getTopCommitters(groupID, repoID){
    let total = 0;
    let topUrl = base + "/repo-groups/" + groupID + "/repos/" + repoID + "/top-committers?threshold=0.4";
    let topComitters = await fetchData(topUrl);
    for(let committer of topComitters){
        total += committer.commits;
    }
    shortList.length = 0; //clear the shortList
    for(let committer of topComitters){
        let proportion = committer.commits / total;
        var topComitter = {
            email: committer.email,
            commits: committer.commits
        };
        shortList.push(topComitter);
    }
    callDrawTopChart();
}
function callDrawTopChart(){
    google.charts.load('current', {packages:['corechart']});
    google.charts.setOnLoadCallback(drawTopChart);
}
function drawTopChart(){
    //console.dir(shortList);
    var stuff = [
        ['email', 'commits'],
    ];
    for(var i=0;i<shortList.length;i++){
        var things = new Array();
        things.push(shortList[i].email, shortList[i].commits);
        stuff.push(things);
    }
    var data = google.visualization.arrayToDataTable(stuff);
    for(let item of shortList){
    }
    var options = {'width':400, 'height' :400};
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

