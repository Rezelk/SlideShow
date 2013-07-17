/**
 * File     : console.js
 * Encoding : UTF-8 without BOM
 * Title    : console command script
 * Desc.    : レガシーブラウザでconsoleコマンドによるエラーを
 *          : 回避するためにオブジェクトを生成します。
 *          : 
 * Version  : 0.1.0
 * Author   : Rezelk
 * Changes  : 2013/07/17 - 0.1.0 - Rezelk - Created
 */

// メッセージレベルクラス - Begin
function MessageLevel(level, prefix) {
	// レベル（数値）とメッセージ接頭語（文字列）をプロパティとする
	this.level = level;
	this.prefix = prefix;
}
MessageLevel.prototype = {
	// レベル比較
	compare : function(target) {
		if (this.level === undefined || target.level === undefined) {
			return null;
		}
		// 引数１のレベルの方が大きい、または同じ場合はtrue
		// 引数２のレベルの方が大きい場合はfalse
		if (this.level - target.level >= 0) {
			return true;
		} else {
			return false;
		}
	}
};
// メッセージレベルクラス - End

// メッセージレベル定義 - Begin
// levelは変更不可です。
// prefixはアラートに表示したい接頭語を指定します。
var LVL = {
	verbose : new MessageLevel(0, ""),
	debug   : new MessageLevel(1, "[DEBUG]"),
	trace   : new MessageLevel(2, "[TRACE]"),
	info    : new MessageLevel(3, "[INFO]"),
	warn    : new MessageLevel(4, "[WARN]"),
	error   : new MessageLevel(5, "[ERROR]")
};
// メッセージレベル定義 - End

// [設定項目] ログレベル定義
// アラート表示させるログレベルを定義します。
// 定義したレベル以上のログが表示されるようになります。
// 例）var logLevel = LVL.error;
var logLevel = LVL.error;

// メッセージをアラート表示します。
// アラート表示が適切出ない場合はこのメソッドをカスタマイズします。
// 例）#message要素に表示させる。
//     $("#message").text(message);
var showMessage = function(message, lvl) {
	// ログのレベルがログレベル定義未満の場合は処理終了
	if (!lvl.compare(logLevel)) {
		return;
	}
	
	// 表示処理 - Begin
	var myAlert = function(message) {
		// 表示方法をカスタマイズしたければここを直す - Begin
		alert(message);
		// 表示方法をカスタマイズしたければここを直す - End
	};
	// 表示処理 - End
	
	// メッセージ接頭語をつけてメッセージ表示
	myAlert(lvl.prefix + message);
}

//============================================================================//
// レガシーブラウザ対策
if (typeof console === "undefined") {
	window.console = {};
}
// プロパティ用領域を作成
window.console.properties = {};

// ログ
// console.logはverbose（冗長レベル）と定義
if (typeof window.console.log === "undefined") {
	window.console.log = function(expression, message) {
		showMessage(message, LVL.verbose);
	};
}

// デバッグ
if (typeof window.console.debug === "undefined") {
	window.console.debug = function(message) {
		showMessage(message, LVL.debug);
	};
}

// トレース
if (typeof window.console.trace === "undefined") {
	window.console.trace = function(message) {
		showMessage(message, LVL.trace);
	};
}

// 情報
if (typeof window.console.info === "undefined") {
	window.console.info = function(message) {
		showMessage(message, LVL.info);
	};
}

// 警告
if (typeof window.console.warn === "undefined") {
	window.console.warn = function(message) {
		showMessage(message, LVL.warn);
	};
}

// エラー
if (typeof window.console.error === "undefined") {
	window.console.error = function(message) {
		showMessage(message, LVL.error);
	};
}

// グループ開始（展開）
if (typeof window.console.group === "undefined") {
	window.console.group = function(message) {
		// なにもしない
	};
}

// グループ開始（縮小）
if (typeof window.console.groupCollapsed === "undefined") {
	window.console.groupCollapsed = function() {
		// なにもしない
	};
}

// グループ終了
if (typeof window.console.groupEnd === "undefined") {
	window.console.groupEnd = function() {
		// なにもしない
	};
}

// 時間計測開始（デバッグレベル）
if (typeof window.console.time === "undefined") {
	window.console.time = function() {
		showMessage(message, LVL.debug);
		window.console.properties.beginTime = new Date();
	};
}

// 時間計測終了（デバッグレベル）
if (typeof window.console.timeEnd === "undefined") {
	window.console.timeEnd = function() {
		var endTime = new Date();
		elapsedSecond = (endTime - window.console.properties.beginTime) / 1000;
		showMessage("Time elapsed: " + ellapsedSecond + " sec", LVL.debug);
	};
}

// 現在日時を表示
if (typeof window.console.timeStamp === "undefined") {
	window.console.timeStamp = function() {
		// 日時の表示フォーマットを定義
		var dateFormat = "yyyy/MM/dd(w) hh:mm:ss.fff";
		// 週の表示文字列を定義
		var weekDay = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		// 日時を取得
		var nowDate = new Date();
		var year  = nowDate.getFullYear();
		var month = nowDate.getMonth() + 1;
		var date  = nowDate.getDate();
		var week  = weekDay[nowDate.getDay()];
		var hour  = nowDate.getHours();
		var min   = nowDate.getMinutes();
		var sec   = nowDate.getSeconds();
		var msec  = nowDate.getMilliseconds();
		// ゼロ埋め
		var zeroPadding = function(value, digit) {
			var zero = "";
			for (var i = 0; i < digit; i++) {
				zero += "0";
			}
			var str = zero + value;
			return str.slice(-digit);
		};
		//日時を文字列に変更
		var dataStr = dateFormat
						.replace("yyyy", zeroPadding(year, 4))
						.replace("yy", zeroPadding(year, 2))
						.replace("MM", zeroPadding(month, 2))
						.replace("M", zeroPadding(month, 1))
						.replace("dd", zeroPadding(date, 2))
						.replace("d", zeroPadding(date, 1))
						.replace("w", week)
						.replace("hh", zeroPadding(hour, 2))
						.replace("h", zeroPadding(hour, 1))
						.replace("mm", zeroPadding(min, 2))
						.replace("m", zeroPadding(min, 1))
						.replace("ss", zeroPadding(sec, 2))
						.replace("s", zeroPadding(sec, 1))
						.replace("fff", zeroPadding(msec, 3))
						.replace("ff", zeroPadding(msec, 2))
						.replace("f", zeroPadding(msec, 1));
		// ログ表示
		showMessage("Time stamp: " + dataStr, LVL.debug);
	};
}

// アサート（デバッグレベル）
if (typeof window.console.assert === "undefined") {
	window.console.assert = function() {
		// falseなら表示
		if (expression === false) {
			showMessage(message, LVL.debug);
		}
	};
}

// カウント（デバッグレベル）
if (typeof window.console.count === "undefined") {
	window.console.count = function(label) {
		// ラベル指定がなければdefault指定
		if (label == null) {
			label = "default";
		}
		// 初回であればカウント初期化
		if (window.console.properties.counter[label] === undefined) {
			window.console.properties.counter[label] = 0;
		}
		// カウントアップして表示
		window.console.properties.counter[label]++;
		showMessage(message, LVL.debug);
	};
}

// オブジェクト表示
if (typeof window.console.dir === "undefined") {
	window.console.dir = function(obj) {
		// ひとまずオブジェクトを渡してみる
		showMessage(obj, LVL.debug);
	};
}

// オブジェクトツリー表示
if (typeof window.console.dirxml === "undefined") {
	window.console.dirxml = function(node) {
		// ひとまずノードを渡してみる
		showMessage(node, LVL.debug);
	};
}

// タイムライン
if (typeof window.console.markTimeline === "undefined") {
	window.console.markTimeline = function(mark) {
		// ひとまず文字列を渡してみる
		showMessage(mark, LVL.debug);
	};
}

// プロファイル開始
if (typeof window.console.profile === "undefined") {
	window.console.profile = function(name) {
		// なにもしない
	};
}

// プロファイル終了
if (typeof window.console.profileEnd === "undefined") {
	window.console.profileEnd = function(name) {
		// なにもしない
	};
}
//============================================================================//
//[EOF]