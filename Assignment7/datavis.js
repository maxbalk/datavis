const groupsUrl = "http://augur.osshealth.io:5000/api/unstable/repo-groups";


async function getAllData(){
    let groups = await fetchData(groupsUrl);
    /*for(const group of groups){
        console.log(group.repo_group_id);
    }*/
    let reposUrl = groupsUrl + "/" + groups[0].repo_group_id + "/repos" //do this for each repo group i guess
    let repos = await fetchData(reposUrl);
    console.dir(repos);
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

