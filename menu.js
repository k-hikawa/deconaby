//メニュー動作のjs

var on = false;       //システムのスイッチ
var saveflag = false; //saveスイッチ

var rand = 0;         //idに使う乱数
var date = 0;         //idに使う日付

var showPageId = "";


//menuのhtml
//var menu_html = '<div id="deconaMenu"><ul id="deconav"><li><a id="deconaTitle" style="cursor: default; text-decoration: none;">Deconaby<span id="btn_close">&times;</span><br><span id=user_name></span></a><ul><div id="start"><li><a id="btn_login">ログイン</a></li><li><a id="btn_regist">新規登録</a></li></div><div id="user_menu" style="display: none"><li><a id="btn_system">ON</a></li><li style="display: none;" id="btn_list"></li><li><a id="btn_list2">装飾ID一覧</a></li><li style="display: none;" id="btn_createUrl"><a>URL発行</a></li><li><a id="btn_set">設定</a></li><li><a id="btn_logout">ログアウト</a></li></div></ul></li></ul><div id=form><div id="form_login" style="display: none"><h3>ログイン</h3><p>name:<input type="text" id="name"></p><p>pass:<input type="password" id="pass"></p><p><span id="check"></span></p><a id="login">ログイン</a><a id="login_back">Back</a></div><div id="form_regist" style="display: none"><h3>新規登録</h3><p>name:<input type="text" id="r_name"><span id="nameAns">NG</span></p><p>※nameは2文字以上</p><p>pass:<input type="password" id="r_pass"></p><p>確認:<input type="password" id="r_pass2"><span id="passAns">NG</span></p><p>※passは2文字以上</p><a id="regist" style="visibility: hidden;">新規登録</a><a id="regist_back">Back</a></div><div id="form_set" style="display: none"><h3><span id="user_name2"></span></h3><h3>設定</h3><h4>passの変更</h4><p>現在のpass:<input type="password" id="old_pass"><span id="old_passAns">NG</span></p><p>新しいpass:<input type="password" id="new_pass"></p><p>確認:<input type="password" id="new_pass2"><span id="new_passAns">NG</span></P><p>※passは2文字以上</p><p id="pass_result"></p><a id="btn_change" style="visibility: hidden;">変更を確定</a><hr class="deconaLine"><h4 class="decona_h4">公開設定</h4><p><input type="checkbox" id="check_release" checked="checked">装飾ページの公開を許可</p><p>※ページを更新するごとに公開設定になります</p><hr class="deconaLine"><a id="set_back">Back</a></div><div id="form_list" style="display: none"><h3>装飾ID一覧</h3><p>クリックすると装飾付きページに移動します</p><p><select size ="5" id="list_id"></select></p><p><a id="list_back">Back</a></p></div>';
var menu_html = chrome.extension.getURL("html/menu.html");

var form_back = chrome.extension.getURL("img/polaroid.png");



//閲覧ページがgyazoかどうかの判定
var gyazo_page = false; //gyazoか否か
if(location.protocol+"//"+location.host == "https://gyazo.com" && location.pathname.length == 33){
  gyazo_page = true;
}

//menuをbodyタグの下に挿入
  if($('body').length){
    $('body').prepend("<div id='deconaMenu'></div>");
  }else{
    console.log("Deconabyは利用できないページです");
  }



$(function(){

  

  $("#deconaMenu").load(menu_html);

  setTimeout(function(){
    var deconav = $('#deconav');
    var navTop = deconav.offset().top;
    $('li',deconav).hover(function(){
      $('ul',this).stop().slideDown('fast');
    },
    function(){
      $('ul',this).stop().slideUp('fast');
    });
      btn_functions();
  },1);


  //スクロール判定
  $(window).exScroll(function(api){
      if(api.getTiming() == 'start' && (api.isScrollX() || api.isScrollY())){
          $('#deconaMenu').addClass('decona_fixed');
      }
  });

  //ログインしているかどうかを調べる
  check_cookie();


  //背景画像設定
  set_background();

  
  getId_list();
  //request_url_list();

  //募集中ページならメニュー色を赤に変える
  request_check();

});


//スイッチオンオフのテキストを返す関数
function getchangemess_on(){
  if(on){
    return "OFF";
  }else{
    return "ON";
  }
}

//システムのオンオフを切り替える関数
function changeOnoff(){
  on = !on;
  $('#btn_system').html(getchangemess_on());

  $('img').parent('a').each(function(){ // 画像にリンクが貼られていたら装飾できないので無効化しておく
    $(this).replaceWith($('img').parent('a').html());
  });

  /*$('img').parent('a').click(function(){ // 画像にリンクが貼られていたら装飾できないので無効化しておく
    if(on){
        return false;
      }else{
        return true;
      }
    });*/

  if(on){
    canvas_set();
    $('#btn_list2').hide();
    $('#btn_createUrl').show();
    //gyazoならクリックを無効に
    if(gyazo_page){
      $("#react-root").css("pointer-events", "none");
    }
    //$('#hikawa_button').val('装飾を保存してURLを発行する');
  }else{
    $('img').parent('.deco_area').each(function(){ // 画像にリンクが貼られていたら装飾できないので無効化しておく
      $(this).replaceWith($('img').parent('.deco_area').html());
    });
    $('.deco').remove();
    $('#btn_list2').show();
    $('#btn_createUrl').hide();
    //$('#hikawa_button').val('このページでの'+syste_name+'を終了する');
    //gyazoならクリックを有効に
    if(gyazo_page){
      $("#react-root").css("pointer-events", "auto");
    }
  }
}





function check_cookie(){
    $.ajax({
    type: 'POST',
    url: PHPURL,
    data: {
      'porpose' : 'loginCheck'
    },
    success: function(data){
      if(data.length == 0){
        console.log('not login');
      }else{
        //console.log('login'+data);
        $('#start').hide();
        $('#user_menu').show();
        sanitizing('#user_name', data);
        sanitizing('#user_name2', data);
      }
    },
    error: function(){
      console.log('Connect: Error');
    }
  });
}

function set_background(){
  $("#form").css('background-image', form_back);  
}

function btn_functions(){
  //装飾ID一覧のセレクトボックスがクリックされた時
  $('select#list_id').change(function(){
    //装飾を募集するを選択した時
    if($(this).val() === "deco_request"){
      deco_request();

    //IDをクリックした時、ページを移動する
    }else{
      location.href = $(this).val();
      window.location.reload();
    }
  });

  //全消しボタンが押された時
  $('#btn_close').click(function(){
    $('#deconaMenu').fadeOut('normal').queue(function(){
      $('#deconaMenu').remove();
      $('.deco').remove();
      //gyazoならクリック機能を元に戻す
      if(gyazo_page){
        $("#react-root").css("pointer-events", "auto");
      }
    });
  });
  $('#btn_login').click(function(){
    $('#deconav').hide();
    $('#form_login').show();
    $('#name').val("");
    $('#pass').val("");
  });
  $('#btn_regist').click(function(){
    $('#deconav').hide();
    $('#form_regist').show();
  });
  $('#regist_back').click(function(){
    nameOK = false;
    passOK = false;
    $('#r_name').val("");
    $('#r_pass').val("");
    $('#r_pass2').val("");
    $('#nameAns').html("NG");
    $('#passAns').html("NG");
    $('#form_regist').hide();
    $('#deconav').show();
  });
  $('#login_back').click(function(){
    $('#name').val("");
    $('#pass').val("");
    $('#form_login').hide();
    $('#deconav').show();
  });
  //リストから戻るボタンを押した時
  $('#list_back').click(function(){
    $("#list_id").empty();
    $('#form_list').hide();
    $("#deconav").show();
  });
  $('#login').click(function(){
    login_check();
  });
  $('#regist').click(function(){
    regist();
  });
  $('#btn_set').click(function(){
    $('#deconav').hide();
    $('#form_set').show();
  });
  $('#set_back').click(function(){
    $('#form_set').hide();
    $('#old_passAns').html("NG");
    $("#new_passAns").html("NG");
    new_passOK = false;
    old_passOK = false;
    $("#new_pass").val("");
    $("#new_pass2").val("");
    $("#old_pass").val("");
    $("#pass_result").html("");
    invisible_button2();
    $('#deconav').show();
  });
  $('#btn_change').click(function(){
    passChange();
  });

  //一覧をクリックした時
  $('#btn_list2').click(function() {

    $("#deconav").hide();
    $("#form_list").show();
    $("#list_id").html("");
    getId_list();
  });
  $('#btn_createUrl').click(function(){
    if(!saveflag && on){
      saveflag = true;
      rand = Math.floor(Math.random()*10); //idは"時間+乱数"とする
      date = (+new Date());
    }
  });

  $("#btn_request").click(function(){
    deco_request();
    $("#btn_request").hide();
    $("#deconav a").css("background-color", "rgba(255, 20, 137, 0.8)");
    $("#deconav a").hover(function(){
      $(this).css("background-color", "rgba(255, 35, 151, 0.8)");
    },
    function(){
      $("#deconav a").css("background-color", "rgba(255, 20, 137, 0.8)");
    });
  });

  $('#btn_logout').click(function(){
    logout();
  });
  
  //フォームクリックイベント
  $('#name').click(function(){
    $('#check').html("");
  });
  $('#pass').click(function(){
    $('#check').html("");
  });
  $('#r_name').change(function(){
    var r_name = $("#r_name").val();
    if(r_name.length >= 2){
      name_check(r_name);
    }if(r_name.length == 0){
      $("#nameAns").html("");
    }else{
      $("#nameAns").html("NG");
    }
  });
  $("#btn_system").click(function(){
    changeOnoff();
  });

  //フォーム入力イベント
  $('#r_pass').change(function(){
    pass_check($('#r_pass').val(), $('#r_pass2').val());
  });
  $('#r_pass2').change(function(){
    pass_check($('#r_pass').val(), $('#r_pass2').val());
  });
  $('#old_pass').change(function(){
    $('#pass_result').html("");
    old_pass_check();
  });
  $('#new_pass').change(function(){
    $('#pass_result').html("");
    pass_check2($('#new_pass').val(), $('#new_pass2').val());
  });
  $('#new_pass2').change(function(){
    $('#pass_result').html("");
    pass_check2($('#new_pass').val(), $('#new_pass2').val());
  });

}


  



function login(name){
  $("#form_login").hide();
  $('#deconav').show();
  $('#start').hide();
  $('#user_menu').show();
  sanitizing('#user_name', name);
  sanitizing('#user_name2', name);
}

var nameOK = false;
var passOK = false;




function pass_check(pass1, pass2){
  if(pass1.length >=2 && pass2.length >=2 && pass1 === pass2){
    passOK = true;
    $("#passAns").html("OK");
    if(nameOK){
      visible_button();
    }
  }else{
    passOK = false;
    $("#passAns").html("NG");
    invisible_button();
  }
}

var new_passOK = false;
var old_passOK = false;


function pass_check2(pass1, pass2){
  if(pass1.length >=2 && pass2.length >=2 && pass1 === pass2){
    new_passOK = true;
    if(old_passOK){
      visible_button2();
    }
    $("#new_passAns").html("OK");
  }else{
    new_passOK = false;
    $("#new_passAns").html("NG");
    invisible_button2();
  }
}

function visible_button(){
  $("#regist").css('visibility', 'visible');
}

function invisible_button(){
  $("#regist").css('visibility', 'hidden');
}

function visible_button2(){
  $('#btn_change').css('visibility', 'visible');
}

function invisible_button2(){
  $('#btn_change').css('visibility', 'hidden');
}



//クロスサイトスクリプティング対策 (挿入先id,挿入する文字列)
function sanitizing(targetId, targetStr){
  $(targetId).text(targetStr).html();
}