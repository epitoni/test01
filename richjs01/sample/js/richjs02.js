/**
 * JavaScript part for richjs02.html
	*
	* @version 2023-06-01 separated from html (modified from richjs1b.js ver.2021-06-09)
	* @author nakano@cc.kumamoto-u.ac.jp
 */

// Initial values n: number of data, f: magnitude of random number, plot: graph
// 初期値 n:データ数、f:乱数の振れ幅, plot:グラフ
let n = 20, f = 2, plot = null;
let grid; // for table / テーブル用
/**
 * Process to be done after loading this page including JavaScript libraries
 * JavaScriptライブラリも含めてページがすべてにロードされてから実行する
 */
window.addEventListener("load", function(){

	// set n and f to slidor / スライダに初期値セット
	document.getElementById("slN").value = n;
	document.getElementById("slF").value = f;
	
	// define process triggered by the slider of data number / スライダでデータ数を変更した場合の処理
	document.getElementById("slN").addEventListener('change', function(){
		n = this.value;
		updateData();
	});

	// define process triggered by the slider of magunitude of random number /  スライダで乱数の大きさを変更した場合の処理
	document.getElementById("slF").addEventListener('change', function(){
		f = this.value;
		updateData();
	});

	// table definition / テーブルの定義
	grid = new gridjs.Grid({ 
	  columns: [{id:"i", name:gridjs.html("\\(i\\)")}, {id:"x", name:gridjs.html("\\(x_i\\)")},
	  						{id:"y", name:gridjs.html("\\(y_i\\)")}, {id:"c", name:gridjs.html("\\(ax_i + b\\)")}],
	  data: [[0,0,0,0]], // dummy
	  search: true,
	  sort: true,
	  pagination: {limit: 5},
	  resizable: true
	}).render(document.getElementById("tbl"));

	// plotting graph with initial values / 初期パラメータで計算してデータプロット
	updateData();

});

/**
 * Calculating, plotting, and tabulating / 計算、プロット、表作成
 */
function updateData() {
	// (re)calculing x, y data / x, y データの(再)計算
	let cal = [], fit = []; // cal:calculated data/計算したデータ, f;fit data/フィッティングしたデータ
	// cal and fit data format / calとfitのデータ形式 : [[x0,y0],[x1,y1],...,[xn,yn]]
	let tData = [], pData_cal = [], pData_fit = []; // tData: dor table, pData_*: for plot 
	for (let i = 0; i <= n; i++) {
		cal.push([i, i + f * (2 * Math.random() - 1)]); // push [xi, yi] into cal array / cal配列に[xi, yi]をプッシュする。
	}
	// least squares (re)fitting / 最小二乗法によるフィッティング
	let sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0;
	for (let i = 0; i <= n; i++) {
		sum_x += cal[i][0]; // Σx_i
		sum_y += cal[i][1]; // Σy_i
		sum_xy += cal[i][0] * cal[i][1]; // Σ(x_i*y_i)
		sum_x2 += cal[i][0] * cal[i][0]; // Σx_i^2
	}
	let a = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
	let b = (sum_x2 * sum_y - sum_xy * sum_x) / (n * sum_x2 - sum_x * sum_x);
	for (let i = 0; i <= n; i++) {
		fit.push([cal[i][0], a * cal[i][0] + b]); // push calculated data to 'fit' array / fit配列にフィッティング結果をプッシュ
		tData.push([i + 1, cal[i][0], cal[i][1].toFixed(3), (a * cal[i][0] + b).toFixed(3)]);
		 // for table : Round the decimal point of a number to three digits
		 // 表用に、小数点以下を3桁に丸める
		pData_cal.push({ 'x': cal[i][0], 'y': cal[i][1] });
		pData_fit.push({ 'x': fit[i][0], 'y': fit[i][1] });
	}
	
	// plotting by Chart.js library / Chart.jsでデータプロット
	if(plot == null) {
		plot = new Chart(document.getElementById('plotHere').getContext('2d'), {
			type: 'scatter',
			data: {
				datasets: [{
					label: "y = x + R (-" + f + " ≦ R (random number) ≦ " + f + ")",
					data: pData_cal,
					radius: 2,
					borderColor: 'rgba(255, 0, 0, 1)',
					backgroundColor: 'rgba(255, 255, 255, 0)'
				},
				{
					label: 'fitted line',
					data: pData_fit,
					showLine: true,
					borderWidth: 1,
					fill: false,
					radius: 0,
					borderColor: 'rgba(0, 0, 255, 1)',
				}]
			},
			options: { responsive: true }
		});
	} else {
		plot.data.datasets[0].label = "y = x + R (-" + f + " ≦ R (random number) ≦ " + f + ")",
	  plot.data.datasets[0].data = pData_cal;
	  plot.data.datasets[1].data = pData_fit;
	  plot.update();
	}
	
	// Display a and b values with three decimal places below the graph. / グラフの下にaとbの値を小数点以下3桁で表示
	document.getElementById('a').textContent = a.toFixed(3);
	document.getElementById('b').textContent = b.toFixed(3);

	// update table / テーブルの更新
  grid.updateConfig({
  	data: tData
  }).forceRender();

	// redrow MathJax / MathJax再描画 
	MathJax.typeset();
	setTimeout(MathJax.typeset, 1000); // a bit bogus / ちょっとインチキ (2923-06-01)
}