/**
 *@Olivia
 **/


//名字空间模块
let app = {
	util: {},
	store: {}
};

//工具方法模块
app.util = {
	$: (selector, node) => (node || document).querySelector(selector), //通用选择器
};


(function(util) {
	let $ = util.$;

	let noteTpl = `
    	<i class="u-close"></i>
    	<div class="u-editor" contenteditable="true"></div>
    	<div class="u-timestamp">
        	<span>更新：</span>
        	<span class="time">时间</span>
    	</div>
		`;

	function Note(options) {
		let note = document.createElement('div');
		note.className = 'm-note';
		note.innerHTML = noteTpl;
		document.body.appendChild(note);
		this.note = note;
		this.addEvent();
	}

	Note.prototype.close = (e) => {
		console.log('click');
	};

	Note.prototype.addEvent = () => {
		$('.u-close', this.note).addEventListener('click', this.close);
	}

	document.addEventListener('DOMContentLoaded', (e) => {
		$('#create').addEventListener('click', (e) => {
			new Note();
		})
	});

})(app.util);