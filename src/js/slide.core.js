/**
 * File     : slide.core.core.js
 * Encoding : UTF-8 without BOM
 * Title    : slide.core.Show Core Script
 * Desc.    : スライドショーのコアスクリプトです。
 *          : 設定ファイルおよびスライドファイルの読み込みと
 *          : 処理のディスパッチを行います。
 *          : 
 * Version  : 0.1.6
 * Author   : Rezelk
 * Changes  : 2013/06/25 - 0.1.0 - Rezelk - Created
 *          : 2013/06/26 - 0.1.1 - Rezelk - Add presentation control buttons
 *          : 2013/06/27 - 0.1.2 - Rezelk - Parge control processes
 *          : 2013/07/17 - 0.1.3 - Rezelk - Compatible with IE9
 *          : 2013/07/19 - 0.1.4 - Rezelk - Compatible with IE9 (Re-fix)
 *          : 2013/07/19 - 0.1.5 - Rezelk - Show version info on footer
 *          : 2013/08/09 - 0.1.6 - Rezelk - Fix scroll bar issue
 *          : 2013/08/09 - 0.2.0 - Rezelk - Add the feature of design selection
 *          : 2013/08/09 - 0.2.0 - Rezelk - Add the feature of rabbit/turtle visiblilty option
 *          : 2013/08/09 - 0.2.0 - Rezelk - Add the feature of multi-slide
 *          : 2013/08/09 - 0.2.0 - Rezelk - Add the feature of class grammar
 *          : 2013/08/09 - 0.2.0 - Rezelk - Fix blank quote issue
 */

// スクリプト間の共通名前空間を作成（コアのみ）
var slide = {};

// スクリプト固有の名前空間を作成
slide.core = {};

//============================================================================//
// スクリプト情報＆動作設定 - begin
slide.core.script = {
	// スクリプト情報
	thisFile     : "slide.core.core.js",
	name         : "Slide Show Core",
	lastModified : "2013/08/09",
	version      : "0.2.0.20130809",
	
	// スクリプト動作設定
	// 設定ファイルのパスをbase.htmlからの相対パス、または絶対パスで指定します
	// デフォルト：./ops.xml
	opsFile      : "./ops.xml"
};
// スクリプト情報＆動作設定 - end
//============================================================================//

console.info("'" + slide.core.script.thisFile + "' is loaded.");

// IDを簡単に指定できるように設定
$.fn.id = function(id) {
	// id属性にパラメーターを設定
	$(this).attr("id", id);
	return $(this);
};

////////////////////////////////////////////////////////////////////////////////
//
// [DOMのセレクト条件]
//
// 各ボタン、表示機能は以下の条件さえ満たせばHTML要素を自由に変更できます。
// 
// ◆プレゼン/スライド
//   プレゼン表示領域：     #presentation
//   スライド読込領域：     #slide
//   スライドページ：       .page
//
// ◆コントロール（開始、前へ、次へ等）
//   再読込（ボタン）：     nav.control .buttons .reload
//   ページ番号（入力）：   nav.control .buttons .pageNo
//   開始（ボタン）：       nav.control .buttons .start
//   前へ（ボタン）：       nav.control .button .prev
//   次へ（ボタン）：       nav.control .button .next
//   前へ（オーバーレイ）： nav.control .overlays .prev
//   次へ（オーバーレイ）： nav.control .overlays .prev
//   プログレス：           .progress
//
////////////////////////////////////////////////////////////////////////////////

//============================================================================//
// ページを読み込んだら処理開始 - begin
$(function() {
	
	console.info("ready");
	
	// 領域を初期化する - begin ------------------------------------------------
	// コントロールを非表示にする
	$("nav.control").hide();
	// 各要素（オーバーレイ、プレゼン領域、スライドページ）をリサイズする
	slide.control.fixElementSize();
	// 領域を初期化する - end --------------------------------------------------
	
	// 設定ファイルを取得する - begin ------------------------------------------
	// 設定を読み込めていなければ処理終了
	slide.core.loadOps();
	if (slide.ops === undefined) return;
	// 設定ファイルを取得する - end --------------------------------------------
	
	// デザイン読込
	slide.core.loadDesgin();
	
	// スライド内容を取得する - begin ------------------------------------------
	// スライドファイルを読み込み
	$("#slide").contents().remove();
	for (var index = 0; index < slide.ops.slideshows.length; index++) {
		slide.core.loadSlide(index);
	}
	// スライド内容を取得する - end --------------------------------------------
	
	// プレゼン機能を実装する - begin ------------------------------------------
	// プレゼン領域を取得
	slide.core.$presen = $(slide.ops.presenId);
	// スライドページ
	slide.core.$pages = null;
	// 現在の状態を初期化
	slide.stats = {
		// 現在のページ番号
		currentPageNo: 0,
		// スライド開始状態（trueで開始）
		isStarted: false
	};
	// コントロール機能の実装
	slide.control.apply();
	// うさぎとかめの表示設定
	slide.control.showRabbit();
	slide.control.showTurtle();
	// 著作表示
	var $copyright = $("<div>").id("copyright").text( "[" + slide.core.script.version + "] Created by Rezelk." );
	$("nav.control .buttons").append( $copyright );
	// プレゼン機能を実装する - end --------------------------------------------
	
});
// ページを読み込んだら処理開始 - end

//============================================================================//
// 設定ファイルを読み込む
slide.core.loadOps = function() {
	// Ajaxを使ってops.xml（オプション指定）を読み込む
	$.ajax({
		// 通信先は設定ファイル（デフォルト：./ops.xml）
		url: slide.core.script.opsFile,
		// メソッドはGET
		type: "GET",
		// データタイプはXML
		dataType: "html",
		// キャッシュは無効
		cache: false,
		// 同期
		async: false,
		// タイムアウト（ms）
		timeout: 10000,
		// 送信前
		beforeSend: function(xhr) {
			// 前処理
			console.info("Begining to get configure from '" + slide.core.script.opsFile + "'.");
		},
		// 成功時
		success: function(data, textStat, xhr) {
			// 読み込んだデータを突っ込む
			console.info("Configure is loaded.");
			slide.ops = $(data);
			// 設定ファイルの中身を取得
			// スライド
			slide.ops.slideshows = slide.ops.find("slides slideshow");
			slide.ops.slideshows.each(function(index) {
				slide.ops.slideshows[index].src = $(this).attr("src");
			});
			// プレゼン領域ID
			slide.ops.presenId = slide.ops.find("presenId").attr("id");
			// うさぎ
			slide.ops.rabbit = slide.ops.find("rabbit");
			slide.ops.rabbit.visible = slide.ops.rabbit.find("visible").attr("value");
			// かめ
			slide.ops.turtle = slide.ops.find("turtle");
			slide.ops.turtle.visible = slide.ops.turtle.find("visible").attr("value");
			// デザイン
			slide.ops.design = slide.ops.find("design");
			slide.ops.design.baseDir = slide.ops.design.attr("baseDir");
			slide.ops.design.css = slide.ops.design.find("css");
			slide.ops.design.css.each(function(index) {
				slide.ops.design.css[index].src = $(this).attr("src");
			});
		},
		// 失敗時
		error: function(xhr, textStat, e) {
			// エラー処理
			console.error("Loading configure is FAILED...");
		},
		// 完了後
		complete: function() {
		}
	});
};

// スライドファイルの読み込み
slide.core.loadSlide = function(index) {
	// Ajaxを使ってスライドファイルを読み込む
	$.ajax({
		// 通信先はスライドファイル
		url: slide.ops.slideshows[index].src,
		// メソッドはGET
		type: "GET",
		// データタイプはXML
		dataType: "html",
		// キャッシュは無効
		cache: false,
		// 同期処理
		async: false,
		// タイムアウト（ms）
		timeout: 10000,
		// 送信前
		beforeSend: function(xhr) {
			// 前処理
			console.info("Begining to get slideshow from '" + slide.ops.slideshows[index].src + "'.");
			// ローダー表示
			var $loader = $("<img>").addClass("loader").attr("src", slide.ops.find("loader").attr("src"));
			$("#presentation").append($loader);
		},
		// 成功時
		success: function(data, textStat, xhr) {
			// 読み込んだデータをパーサーにかけてコンテンツとして埋め込む
			console.info("The slideshow is loaded.");
			$("#slide").append( $(slide.parser.parse(data)) );
			// 読み込んだスライドは表示しない（DOMとしてDocumentに保持）
			$("#slide").hide();
			// プログレスを更新
			var maxPageNo = $("#slide .page").length;
			$(".progress").text(0 + " / " + maxPageNo);
		},
		// 失敗時
		error: function(xhr, textStat, e) {
			// エラー処理
			console.error("Loading slide is FAILED...");
		},
		// 完了後
		complete: function() {
			// 後処理
			// ローダー削除
			$("#presentation img.loader").remove();
		}
	});
};

// デザインの読込
slide.core.loadDesgin = function() {
	var $head = $("head");
	var $links = $("link");
	var baseUri = slide.ops.design.baseDir;
	
	$links.each(function() {
		var href = $(this).attr("href");
		if (href != null && (href.indexOf("presentation.css") !== -1 || href.indexOf("rabbit.css") !== -1)) {
			$(this).remove();
		}
	});
	var dateTime = slide.core.getDateTime();
	for (var index = 0; index < slide.ops.design.css.length; index++) {
		var $newLink = $("<link>");
		$newLink.attr("href", baseUri + "/" + slide.ops.design.css[index].src + "?version=" + dateTime);
		$newLink.attr("rel", "stylesheet");
		$head.append($newLink);
	}
	console.info("Design is loaded.");
}

// 現在日時を取得
slide.core.getDateTime = function() {
	var nowDate = new Date();
	var dateTime = "";
	dateTime += ("0000" + nowDate.getFullYear()).slice(-4);
	dateTime += ("0000" + nowDate.getMonth()).slice(-2);
	dateTime += ("0000" + nowDate.getDate()).slice(-2);
	dateTime += ("0000" + nowDate.getHours()).slice(-2);
	dateTime += ("0000" + nowDate.getMinutes()).slice(-2);
	dateTime += ("0000" + nowDate.getSeconds()).slice(-2);
	return dateTime;
}

// jQueryのイベントにdataTransferを登録
jQuery.event.props.push('dataTransfer');

//[EOF]