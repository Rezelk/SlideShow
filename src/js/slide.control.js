/**
 * File     : slide.control.js
 * Encoding : UTF-8 without BOM
 * Title    : Slide Show Parser Script
 * Desc.    : スライドショーのコントロールスクリプトです。
 *          : スライドショーの操作を実装します。
 *          :
 * Version  : 0.1.0
 * Author   : Rezelk
 * Changes  : 2013/06/27 0.1.0 Rezelk Created
 *          : 2013/07/02 0.2.0 Add Drag & Drop feature
 */

// スクリプト固有の名前空間を作成
slide.control = {};

//============================================================================//
// スクリプト情報＆動作設定 - begin
slide.control.script = {
	// スクリプト情報
	thisFile     : "slide.control.js",
	name         : "Slide Show Parser",
	version      : "0.1.0",
	lastModified : "2013/06/27"
	
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
	// スライドショーを初めて開始したときはかめ発動
	if (slide.stats.isStarted === false) {
		// 時間を入力し、
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
		$("#turtle").css({
			"transition-duration":slide.control.totalSec + "s",
			"-moz-transition-duration":slide.control.totalSec + "s",
			"-webkit-transition-duration":slide.control.totalSec + "s",
			"-o-transition-duration":slide.control.totalSec + "s"
		});
		$("#turtle").width("100%");
		
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

// スライドファイルを宰予込み込み
slide.control.reloadSlideshow = function() {
	console.info("Reloading slides.");
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	slide.stats.isStarted = false;
	// かめのリセット
	slide.control.resetTurtle();
	// 設定を読み込めていなければ処理終了
	if (slide.ops === undefined) return;
	// スライドファイルのパスを取得
	var slideSrc = slide.ops.find("slideshow").attr("src");
	// プレゼン領域の子要素を削除
	slide.core.$presen.contents().remove();
	// スライドファイルを読み込み
	slide.core.loadSlide(slideSrc);
	// プレゼンを開始
	slide.control.startPresentation();
};

// 時間(秒)をm:ss形式に変換
slide.control.getTimeAsMMSS = function(time) {
	var mm = Math.floor(time / 60);
	var ss = time - mm * 60;
	return mm + ":" + ((ss < 10) ? "0" + ss : ss);
};

// カメの時間経過
slide.control.turtleTimer = false;
slide.control.showTurtleProgress = function() {
	var turtleWidth = $("#turtle").width();
	var totalWidth = $("#container").width();
	var elapsedTime = Math.floor(slide.control.totalSec * turtleWidth / totalWidth);
	var leaveTime = slide.control.totalSec - elapsedTime;
	$(".turtleProgress").text( slide.control.getTimeAsMMSS(slide.control.totalSec) + " @ " + slide.control.getTimeAsMMSS(leaveTime) + " (" + slide.control.getTimeAsMMSS(elapsedTime) + ")" );
	
	if (slide.stats.isStarted == false) {
		clearTimeout(slide.control.turtleTimer);
		$(".turtleProgress").text("");
	}
	
	slide.control.turtleTimer = setTimeout(slide.control.showTurtleProgress, 100);
};

// かめをリセット
slide.control.resetTurtle = function() {
	// かめのリセット
	$("#turtle").css({
		"transition-duration":"0s",
		"-moz-transition-duration":"0s",
		"-webkit-transition-duration":"0s",
		"-o-transition-duration":"0s"
	});
	$("#turtle").width(0);
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
		// Drop noticeを表示
		$fileDrop.show();
		$("#presentation").contents().remove();
		$("nav.control .overlays .prev").css({opacity:0.0});
		$("nav.control .overlays .next").css({opacity:0.0});
	
	// ドラッグ中
	}).bind("dragover", function(event) {
		
		$fileDrop.show();
		event.stopPropagation();
		event.preventDefault();
	
	// ドラッグやめた
	}).bind("dragleave", function(event) {
		$fileDrop.hide();
		event.stopPropagation();
		event.preventDefault();
	
	// ドロップされた
	}).bind("drop", function(event) {
		event.stopPropagation();
		event.preventDefault();
		
		// Drop noticeを非表示
		$fileDrop.hide();
		
		var transfer = event.dataTransfer;
		var file = transfer.files[0];
		
		// 拡張子チェック
		var index = file.name.lastIndexOf(".");
		var ext = file.name.substring(index + 1);
		if (ext != "txt") {
			console.error("File is not TXT.");
			// プレゼンをリセット
			slide.control.resetPresentation();
			return;
		}
		
		var reader = new FileReader();
		console.info("Dropped file is '" + file.name + "'.");

		// ファイルを読み込んだ
		reader.onload = (function(event) {
			console.info("The file is loaded.");
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
//============================================================================//

//[EOF]