//装飾描画用js

//グローバルな変数たちの紹介
var decoPage = false; //#DeconaId=***がURLについていればデコページとみなしtureに
var tempx = [];       //loadした後にmousexに入れる配列
var tempy = [];       //loadした後にmouseyに入れる配列
var tempClick = [];   //loadした後にclickFpsに入れる配列 
var tempMode = 0;
var loadCount = -1;   //loadした回数 imgCount_localと比較するため便宜上-1から数える
var imgCount = 0;     //img要素のカウント
var defoMode = 0;     //未装飾の画像はこの値を初期のモードにする
var first_save = false; //最低1つは装飾しているかのフラグ



setTimeout(function(){
  if(location.hash.match(/#DeconaId=/)){ //hashIdが付いているかの確認
      decoPage = true;
      changeOnoff(); //decoPageなら最初からシステムONに
      showPageId = location.hash.substr(location.hash.length-14); //付いていればIdを入れる
    }else{
      showPageId = ""; //付いていなければ空っぽに
  }
  
},10);


function canvas_set(){
  imgCount = 0;
  $('img').each(function(){ //ページ内のimgタグの数だけsketch関数を回す
    new p5(sketch);
  });
}



//メイン
var sketch = function(s){
  //変数のセット
  var mouse,hand,man,hand,finger; //画像変数
  var fps = 0;                    //描画回数のカウント
  var record = false;             //録画モードのフラグ
  var playback = false;           //再生モードのフラグ
  var clickFps = [];              //クリックした時のfpsの保存 []内はクリックした回数
  var clickCnt = 0;               //今回の録画中にクリックした回数
  var mousex = [];                //マウスのx座標の保存 []内はfps
  var mousey = [];                //マウスのy座標の保存 []内はfps
  var playbackCnt = 0;            //クリックアニメーションを行った回数のカウント
  var clickAnimation = false;     //クリック時のアニメーションのオンオフ
  var animeFps = 60;              //アニメーション中のfpsカウントダウン
  var cnv;                        //キャンバス用変数
  var img_tag;                    //imgタグのid名
  var imgCount_local = 0;         //キャンバスの画像番号
  var loadflag = true;            //loadが終わるとfalseになる
  var iconx,icony;                //モード切り替えボタンのマウスオーバーアニメーションのアイコン座標変数
  var mode = 0;                   //描画モードのフラグ用変数 0=マウス,1=足跡,2=指
  
  s.setup = function(){
     imgCount_local = imgCount;
     img_tag = $('img').get(imgCount).id; //imgタグのidを取得

    if(!img_tag){ //idが空なら独自のidを付与する
      $('img').eq(imgCount).attr('id', 'decona'+imgCount);
      img_tag = $('img').get(imgCount).id;
    }


    //canvasに入れるdiv要素
    $("#"+img_tag).wrap("<span class='deco_area' />");
    var image_element = document.createElement('span');
    image_element.id = 'deco'+imgCount;
    image_element.classList.add('deco');
    image_element.style.position = 'absolute';
    $("#"+img_tag).before(image_element);


    //canvasの作成
    var image = document.getElementById(img_tag);
    if(image.width >= 100 && image.height >= 100){
      cnv = s.createCanvas(image.width+100, image.height);
      
    }else{ // 100*100より小さい画像にはキャンバスを張らない
      cnv = s.createCanvas(0,0);
    }
    //cnv.style('position', 'absolute');//これを入れると上手くいかない
    cnv.style('z-index', 1000);
    cnv.parent('deco'+imgCount);

    //画像のロード
    mouse = s.loadImage(chrome.extension.getURL("img/mouse.png"));
    hand = s.loadImage(chrome.extension.getURL("img/hand.png"));
    man = s.loadImage(chrome.extension.getURL("img/man.png"));
    foot = s.loadImage(chrome.extension.getURL("img/foot.png"));
    finger = s.loadImage(chrome.extension.getURL("img/finger.png"));

    imgCount++; //imgタグのカウントを増やす

    icony = s.height-130;

  }



  s.draw = function(){
    s.clear();
    //s.fill(100,100, 100,100); //半透明フレーム
    //s.rect(0,0,s.width-100, s.height);


    if(decoPage){
      s.loadData();
    }

    if(on){

    //録画モードでも再生モードでもない時、画像にマウスオーバーした時にUI表示
    if(!record && !playback){
      mode = defoMode;
      if(s.mouseX <= s.width && s.mouseX >= 0 && s.mouseY <= s.height && s.mouseY >= 0){
        s.UI();
      }
    }

      //録画モード
      if(record){
        if(mode == 0){
          s.recordDraw();
        }else if(mode == 1){
          s.recordDraw_map();
        }else{
          s.recordDraw_smart();
        }
        s.recordUI();
        fps++;
      }
  
      //再生モード
      if(playback){
        if(mode == 0){
          s.playbackDraw();
        }else if(mode == 1){
          s.playbackDraw_map();
        }else{
          s.playbackDraw_smart();
        }
        //クリックアニメーション中はfpsを止める
        if(clickAnimation == false){
          fps++;
        }
      }
    }

    if(saveflag){ //saveflagがオンの時
      if(playback){
        save(imgCount_local, mousex, mousey, clickFps, mode);
        first_save = true;
      }
      if(imgCount_local+1 == imgCount){
        if(first_save){
          url_save();
          first_save = false;
        }
        saveflag = false;
      }
    }
  
  }


  s.mouseReleased = function(){
    if(on){
    //画面内でのクリック
    if(s.mouseX <= s.width - 100 && s.mouseX >= 0 && s.mouseY <= s.height && s.mouseY >= 0){
    
      //録画モード中はクリック時のfpsを保存
      if(record){
        clickFps.push(fps);
        clickCnt++;
      }
    
      //再生モード中は録画モードへの移行
      if(playback){
        fps = 0;
        mousex.length = 0;
        mousey.length = 0;
        clickFps.length = 0;
        clickCnt = 0;
        playbackCnt = 0;
        playback = false;
        record = true;
        if(mode == 0){
          s.tint(255, 0, 0, 100);
        }else if(mode == 1){
          s.tint(255, 100);
        }else{
          s.tint(255,100);
        }
      }
    
      //最初の状態での処理
      if(record == false && playback == false){
        record = true;
        if(mode == 0 ){
          s.tint(255, 0, 0, 100);
        }else if(mode == 1){
          s.tint(255,100);
        }else{
          s.tint(255,100);
        }
      }
    
    }else if( !record && !playback && s.mouseX >= s.width-75 &&  s.mouseY >= s.height-95 && s.mouseX <= s.width-75+50 && s.mouseY <= s.height-95+70){ //モードチェンジボタンのクリック
      if(mode == 0){
        s.tint(255,255);
        mode = 1;
      }else if(mode == 1){
        s.tint(255,0,0,100);
        mode = 2;
      }else{
        s.tint(255,255);
        mode = 0;
      }
      defoMode = mode;
      fps = 0;
      mousex.length = 0;
      mousey.length = 0;
      clickFps.length = 0;
      clickCnt = 0;
      record = false;
    }
  
    //画面外でのクリック
    else{
    
      //録画モード中は再生モードへの移行
      if(record && clickCnt > 0){
        fps = 0;
        clickAnimation = false;
        record = false;
        playback = true;
        if(mode == 0){
          s.tint(255, 0, 0, 250);
        }else if(mode == 1){
          s.tint(255, 255, 255, 250);
        }else{
          s.tint(255, 0, 0, 250);
        }
      }

      //一度も画面内でクリックしていなかったら録画取り消し
      if(record && clickCnt == 0){
        fps = 0;
        mousex.length = 0;
        mousey.length = 0;
        record = false;
      }
    
    }
  }

  }


  //録画モード中の描画
  s.recordDraw = function(){
  
    //録画
    mousex.push(s.mouseX);
    mousey.push(s.mouseY);
  
    //残像の描画
    for(var i = 0; i < fps; i+=6){
      if(mousex[i] < s.width - 100){
        s.image(mouse, mousex[i] - 5, mousey[i]);
      }
    }
  
    //クリック位置の描画
    s.stroke(0);
    s.fill(255, 0, 0);
    for(var i = 0; i < clickCnt; i++){
      s.ellipse(mousex[clickFps[i]], mousey[clickFps[i]], 10, 10);
    }
  
  }




  //再生モード中の描画
  s.playbackDraw = function(){
  
    //クリック中アニメーション
    if(clickAnimation){
      s.image(hand, mousex[clickFps[playbackCnt]]-10, mousey[clickFps[playbackCnt]]);
      s.noFill();
      s.stroke(255, 0, 0);
      s.ellipse(mousex[clickFps[playbackCnt]], mousey[clickFps[playbackCnt]], animeFps, animeFps);
      animeFps--;
    
      //クリック中アニメーション終了時の処理
      if(animeFps == 0){
        clickAnimation = false;
        playbackCnt++;
      
        //playbackCntとclickCntが同じになったら最初から再生のためにリセット
        if(playbackCnt == clickCnt){
          fps = 0;
          playbackCnt = 0;
        }
      
      }
    }
  
    //マウス移動中アニメーション
    else{
      if(fps == clickFps[playbackCnt]){//クリックした場所に到達した時にクリック中アニメーションに移行
        animeFps = 60;
        clickAnimation = true;
      }else{
        if(mousex[fps] < s.width - 100){
          s.image(mouse, mousex[fps]-10, mousey[fps]);
        }
      }
    }

  }


  //足跡モードの録画モード中の描画
  s.recordDraw_map = function(){
            
    //録画
    mousex.push(s.mouseX);
    mousey.push(s.mouseY);
    
    //残像の描画
    for(var i = 8; i < fps; i+=8){
      if(mousex[i] < s.width - 100){
    
        s.push();
        s.translate(mousex[i]-3, mousey[i]);
        var theta = s.atan2(mousex[i]-mousex[i-8]-6, mousey[i]-mousey[i-8]);
        s.rotate(-theta);
        s.tint(255, 100);
        s.image(foot,-foot.width/2, -foot.height/2);
        s.pop();

      }
    }
    
    //クリック位置の描画
      s.stroke(0);
      s.fill(255, 0, 0);
      for(var i = 0; i < clickCnt; i++){
        s.ellipse(mousex[clickFps[i]], mousey[clickFps[i]], 10, 10);
      }
      s.tint(255, 255);
      s.image(man, s.mouseX-9, s.mouseY-30);
  }




  //足跡モードの再生モード中の描画
  s.playbackDraw_map = function(){
    
    //クリック中アニメーション
    if(clickAnimation){

        for(var i = 8; i < fps; i+=8){
          if(mousex[i] < s.width-100){
          s.push();
          s.translate(mousex[i]-3, mousey[i]);
          var theta = s.atan2(mousex[i]-mousex[i-8]-6, mousey[i]-mousey[i-8]);
          s.rotate(-theta);
          s.tint(255, 100);
          s.image(foot,-foot.width/2, -foot.height/2);
          s.pop();
        }
      }
      s.tint(255, 255);
      s.image(man, mousex[clickFps[playbackCnt]]-9, mousey[clickFps[playbackCnt]]-30);
      s.noFill();
      s.stroke(255, 0, 0);
      s.ellipse(mousex[clickFps[playbackCnt]], mousey[clickFps[playbackCnt]], animeFps, animeFps);
      animeFps--;
              
      //クリック中アニメーション終了時の処理
      if(animeFps == 0){
        clickAnimation = false;
        playbackCnt++;

        //playbackCntとclickCntが同じになったら最初から再生のためにリセット
        if(playbackCnt == clickCnt){
          fps = 0;
          playbackCnt = 0;
        }
      }
    }
            
    //マウス移動中アニメーション
    else{
      if(fps == clickFps[playbackCnt]){//クリックした場所に到達した時にクリック中アニメーションに移行
        animeFps = 60;
        clickAnimation = true;
      }else{
          for(var i = 8; i < fps; i+=8){
            if(mousex[i] < s.width - 100){
            s.push();
            s.translate(mousex[i]-3, mousey[i]);
            var theta = s.atan2(mousex[i]-mousex[i-8]-6, mousey[i]-mousey[i-8]);
            s.rotate(-theta);
            s.tint(255, 100);
            s.image(foot,-foot.width/2, -foot.height/2);
            s.pop();
          }
          }
      }
      if(mousex[fps] < s.width - 100){
        s.tint(255,255);
        s.image(man, mousex[fps]-9, mousey[fps]-30);
      }
    }

  }

    //録画モード中の描画
  s.recordDraw_smart = function(){
  
    //録画
    mousex.push(s.mouseX);
    mousey.push(s.mouseY);
  
    //残像の描画
    for(var i = 0; i < fps; i+=6){
      if(mousex[i] < s.width - 100){
        s.image(finger, mousex[i] - 15, mousey[i]);
      }
    }
  
    //クリック位置の描画
    s.stroke(0);
    s.fill(255, 0, 0);
    for(var i = 0; i < clickCnt; i++){
      s.ellipse(mousex[clickFps[i]], mousey[clickFps[i]], 10, 10);
    }
  
  }




  //再生モード中の描画
  s.playbackDraw_smart = function(){
  
    //クリック中アニメーション
    if(clickAnimation){
      if(animeFps >= 50){
        s.image(finger, mousex[clickFps[playbackCnt]]-15, mousey[clickFps[playbackCnt]], animeFps + finger.width-60, animeFps + finger.height-60);
      }else{
        s.image(finger, mousex[clickFps[playbackCnt]]-15, mousey[clickFps[playbackCnt]], 50 + finger.width-60, 50 + finger.height-60);

      }
      s.noFill();
      s.stroke(255, 0, 0);
      s.ellipse(mousex[clickFps[playbackCnt]], mousey[clickFps[playbackCnt]], 60-animeFps, 60-animeFps);
      animeFps--;
    
      //クリック中アニメーション終了時の処理
      if(animeFps == 0){
        clickAnimation = false;
        playbackCnt++;
      
        //playbackCntとclickCntが同じになったら最初から再生のためにリセット
        if(playbackCnt == clickCnt){
          fps = 0;
          playbackCnt = 0;
        }
      
      }
    }
  
    //マウス移動中アニメーション
    else{
      if(fps == clickFps[playbackCnt]){//クリックした場所に到達した時にクリック中アニメーションに移行
        animeFps = 60;
        clickAnimation = true;
      }else{
        if(mousex[fps] < s.width - 100){
          s.tint(255,255);
          s.image(finger, mousex[fps]-15, mousey[fps]);
        }
      }
    }

  }

  //connect.jsからデータを呼んでくる
  s.loadData = function(){
    if(loadflag){ //loadは一回
        if(loadCount+1 == imgCount_local){ //自分の番が来たらロード開始
          load(imgCount_local, $('img').length);
          loadflag = false;
          loadEnd = false;
        }
      }
      if(loadCount == imgCount_local && loadEnd){ //自分のロードが終わったらデータを適切な配列にコピーし、再生させる
        mousex = $.extend(true, [], tempx);
        mousey = $.extend(true, [], tempy);
        clickFps = $.extend(true, [], tempClick);
        mode = tempMode;
        clickCnt = clickFps.length;
        if(mousex[0]>=0){
          playback = true;
          record = false;
          if(mode == 0){
            s.tint(255, 0, 0, 250);
          }else if(mode == 1){
            s.tint(255, 255);
          }else{
            s.tint(255, 255);
          }
        }
        loadEnd = false;
      }
  }

  //-------UIの描画関数-------
  //録画モード中
  s.recordUI = function(){
    s.stroke(200);
    s.fill(100, 200);
    s.rect(s.width-85, 0, s.width, s.height);
    s.stroke(0);
    s.fill(255, 0, 0);
    s.ellipse(s.width-50, 20, 15, 15);
    if(fps % 80 > 30){
      s.text("REC", s.width-35, 25);
    }
    s.fill(255, 0, 0);
    s.rect(s.width-75, s.height-40, 50, 30);
    s.fill(255);
    s.text("stop", s.width-65, s.height-20);
  }

  //マウスオーバー時のメニュー
  s.UI = function(){

    s.stroke(200);
    s.fill(100, 200);
    s.rect(s.width-85, 0, s.width, s.height);
    s.stroke(0);
    s.fill(255);
    s.text("Click to Start" ,s.width-82, 20);
    if(mode == 0){
      s.fill(0, 200, 0);
    }else if(mode == 1){
      s.fill(100, 200, 0);
    }else{
      s.fill(0, 200, 100);
    }

    //ここからはモード切り替え
    s.rect(s.width-75, s.height-95, 50, 70);
    s.fill(0);
    s.text("Change", s.width-73, s.height-80);
    s.text("Mode", s.width-70, s.height-30);
    s.text("/3", s.width-43, s.height-52);

    var changeMenu = false;
    if(s.mouseX >= s.width-75 && s.mouseX <= s.width-75+50 && s.mouseY >= s.height-95 && s.mouseY <= s.height-95+70){
      changeMenu = true;
    }

    if(!changeMenu){
      icony = s.height-80;
      iconx = 0;
    }else{
      if(icony != s.height-120){
        icony -= 2;
      }
      if(iconx != 20){
        iconx++;
      }
    }


    if(mode == 1){
      s.tint(255,255);
      s.image(man, s.width-65, s.height-80);
      if(changeMenu){
        s.tint(255,255,255,100);
        s.image(finger, s.width-65+iconx, icony, finger.width-20, finger.height-20);
        s.tint(255,0,0,100);
        s.image(mouse, s.width-65-iconx, icony);
      }
      s.tint(255, 0, 0, 100);
    }else if(mode == 0){
      s.tint(255,0,0);
      s.image(mouse, s.width-65, s.height-75);
      if(changeMenu){
        s.tint(255,255,255,100);
        s.image(man, s.width-65+iconx, icony);
        s.tint(255,255,255,100);
        s.image(finger, s.width-65-iconx, icony, finger.width-20, finger.height-20);
      }
      s.tint(255, 255);
    }else{
      s.tint(255,255);
      s.image(finger, s.width-68, s.height-75, finger.width-22, finger.height-22);
      if(changeMenu){
        s.tint(255,0,0,100);
        s.image(mouse, s.width-65+iconx, icony);
        s.tint(255,255,255,100);
        s.image(man, s.width-65-iconx, icony);
      }
      s.tint(255,255);
    }
  }
}