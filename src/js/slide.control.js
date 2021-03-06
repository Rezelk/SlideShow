/**
 * File     : slide.control.js
 * Encoding : UTF-8 without BOM
 * Title    : Slide Show Parser Script
 * Desc.    : スライドショーのコントロールスクリプトです。
 *          : スライドショーの操作を実装します。
 *          :
 * Author   : Rezelk
 * Changes  : 2013/06/27 - 0.1.0 - Rezelk - Created
 *          : 2013/07/17 - 0.1.3 - Rezelk - Compatible with IE9
 *          : 2013/08/09 - 0.1.6 - Rezelk - Fix scroll bar issue
 *          : 2013/08/09 - 0.2.0 - Rezelk - Add the feature of multi-slide
 */

// スクリプト固有の名前空間を作成
slide.control = {};

//============================================================================//
// スクリプト情報＆動作設定 - begin
slide.control.script = {
	// スクリプト情報
	thisFile     : "slide.control.js",
	name         : "Slide Show Parser",
	
	// スクリプト動作設定
	// なし
};
// スクリプト情報＆動作設定 - end
//============================================================================//

console.info("'" + slide.control.script.thisFile + "' is loaded.");

//============================================================================//
// 要素のリサイズ処理
slide.control.resizeTimer = false;
slide.control.fixElementSize = function() {
	// リサイズ時に連続してイベントが発生するため、タイマーにより処理を抑止
	if (slide.control.resizeTimer !== false) {
		clearTimeout(slide.control.resizeTimer);
	}
	slide.control.resizeTimer = setTimeout(function() {
		console.info("Fit elements to window size.");
		
		// コントロールを表示
		$("nav.control").fadeIn();
		
		// コンテンツの高さ取得 - begin
		//var elem = document.documentElement;
		var body = document.getElementsByTagName('body')[0];
		//var width = window.innerWidth || elem.clientWidth || body.clientWidth;
		//var height = window.innerHeight|| elem.clientHeight|| body.clientHeight;
		var width = window.innerWidth || body.clientWidth;
		var height = window.innerHeight || body.clientHeight;
		// コンテンツの高さ取得 -end
		
		// コントロールボタンの領域高さを取得
		var buttonsHeight = $("nav.control .buttons").height();
		
		// コンテナ領域の高さをリサイズ
		$("#container").width( width );
		$("#container").height( height );
		
		// オーバーレイ、プレゼン領域の領域の高さは
		// ページ高さ－コントロールボタンの高さとする
		$("nav.control .overlays").contents().height( height - buttonsHeight );
		$("#presentation").height( height - buttonsHeight );
		// コントロールボタンの位置を変更
		$("nav.control .buttons").css({top: height - buttonsHeight + "px"});
		
	}, 50);
};

// 現在のページを表示
slide.control.showPage = function() {
	console.info("Show slide of " + slide.stats.currentPageNo + " page.");
	// スライドから現在のページをクローンしてプレゼン領域に表示
	var $page = $("#slide .page").eq(slide.stats.currentPageNo).clone();
	$page.height(slide.core.$presen.height());
	slide.core.$presen.append( $page );
	
	$("nav.control .overlays").width( $("#presentation .page")[0].scrollWidth );
	
	// プログレスを更新
	var pageNo = slide.stats.currentPageNo + 1;
	slide.control.updateRabbit(pageNo);
};

// うさぎの更新
slide.control.updateRabbit = function(pageNo) {
	// うさぎプログレスの更新
	var maxPageNo = $("#slide .page").length;
	$(".rabbitProgress").text(pageNo + " / " + maxPageNo);
	// うさぎの更新
	var pagePer = (pageNo / maxPageNo * 100) + "%";
	$("#rabbit").width(pagePer);
};

// プレゼン開始
slide.control.totalSec = 0;
slide.control.startPresentation = function() {
	console.info("Starting presentation.");
	// オーバーレイのスタートボタンを非表示
	$("nav.control .overlays .start").fadeOut();
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	// 一枚もスライドがない場合は処理終了
	if ($("#slide .page").length <= 0) {
		console.warn("No pages.");
		return true;
	}
	// ページ番号を取得
	var pageNo = parseInt($("nav.control .buttons .pageNo").val());
	// ページ番号が有効範囲の場合はそのページを表示
	if (pageNo && pageNo > 0 &&  pageNo <= $("#slide .page").length) {
		pageNo = pageNo - 1;
	// ページ番号が有効範囲より大きい場合は最後のページを表示
	} else if (pageNo && pageNo > $("#slide .page").length) {
		pageNo = $("#slide .page").length - 1;
	// その他の無効な入力の場合は最初のページを表示
	} else {
		pageNo = 0;
	}
	
	// google-code-prettifyの適用
	prettyPrint();
	
	// スライドショーを初めて開始したときはかめ発動
	if (slide.stats.isStarted === false && slide.ops.turtle.visible == "true") {
		// 時間を入力し、秒に変換
		var time = window.prompt("発表予定時間を入力(mm:ss)", "10:00");
		if (time == null || time.indexOf(":") == -1) {
			time = "00:00";
		}
		var times = time.split(":");
		var min = parseInt(times[0]);
		var sec = parseInt(times[1]);
		slide.control.totalSec = 0;
		if (min) {
			slide.control.totalSec += min * 60;
		}
		if (sec) {
			slide.control.totalSec += sec;
		}
		// かめのアニメーション時間を発表時間に設定し、かめの幅をページ幅一杯に
		// 変更することにより、発表時間分の時間をかけてバーが伸びていく
		$("#turtle").css({
			"transition-duration":slide.control.totalSec + "s",
			"-moz-transition-duration":slide.control.totalSec + "s",
			"-webkit-transition-duration":slide.control.totalSec + "s",
			"-o-transition-duration":slide.control.totalSec + "s"
		});
		$("#turtle").width("100%");
		// かめ進捗（経過時間）を表示
		slide.control.showTurtleProgress();
		slide.control.turtleTimer = setTimeout(slide.control.showTurtleProgress, 100);
		
	}
	// スライドを表示
	slide.stats.isStarted = true;
	slide.stats.currentPageNo = pageNo;
	slide.control.showPage();
};

// １つ前のスライドを表示
slide.control.showPrevSlide = function() {
	console.info("Showing previous slide.");
	// スライドが開始していない場合は処理終了
	if (slide.stats.isStarted === false) {
		console.warn("Not start presentation.");
		return true;
	}
	// 先頭スライドの場合は処理終了
	if (slide.stats.currentPageNo <= 0) {
		console.warn("This page is first.");
		return true;
	}
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	// １つ前のスライドを表示
	slide.stats.currentPageNo--;
	slide.control.showPage();
};

// １つ先のスライドを表示
slide.control.showNextSlide = function() {
	console.info("Showing next slide.");
	// スライドが開始していない場合は処理終了
	if (slide.stats.isStarted === false) {
		console.warn("Not start presentation.");
		return true;
	}
	// 末尾スライドの場合は処理終了
	if (slide.stats.currentPageNo >= $("#slide .page").length - 1) {
		console.warn("This page is last.");
		return true;
	}
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	// １つ先のスライドを表示
	slide.stats.currentPageNo++;
	slide.control.showPage();
};

// スライドファイルを再読込
slide.control.reloadSlideshow = function() {
	console.info("Reloading slides.");
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	slide.stats.isStarted = false;
	// かめのリセット
	slide.control.resetTurtle();
	// 設定を読み込めていなければ処理終了
	if (slide.ops === undefined) return;
	// デザイン読込
	slide.core.loadDesgin();
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	// スライドファイルを読み込み
	$("#slide").contents().remove();
	for (var index = 0; index < slide.ops.slideshows.length; index++) {
		slide.core.loadSlide(index);
	}
	// プレゼンを開始
	slide.control.startPresentation();
};

// 時間(秒)をm:ss形式に変換
slide.control.getTimeAsMMSS = function(time) {
	var mm = Math.floor(time / 60);
	var ss = time - mm * 60;
	return mm + ":" + ((ss < 10) ? "0" + ss : ss);
};

// かめの時間経過
slide.control.turtleTimer = false;
slide.control.showTurtleProgress = function() {
	// かめの幅とページ幅から逆算するという荒技
	var turtleWidth = $("#turtle").width();
	var totalWidth = $("#container").width();
	var elapsedTime = Math.floor(slide.control.totalSec * turtleWidth / totalWidth);
	var leaveTime = slide.control.totalSec - elapsedTime;
	$(".turtleProgress").text( slide.control.getTimeAsMMSS(slide.control.totalSec) + " @ " + slide.control.getTimeAsMMSS(leaveTime) + " (" + slide.control.getTimeAsMMSS(elapsedTime) + ")" );
	// プレゼンが開始していなければかめ進捗は初期化
	if (slide.stats.isStarted == false) {
		clearTimeout(slide.control.turtleTimer);
		$(".turtleProgress").text("");
	}
	
	slide.control.turtleTimer = setTimeout(slide.control.showTurtleProgress, 100);
};

// かめをリセット
slide.control.resetTurtle = function() {
	// かめのリセット
	// アニメーション時間を0秒にして幅0に変更
	$("#turtle").css({
		"transition-duration":"0s",
		"-moz-transition-duration":"0s",
		"-webkit-transition-duration":"0s",
		"-o-transition-duration":"0s"
	});
	$("#turtle").width(0);
	// かめ進捗を初期化
	$(".turtleProgress").text("");
};

// アクションを要素に紐付ける
slide.control.apply = function() {
	
	// ウィンドウのリサイズ
	$(window).resize( slide.control.fixElementSize );
	
	// リロード(ボタン)クリック
	$("nav.control .buttons .reload").click( slide.control.reloadSlideshow );
	
	// 開始(共通)クリック
	$("nav.control .start").click( slide.control.startPresentation );
	
	// 前へ(共通)クリック
	$("nav.control .prev").click( slide.control.showPrevSlide );
	
	// 次へ(共通)クリック
	$("nav.control .next").click( slide.control.showNextSlide );
	
	// 開始(共通)クリック
	$("nav.control .overlays .start").hover(
	function() {
		// もやっとハイライト
		$(this).animate({opacity:"0.8"}, {duration:"100"});
	}, function() {
		// さっと戻す
		$(this).animate({opacity:"0.5"}, {duration:"100"});
	});
	
	// 前へ(オーバーレイ)マウスオーバー/アウト
	$("nav.control .overlays .prev").hover(function() {
		// もやっと表示
		$(this).animate({opacity:"0.4"}, {duration:"200"});
	}, function() {
		// さっと非表示
		$(this).animate({opacity:"0.0"}, {duration:"200"});
	});
	
	// 次へ(オーバーレイ)ウスオーバー/アウト
	$("nav.control .overlays .next").hover(function() {
		// もやっと表示
		$(this).animate({opacity:"0.4"}, {duration:"200"});
	}, function() {
		// さっと非表示
		$(this).animate({opacity:"0.0"}, {duration:"200"});
	});
	
	// ウィンドウでのキー入力
	$(window).keypress(function(event) {
		// フォーカスはHTMLに
		$("html").focus();
		
		// 0～9キーの場合はページ番号欄に入力
		if (event.which >= 48 && event.which <= 57) {
			var c = String.fromCharCode(event.which);
			$("nav.control .buttons .pageNo").val( $("nav.control .buttons .pageNo").val() + c );
		// Enterキーはスライドショー開始
		} else if (event.which == 13) {
			// ページ番号が空の場合
			if ($("nav.control .buttons .pageNo").val() == "") {
				$("nav.control .buttons .pageNo").val( slide.stats.currentPageNo + 2 );
			}
			// プレゼンを開始
			slide.control.startPresentation();
			// ページ番号をクリア
			$("nav.control .buttons .pageNo").val("");
		// 右キーの場合は次のスライドへ
		} else if (event.keyCode == 39) {
			slide.control.showNextSlide();
		// 左キーの場合は前のスライドへ
		} else if (event.keyCode == 37) {
			slide.control.showPrevSlide();
		}
	});
	
	// ページ番号フォーカス
	$("nav.control .buttons .pageNo").focus(function() {
		// ページ番号からフォーカスを外す
		$("nav.control .buttons .pageNo").blur();
	});
	
	// Drop notice表示
	var $fileDrop = $("<div>");
	$fileDrop.addClass("drop").hide();
	$("nav.control").append( $fileDrop );
	
	// ドラッグされた
	$("html").bind("dragenter", function(event) {
		
		// デフォルトイベントを殺す
		event.stopPropagation();
		event.preventDefault();
		// Drop noticeを表示
		$fileDrop.show();
		// プレゼン領域の初期化
		$("#presentation").contents().remove();
		$("nav.control .overlays .prev").css({opacity:0.0});
		$("nav.control .overlays .next").css({opacity:0.0});
	
	// ドラッグ中
	}).bind("dragover", function(event) {
		
		// デフォルトイベントを殺す
		event.stopPropagation();
		event.preventDefault();
		// Drag noticeを表示
		$fileDrop.show();
	
	// ドラッグやめた
	}).bind("dragleave", function(event) {
		
		// デフォルトイベントを殺す
		event.stopPropagation();
		event.preventDefault();
		// Drag noticeを非表示
		$fileDrop.hide();
	
	// ドロップされた
	}).bind("drop", function(event) {
		
		// デフォルトイベントを殺す
		event.stopPropagation();
		event.preventDefault();
		
		// Drop noticeを非表示
		$fileDrop.hide();
		
		// Dragイベントオブジェクトからデータを取得
		var transfer = event.dataTransfer;
		// データからファイル（先頭１つだけ）を取得
		var file = transfer.files[0];
		
		// 拡張子チェック
		var index = file.name.lastIndexOf(".");
		var ext = file.name.substring(index + 1);
		// txtのみ許可
		if (ext != "txt") {
			console.error("File is not TXT.");
			// プレゼンをリセット
			slide.control.resetPresentation();
			return;
		}
		
		// ファイルリーダーオブジェクトを作成
		var reader = new FileReader();
		console.info("Dropped file is '" + file.name + "'.");

		// ファイルを読み込んだら実行
		reader.onload = (function(event) {
			console.info("The file is loaded.");
			// ファイル読み込みが完了していたらスライドショー読込
			if (event.target.readyState == FileReader.DONE) {
				console.info("The slideshow is loaded.");
				console.groupCollapsed("The slideshow text");
				console.log(event.target.result);
				console.groupEnd();
				// 読み込んだテキストをパーサーにかけてスライド反映
				var data = event.target.result;
				$("#slide").html( slide.parser.parse(data) );
				// 読み込んだスライドは表示しない（DOMとしてDocumentに保持）
				$("#slide").hide();
				// プレゼンをリセット
				slide.control.resetPresentation();
			}
		});
		
		// ローダー表示
		var $loader = $("<img>").addClass("loader").attr("src", slide.ops.find("loader").attr("src"));
		$("#presentation").append($loader);
		// ファイルをテキストで読み込み
		setTimeout(function() {reader.readAsText(file, "UTF-8");}, 200);
		
	});
	
};

// プレゼンをリセット
slide.control.resetPresentation = function() {
	// 開始ボタン表示
	$("nav.control .overlays .start").fadeIn( 400 );
	// プログレスを更新
	slide.control.updateRabbit(0);
	// プレゼンを停止
	slide.control.resetTurtle();
	slide.stats.isStarted = false;
	// ローダー削除
	$("#presentation img.loader").remove();
};

// うさぎの表示設定
slide.control.showRabbit = function(){
	if (slide.ops.rabbit.visible == "true") {
		$("#rabbit").css({visibility:"visible"});
	} else {
		$("#rabbit").css({visibility:"hidden"});
	}
};
// かめの表示設定
slide.control.showTurtle = function(){
	if (slide.ops.turtle.visible == "true") {
		$("#turtle").css({visibility:"visible"});
	} else {
		$("#turtle").css({visibility:"hidden"});
	}
};

//============================================================================//

//[EOF]