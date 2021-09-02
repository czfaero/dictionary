
const root = document.getElementById('main');
root.addEventListener("mousemove", MouseMove)
root.addEventListener("mouseup", MouseUp);

const ITEM_WIDTH = 100;
function Add() {
    var data = FetchData();


    let div = Item_Init(data)
    root.appendChild(div)
}

var debugDataCount = -1;
function FetchData(word) {
    let data1 = { key: "word1", lang: "ja", synsets: ["synset1", "synset2"] }
    let data2 = { key: "word2", lang: "ja", synsets: ["synset1", "synset3", "synset4"] }
    let data3 = { key: "word3", lang: "ja", synsets: ["synset1", "synset4"] }
    let data4 = { key: "word4", lang: "ja", synsets: ["synset3", "synset4"] }
    let data5 = { key: "word5", lang: "ja", synsets: ["synset1", "synset5"] }
    debugDataCount++;
    return [data1, data2, data3, data4, data5][debugDataCount % 5];

}


var currentMoveTarget = null;
var offsetX;
var offsetY;
function MoveStart(e) {
    currentMoveTarget = e.target.parentElement;
    offsetX = e.screenX - currentMoveTarget.posX;
    offsetY = e.screenY - currentMoveTarget.posY;
    if (currentMoveTarget.nextItem) {
        currentMoveTarget.nextItem.lastItem = null;
        currentMoveTarget.nextItem = null;
    }
    if (currentMoveTarget.lastItem) {
        currentMoveTarget.lastItem.nextItem = null;
        currentMoveTarget.lastItem = null;
    }
}
function MouseMove(e) {
    if (currentMoveTarget) {
        currentMoveTarget.posX = e.screenX - offsetX;
        currentMoveTarget.posY = e.screenY - offsetY;
        Item_ApplyPos(currentMoveTarget)
        let hitItem = ItemList_CheckHit(currentMoveTarget)
        if (hitItem) {
            PlaceSign(hitItem)
        } else {
            PlaceSignOff();
        }
    }
}
function MouseUp() {

    if (triggedItem) {
        currentMoveTarget.posX = triggedItem.posX + ITEM_WIDTH;
        currentMoveTarget.posY = triggedItem.posY;
        triggedItem.nextItem = currentMoveTarget;
        currentMoveTarget.lastItem = triggedItem;
        Item_ApplyPos(currentMoveTarget)
        ItemChain(currentMoveTarget);
    }
    currentMoveTarget = null;
    PlaceSignOff();
}

var itemList = new Array();

function Item_Init(data) {
    let div = document.createElement("div");
    div.className = "item";
    div.innerHTML = Item_InitHTML(data);
    div.data = data;
    let key = div.querySelector('.key');
    key.addEventListener("mousedown", MoveStart);
    div.posX = 40;
    div.posY = 40;
    Item_ApplyPos(div)
    itemList.push(div)
    return div;
}
function Item_InitHTML(data) {
    let r = "<div class='key'>" + data.key + "</div>";
    r += "<ol>"
    for (let synset of data.synsets) {
        r += "<li>" + synset + "</li>"
    }
    r += "</ol>"
    return r;
}
function Item_ApplyPos(div) {
    div.style.left = div.posX + "px";
    div.style.top = div.posY + "px";
}

function ItemChain(endNode) {
    let synsetSort = [];
    let n = endNode;
    while (n) {
        for (let syn of n.data.synsets) {
            let tempObj = null;
            for (let obj of synsetSort) {
                if (syn == obj.name) { tempObj = obj; break; }
            }
            if (tempObj) { tempObj.count++; }
            else {
                synsetSort.push({ name: syn, count: 1 });
            }
        }
        n = n.lastItem;
    }
    synsetSort.sort((o1, o2) => { return o2.count - o1.count });
    console.log(synsetSort)
    n = endNode;
    while (n) {
        let ol = "";
        for (let synObj of synsetSort) {
            let li = "";
            for (let syn of n.data.synsets) {
                if (syn == synObj.name) {
                    li = "<li>" + syn + "</li>"
                    break;
                }
            }
            if (!li) {
                if (synObj.count > 1) {
                    li = "<li>&nbsp;</li>"
                }
            }
            ol += li;
        }
        n.querySelector("ol").innerHTML = ol;
        n = n.lastItem;
    }
}




function ItemList_CheckHit(div) {
    for (let item of itemList) {
        if (item.nextItem) continue;
        if (div.posX > item.posX + ITEM_WIDTH
            && div.posX < item.posX + ITEM_WIDTH * 2
            && div.posY > item.posY - 20
            && div.posY < item.posY + item.scrollHeight + 20) {

            return item;
        }
    }
    return null;
}

const placeSign = document.getElementById("place_sign");
var triggedItem = null;
function PlaceSign(item) {
    placeSign.style.left = item.posX + ITEM_WIDTH + "px";
    placeSign.style.top = item.posY + "px";
    placeSign.style.height = item.scrollHeight + "px";
    placeSign.style.display = "block";
    triggedItem = item;
}
function PlaceSignOff() {
    placeSign.style.display = "none";
    triggedItem = null;
}