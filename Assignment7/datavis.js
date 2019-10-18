const groupsUrl = "http://augur.osshealth.io:5000/api/unstable/repo-groups";
let groups;

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
    console.dir(included);
}    

async function getGroups(){
    groups = await fetchData(groupsUrl);
    let list = document.getElementById("groupList");
    for(let group of groups){
        var option = document.createElement("option");
        option.value = group.repo_group_id;
        option.innerHTML = group.rg_name;
        list.options.add(option);
    }
}

async function getRepos(groupIndex){
    
    let list = document.getElementById("repoList");
    while(list.options.length) list.options.remove(0);

    let group = groups[groupIndex];
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
    }
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

