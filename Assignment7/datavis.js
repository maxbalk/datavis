const groupsUrl = "http://augur.osshealth.io:5000/api/unstable/repo-groups";

async function getAllData(){
    let groups = await fetchData(groupsUrl);
    /*for(const group of groups){
        await getTotalCommits(group.repo_group_id);
    }*/
    let total = await getTotalCommits(groups[0].repo_group_id);
    //let top = await getTopCommitters(groups[0].repo_group_id, total);
}

async function getTopCommitters(groupID, total){
    let topUrl = groupsUrl + "/" + groupID + "/top-committers?threshold=1";
    let topComitters = await fetchData(topUrl);
    console.dir(topComitters);
    for(let committer of topComitters){
        let proportion = committer.commits / total;
        console.dir(proportion, committer.email, committer.commits);
    }
}

async function getTotalCommits(groupID){
    let total = 0;
    let aggUrl = groupsUrl + "/" + groupID + "/aggregate-summary?begin_date=2018-10-17";
    let summary = await fetchData(aggUrl);
    total = summary[0].commit_count
    console.dir(summary);
    getTopCommitters(groupID, total);
}

async function fetchData(url){
    let response =  await fetch(url);
    let json = await response.json();
    return json;
}

