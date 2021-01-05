interface LineItemKey {
    id: string;
    parentId: string;
    lineGroup: string;
}
// treeify takes a flat structure and turns it into a hierarchy
export const treeify = (lines: LineItemKey[]) => {
    console.log("lines are here", lines);
    // list to be returned
    var treeList = [];
    // lookup obj for adding children
    var lookup = {};
    let arrayCopy = JSON.parse(JSON.stringify(lines));
    arrayCopy.forEach(obj => {
        lookup[obj['id']] = obj;
        obj['children'] = [];
    });


    arrayCopy.forEach(obj => {
        if (obj['parentId'] != '' && obj['parentId'] != null) {
            // children objects
            lookup[obj['parentId']]['children'].push(obj);
        } else {
            // parent/root objects
            treeList.push(obj);
        }
    })
    console.log("treeList", treeList);
    return treeList;
}