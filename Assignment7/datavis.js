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

async function selectRepo(){
    let repoIndex = document.getElementById("repoList").selectedIndex;
    let repo = repos[repoIndex];
    let groupIndex = document.getElementById("groupList").selectedIndex - 1;
    let group = groups[groupIndex];
    console.dir(repo, group);
    getTopCommitters(group.repo_group_id, repo.repo_id);
}

async function getTopCommitters(groupID, repoID){
    let total = 0;
    let topUrl = base + "/repo-groups/" + groupID + "/repos/" + repoID + "/top-committers?threshold=0.5";
    console.dir(topUrl);
    let topComitters = await fetchData(topUrl);
    console.dir(topComitters);
    for(let committer of topComitters){
        total += committer.commits;
    }
    console.dir(total);
    for(let committer of topComitters){
        let proportion = committer.commits / total;
        var topComitter = {
            percent: proportion,
            email: committer.email,
            commits: committer.commits
        };
    }
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

