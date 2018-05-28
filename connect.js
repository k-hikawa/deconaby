//phpデータやりとり用js

var PHPURL = 'https://nkmr.io/deconaby/system/deconaby_system.php';

//装飾データの保存
function save(imgId, x, y, clickFps, mode){
	var id = date+""+rand;
	var json_data = {
		'id' : id,
		'imgId' : imgId,
		'x' : x,
		'y' : y,
		'clickFps' : clickFps,
		'mode' : mode
	}
	$.ajax({
		type: 'POST',
		url: PHPURL,
		data: json_data,
		success: function(data){
			//console.log('SaveConnect'+imgId+': Success');
		},
		error: function(){
			console.log('SaveConnect'+imgId+': Error');
  	}
	});
}


//ページのURLの保存
function url_save(){
	var pageURL = location.protocol+"//"+location.host+location.pathname+location.search;
	var publish = "0"; //公開は0
	if(isset($('#check_release').val())){
		publish = $('#check_release').val(); //公開
	}

	var id = date+""+rand;
	var json_data = {
		'id' : id,
		'pageURL' : pageURL,
		'publish' : publish
	}

	$.ajax({
		type: 'POST',
		url: PHPURL,
		data: json_data,
		success: function(data){
			//console.log('UrlSaveConnect: Success');
			setTimeout(function(){
        location.href = "#DeconaId="+id;
        window.location.reload(); //現在のページをID付きに変更する
				//window.open(pageURL+"#DeconaId="+id);	//新しいタブにid付きのページを開く
			},1);
		},
		error: function(){
			console.log('UrlSaveConnect: Error');
		}
	});

}

//装飾データの取得
function load(imgId, imgLen){
		$.ajax({
			type: 'POST',
			url: PHPURL,
			data:{
				'deconaId' : location.hash,
				'url' : location.protocol+"//"+location.host+location.pathname+location.search,
				'imgId' : imgId
			},
			success: function(data){
				loadCount++;
				loadEnd = true;
				//console.log('LoadConnect: Success');
				//phpのjsonを受け取る
				dataApply(JSON.parse(data));
			},
			error: function(){
				console.log('LoadConnect: Error');
			}
		});
}




// 受け取ったjsonをそれぞれ適切なグローバル変数に入れる
function dataApply(data){
	tempx.length = 0;
	tempy.length = 0;
	tempClick.length = 0;
	tempMode=0;
  	if(data[0].x[0] != -1){
    	for(var i=0; i<data[0].x.length; i++){
      		tempx.push(Number(data[0].x[i]));
      		tempy.push(Number(data[0].y[i]));
    	}
    	for(var i=0; i<data[0].clickFps.length; i++){
    		tempClick.push(Number(data[0].clickFps[i]));
    	}
    	tempMode = Number(data[0].mode);
    	
  	}
}

function getId_list(){
	$.ajax({
		type:'POST',
		url: PHPURL,
		data:{
			'requestURL' : location.protocol+"//"+location.host+location.pathname+location.search
		},
		success: function(data){
      //console.log('LoadConnect: Success');
			requestURL_dataApply(JSON.parse(data));
		},
		error: function(){
			console.log('getId_list: Error');
		}
	});
}

function requestURL_dataApply(data){
	var exampleId = [];
	for(var i=0; i<data[0].id.length; i++){
		exampleId.push(data[0].id[i]);
	}
	if(exampleId.length == 0){
		if($("#form_list").css('display') == 'block'){
			//ページに他の装飾がない場合
			$("#list_id").append("<option selected>装飾がありません</option>");
		}
	}else{
		if($("#form_list").css('display') == 'none'){
			//装飾IDがあるページなら、メニューの色を変える
			$("#deconav a").css("background-color", "rgba(65, 204, 98, 0.8)");
			$("#deconav a").hover(function(){
				$(this).css("background-color", "rgba(81, 219, 112, 0.8)");
			},
			function(){
				$("#deconav a").css("background-color", "rgba(65, 204, 98, 0.8)");
			});
		}
		for(var i=0; i < exampleId.length; i++){
			if(location.hash.substr(location.hash.length-14) != exampleId[i]){
				$("#list_id").append("<option id='"+exampleId[i]+"' value='"+location.protocol+"//"+location.host+location.pathname+location.search+"#DeconaId="+exampleId[i]+"'>"+exampleId[i]+"</option>");
      }
		}
  }
}



function login_check(){
    var name = $("#name").val();
    $.ajax({
      type: 'POST',
      url: PHPURL,
      data: {
        'name' : name,
        'pass' : $("#pass").val()
      },
      success: function(data){
        //console.log('loginConnect: Success');
        if(data.length == 1){
          $("#check").html("入力エラー");
        }else{
          login($("#name").val());
        }
      },
      error: function(){
        console.log('loginConnect: Error');
      }
    });
}


//名前が登録できるかどうかのリアルタイムチェック
function name_check(r_name){
  $.ajax({
    type: 'POST',
    url: PHPURL,
    data: {
      'r_name' : r_name
    },
    success: function(data){
      //console.log('name_CheckConnect: Success');
      if(data.length == 0){
        nameOK = true;
        $("#nameAns").html("OK");
        if(passOK){
          visible_button();
        }
      }else{
        nameOK = false;
        $("#nameAns").html("NG");
        invisible_button();
      }
    },
    error: function(){
      console.log('name_CheckConnect: Error');
    }
  });
}

function old_pass_check(){
    var old_pass = $("#old_pass").val();
    $.ajax({
      type: 'POST',
      url: PHPURL,
      data:{
        'old_pass': old_pass
      },
      success: function(data){
        //console.log('pass_CheckConnect: Success');
        if(data.length == 1){
          old_passOK = false;
          $('#old_passAns').html("NG");
          invisible_button2();
        }else{
          old_passOK = true;
          if(new_passOK){
            visible_button2();
          }
          $('#old_passAns').html("OK");
        }
      },
      error: function(){
        console.log('pass_CheckConnect: Error');
      }
    });
}

function regist(){
  $.ajax({
    type: 'POST',
    url: PHPURL,
    data: {
      'r_name': $("#r_name").val(),
      'r_pass': $("#r_pass").val()
    },
    success: function(data){
      //console.log('registConnect: Success');
      $('#form_regist').hide();
      $('#user_page').show();
      $('#deconav').show();
      $('#start').hide();
      $('#user_menu').show();
      sanitizing('#user_name', $('#r_name').val());
      sanitizing('#user_name2', $('#r_name').val());
      nameOK = false;
      passOK = false;
      $("#r_name").val("");
      $("#r_pass").val("");
      $("#r_pass2").val("");
      $("#nameAns").html("NG");
      $("#passAns").html("NG");
      invisible_button();
    },
    error: function(){
      console.log('registConnect: Error');
    }
  });
}

function passChange(){
	$.ajax({
      type: 'POST',
      url: PHPURL,
      data: {
        'user_name' : $('#user_name2').html(),
        'new_pass' : $('#new_pass').val()
      },
      success: function(data){
        //console.log("passChangeConnect: Success");
        $('#pass_result').html("パスワードを変更しました");
        invisible_button2();
        $('#old_pass').val("");
        $('#new_pass').val("");
        $('#new_pass2').val("");
        $('#old_passAns').html("NG");
        $("#new_passAns").html("NG");
      },
      error: function(){
        console.log("passChangeConnect: Error");
      }
    });
}


function logout(){
	$.ajax({
      type: 'POST',
      url: PHPURL,
      data: {
        'porpose' : 'logout'
      },
      success: function(data){
        //console.log("logoutConnect: Success");
        $('#user_name').html("");
        $('#user_name2').html("");
        $('#user_menu').hide();
        $('#start').show();
        $('#check_release').prop('checked', true);
      },
      error: function(){
        console.log("logoutConnect: Error");
      }
    });
}

//現在のページの装飾リクエストを送る
function deco_request(){
  var time = (+new Date());
  var request_url = location.protocol+"//"+location.host+location.pathname+location.search;
  $.ajax({
    type: 'POST',
    url: PHPURL,
    data: {
      'request_url' : request_url,
      'time' : time
    },
    success: function(data){
      //.log("requestConnect: Success");
    },
    error: function(){
      console.log("requestConnect: Error");
    }
  });
}

//現在のページに装飾リクエストが来ているかどうかのチェック
function request_check(data){
  var current_url = location.protocol+"//"+location.host+location.pathname+location.search;
  $.ajax({
    type: 'POST',
    url: PHPURL,
    data: {
      'porpose' : 'request_check',
      'url' : current_url
    },
    success: function(data){
      //console.log("requestCheck: Success");
      if(data != 1){
        $("#deconav a").css("background-color", "rgba(255, 20, 137, 0.8)");
        $("#deconav a").hover(function(){
          $(this).css("background-color", "rgba(255, 35, 151, 0.8)");
        },
        function(){
          $("#deconav a").css("background-color", "rgba(255, 20, 137, 0.8)");
        });
      }
    },
    error: function(){
      console.log("requestCheck: Error");
    }
  });
}


var isset = function(data){
    if(data === "" || data === null || data === undefined){
      return false;
    }else{
      return true;
    }
};
