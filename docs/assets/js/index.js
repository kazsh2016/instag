(function(){

// jsonを読み込む
(function (){
    var xmlHttpRequest = new XMLHttpRequest();
    xmlHttpRequest.onreadystatechange = function()
    {
        if ( this.readyState == 4 && this.status == 200 ){
            if ( this.response ){
                onJson( this.response );
            }
        }
    }
    var r = Math.random();
    xmlHttpRequest.open( 'GET', 'assets/js/data.json?' + r , true );
    xmlHttpRequest.responseType = 'json';
    xmlHttpRequest.send( null );
})();

var tag_a = [];
var tag_b = [];
var tag_c = [];
var tag_d = [];
var select_a = [];
var select_b = [];
var select_c = [];
var select_pin = [];
var tag_max = 25;
var invisibleTagList = [];
var invisibleTagListCache = [];

var onJson = function( obj ){

    var getValue = function( arr, obj ){
        for(let k of Object.keys(obj)) {
            if ( typeof obj[k] == "object" ){
                getValue( arr, obj[k]);
            } else {
                if ( obj[k] != "" ) arr.push( obj[k] );
            }
        }
    }

    getValue( tag_a, obj.brand ); // ブランド・ギアタグ
    getValue( tag_b, obj.share ); // シェアタグ
    getValue( tag_c, obj.relation ); // 関連タグ

    tagSort(tag_a);
    tagSort(tag_b);
    tagSort(tag_c);

    loadInvisibleTagList(); // 非表示タグリストの読み込み
    createTags(); // tagの生成
    createEventListener(); // 各種イベントリスナの登録
    init(); // ラベルの最大数を変更したり
}

// タグの生成
var createTags = function(){
    
    var e = document.getElementById("gearTagsList");
    var e2 = document.getElementById("gearTagsSettingList");
    var n = tag_a.length;
    for ( var i=0; i<n; i++ ){
        var tag = tag_a[i];
        var invisible = hasInvisibleTagList(tag);
        var t = document.createElement("li");
        t.classList.add("tag");
        if ( invisible ) t.classList.add("invisible");
        t.innerHTML = "<span class='firstCharactor'>" + tag.substr(0,1) + "</span>" + tag.substr(1);
        e.appendChild(t);

        // setting用リストの生成
        // <input type="checkbox" name=“sample” value="1" checked="checked">
        var li = document.createElement("li");
        var la = document.createElement("label");
        var ip = document.createElement("input");
        ip.setAttribute('type', 'checkbox');
        ip.setAttribute('name', 'visibleList');
        ip.setAttribute('value', tag);
        if ( !invisible ) ip.setAttribute('checked', "");
        var p = document.createElement("span");
        p.textContent = tag;
        la.appendChild(ip);
        la.appendChild(p);
        li.appendChild(la);
        e2.appendChild(li);
    }
    

    var e = document.getElementById("shareTagsList");
    var e2 = document.getElementById("shareTagsSettingList");
    var n = tag_b.length;
    for ( var i=0; i<n; i++ ){
        var tag = tag_b[i];
        var invisible = hasInvisibleTagList(tag);
        var t = document.createElement("li");
        t.classList.add("tag");
        if ( !invisible ) t.classList.add("on");
        if ( invisible ) t.classList.add("invisible");
        t.textContent = tag;
        e.appendChild(t);

        // setting用リストの生成
        var li = document.createElement("li");
        var la = document.createElement("label");
        var ip = document.createElement("input");
        ip.setAttribute('type', 'checkbox');
        ip.setAttribute('name', 'visibleList');
        ip.setAttribute('value', tag);
        if ( !invisible ) ip.setAttribute('checked', "");
        var p = document.createElement("span");
        p.textContent = tag;
        la.appendChild(ip);
        la.appendChild(p);
        li.appendChild(la);
        e2.appendChild(li);

    }

    // localdataを取得して反映
    var pinlist = JSON.parse(localStorage.getItem("instag_camp_datalist"));
    var m = 0;
    if ( pinlist ) m = pinlist.length;

    var e = document.getElementById("campTagsList");
    var e2 = document.getElementById("campTagsSettingList");
    var n = tag_c.length;
    for ( var i=0; i<n; i++ ){
        var tag = tag_c[i];
        var invisible = hasInvisibleTagList(tag);
        var t = document.createElement("li");
        t.classList.add("tag");
        if ( invisible ) t.classList.add("invisible");
        t.textContent = tag;
        var img = document.createElement("img");
        img.setAttribute('src', 'assets/images/pin.png');
        img.classList.add("pin");
        t.appendChild(img);
        e.appendChild(t);
        if ( !invisible ){
            for ( var j=0; j<m; j++){
                if ( pinlist[j] == tag_c[i] ){
                    t.classList.add("fixed");
                    t.classList.add("on");
                    img.classList.add("on");
                    break;
                }
            }
        }


        // setting用リストの生成
        var li = document.createElement("li");
        var la = document.createElement("label");
        var ip = document.createElement("input");
        ip.setAttribute('type', 'checkbox');
        ip.setAttribute('name', 'visibleList');
        ip.setAttribute('value', tag);
        if ( !invisible ) ip.setAttribute('checked', "");
        var p = document.createElement("span");
        p.textContent = tag;
        la.appendChild(ip);
        la.appendChild(p);
        li.appendChild(la);
        e2.appendChild(li);
    }
}

function init(){
    // ボタンのラベル
    document.getElementById("js-random-button").textContent = "ランダムで選択(最大"+tag_max+")";
    updateTags();

    // 更新日時
    //document.getElementById("js-lastupdate").textContent = "update:"+document.lastModified;
}


function execCopy(){
    var temp = document.getElementById("tags_textarea");
    temp.selectionStart = 0;
    temp.selectionEnd = temp.value.length;  
    temp.focus();
    var result = document.execCommand('copy');
    temp.blur();
    // true なら実行できている falseなら失敗か対応していないか
    alert(temp.value);
    return result;
  }

function createEventListener(){
    // ランダムボタン
    var rndButton = document.getElementById('js-random-button');
    rndButton.addEventListener('click', randomSelect );

    // コピーボタン
    var copyButton = document.getElementById('js-copy-button');
    copyButton.addEventListener('click', function(){
        execCopy();
    });



    // 設定・表示ボタン
    var btns = document.getElementsByClassName("js-setting-button");
    var n = btns.length;
    for ( var i=0; i<n; i++ ){
        btns[i].addEventListener('click',function(){
            var target_id = this.parentNode.parentNode.getAttribute("id") + "Setting";
            var e = document.getElementById(target_id);
            e.classList.add("visible");
            e.scrollTop = 0;
            reflectInvisibleTagList();
            invisibleTagListCache = invisibleTagList.concat();
        });
    }
    
    // 設定・確定ボタン
    var btns = document.getElementsByClassName("js-setting-ok-button");
    var n = btns.length;
    for ( var i=0; i<n; i++ ){
        btns[i].addEventListener('click',function(){
            this.parentNode.parentNode.classList.remove("visible");
            invisibleTagList = invisibleTagListCache.concat();
            saveInvisibleTagList();
        });
    }

    // 設定・キャンセルボタン
    var btns = document.getElementsByClassName("js-setting-cancel-button");
    var n = btns.length;
    for ( var i=0; i<n; i++ ){
        btns[i].addEventListener('click',function(){
            this.parentNode.parentNode.classList.remove("visible");
            invisibleTagListCache = [];
        });
    }
    
    // checkboxイベントリスナ
    var checkbox = document.querySelectorAll("input[name=visibleList]");
    var n = checkbox.length;
    for ( var i=0; i<n; i++){
        checkbox[i].addEventListener('change', function(){
            var tag = this.getAttribute("value");
            if(this.checked) {
                removeInvisibleTagListCache(tag);
            } else {
                addInvisibleTagListCache(tag);
            }
        });
    }

    // tagにclickイベント登録
    var e=document.getElementsByClassName("tag");
    var n=e.length;
    for ( var i=0; i<n; i++ ){
        e[i].addEventListener("click",tagClicked);
    }

    // hashtag 追加ボタン
    var e = document.getElementsByClassName("js-add-hashtag-button")[0];
    e.addEventListener("click", addOriginHashtag(document.getElementsByClassName("js-input-hashtag")[0].value));
}

// hashtagを追加
function addOriginHashtag(t){
    // 整合性のチェック
    // 重複チェック
    // データを追加
    tag_d.push(t);
    saveOriginHashtag();
    // 画面に反映
}

function saveOriginHashtag(){
    localStorage.setItem("instag_camp_originTagList", JSON.stringify(tag_d));
}

// あいうえお順
function tagSort(a){
    a.sort(function(a, b){
        a = a.toString().toLowerCase();
        b = b.toString().toLowerCase();
        if(a < b){
            return -1;
        }else if(a > b){
            return 1;
        }
        return 0;
    });
}

function randomSort(a){
    var b = a.concat();
    for(var i = b.length - 1; i > 0; i--){
        var r = Math.floor(Math.random() * (i + 1));
        var tmp = b[i];
        b[i] = b[r];
        b[r] = tmp;
    }
    return b;
}

function randomSelect(){
    //  document.querySelectorAll('#campTagsList li.tag.on')
    // fixed以外を収集
    var e = document.querySelectorAll('#campTagsList li.tag');
    var e2 = [];
    var n = e.length;
    for ( var i=0; i<n; i++ ){
        if ( !e[i].classList.contains("fixed") && !e[i].classList.contains("invisible") ){
            e2.push(e[i]);
        }
    }

    var e3 = randomSort( e2 );
    var n = e3.length;
    var n2 = tag_max - select_a.length - select_b.length - select_pin.length;
    for( var i=0; i<n; i++ ){
        if ( i<n2){
            e3[i].classList.add("on");
        } else {
            e3[i].classList.remove("on");
        }
    }
    updateTags();
}

function tagClicked(e){
    if (e.target.localName == "li"){
        if ( !e.target.classList.contains("fixed")){
            e.target.classList.toggle("on");
        }
    } else if (e.target.localName == "img"){
        e.target.classList.toggle("on");
        e.target.parentNode.classList.toggle("fixed");
        if (e.target.classList.contains("on")){
            e.target.parentNode.classList.add("on");
        } else {

        }
    }
    updateTags();
}

function updateTags(){
    select_a = [];
    var e = document.querySelectorAll('#gearTagsList li.tag.on');
    var n = e.length;
    for ( var i=0; i<n; i++ ){
        select_a.push(e[i].textContent);
    }

    select_b = [];
    var e = document.querySelectorAll('#shareTagsList li.tag.on');
    var n = e.length;
    for ( var i=0; i<n; i++ ){
        select_b.push(e[i].textContent);
    }

    select_c = [];
    select_pin = [];    
    var e = document.querySelectorAll('#campTagsList li.tag.on');
    var n = e.length;
    for ( var i=0; i<n; i++ ){
        if ( e[i].classList.contains("fixed")){
            select_pin.push(e[i].textContent);
        } else {
            select_c.push(e[i].textContent);
        }
    }

    localStorage.setItem("instag_camp_datalist", JSON.stringify(select_pin));

    var n = 0;
    var e = document.querySelectorAll('li.tag.on');
    document.getElementById("tagTotal").innerHTML = e.length;

    // random sort
    var a = select_a.concat(select_b);
    a = a.concat(select_c);
    a = a.concat(select_pin);

    tagSort(a);

    // 出力
    var t = "";
    for ( var i=a.length-1; i >= 0; i--){
        t = "<li>#" + a[i]+" </li>" + t;
    }
    t = "<ol>" + t + "</ol>"
    document.getElementById("tags").innerHTML = t;

    // 出力2
    var t = "";
    for ( var i=a.length-1; i >= 0; i--){
        t = "#"+a[i]+" " + t;
    }
    document.getElementById("tags_textarea").value = t;
}

//
// 非表示タグ(InvisibleTagList)関連
//

function hasInvisibleTagList( tag ){
    var n = invisibleTagList.length;
    for ( var i=0; i<n; i++ ){
        if ( invisibleTagList[i] == tag ){
            return true;
        }
    }
    return false;
}

function reflectInvisibleTagList(){
    var checkbox = document.querySelectorAll("input[name=visibleList]");
    var n = checkbox.length;
    var m = invisibleTagList.length;
    for ( var i=0; i<n; i++ ){
        var v = checkbox[i].getAttribute("value");
        checkbox[i].checked = true;
        for ( var j=0; j<m; j++ ){
            if ( invisibleTagList[j] == v ){
                checkbox[i].checked = false;
                break;
            }
        }
    }
    return false;
}

function saveInvisibleTagList(){
    localStorage.setItem("instag_camp_invisibleTagList", JSON.stringify(invisibleTagList));
    // tagにも反映
    var elements = document.querySelectorAll("li.tag");
    var n = elements.length;
    var m = invisibleTagList.length;
    for ( var i=0; i<n; i++ ){
        elements[i].classList.remove("invisible");
        for ( var j=0; j<m; j++ ){
            if ( elements[i].textContent == invisibleTagList[j] ){
                elements[i].classList.add("invisible");
                elements[i].classList.remove("on");
                break;
            }
        }
    }
    updateTags();
}

function loadInvisibleTagList(){
    // ローカルから非表示リストを取得
    invisibleTagList = JSON.parse(localStorage.getItem("instag_camp_invisibleTagList"));
    if ( !invisibleTagList ) invisibleTagList = [];
}

function addInvisibleTagListCache(tag){
    var n = invisibleTagListCache.length;
    for ( var i=0; i<n; i++ ){
        if ( invisibleTagListCache[i] == tag ){
            return;
        }
    }
    invisibleTagListCache.push(tag);
}

function removeInvisibleTagListCache(tag){
    var n = invisibleTagListCache.length;
    for ( var i=0; i<n; i++ ){
        if ( invisibleTagListCache[i] == tag ){
            invisibleTagListCache.splice(i,1);
            return;
        }
    }
}
})();



