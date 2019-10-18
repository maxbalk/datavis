const groupsUrl = "http://augur.osshealth.io:5000/api/unstable/repo-groups";
let groups;
async function getGroups(){
    groups = await fetchData(groupsUrl);
    let list = document.getElementById("groupList");
    for(let group of groups){
        var option = document.createElement("option");
        option.value = group.repo_group_id;
        option.innerHTML = group.rg_name;
        list.options.add(option);
    }
    console.dir(list);
    //await getTopCommitters(groups[1].repo_group_id);
}

async function getRepos(groupIndex){
    let group = groups[groupIndex];
    let list = document.getElementById("repoList");
    let reposUrl = groupsUrl + "/" + group.repo_group_id + "/repos";
    let repos = await fetchData(reposUrl);
    for(let repo of repos){
        var option = document.createElement("option");
        option.value = repo.repo_id;
        option.innerHTML = repo.repo_name;
        list.options.add(option);
    }
}

async function getTopCommitters(groupID){
    let total = 0;
    let topUrl = groupsUrl + "/" + groupID + "/top-committers?threshold=0.5";
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
        //console.dir(proportion, committer.email, committer.commits);
    }
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

