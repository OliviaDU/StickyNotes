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
	let $ = util.$,
		movedNote = null,
		startX,
		startY;

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

	Note.prototype.close = function() {
		document.body.removeChild(this.note);
	};

	//创建Note时添加的事件
	Note.prototype.addEvent = function() {
		//便签 mousedown 事件
		let mousedownHandler = function(e) {
			movedNote = this.note;
			startX = e.clientX - this.note.offsetLeft;
			startY = e.clientY - this.note.offsetTop;
		}.bind(this);
		this.note.addEventListener('mousedown', mousedownHandler);

		//便签close事件
		let closeBtn = $('.u-close', this.note); //关闭按钮node
		let closeHandler = function(e) {
			this.close(e); //移除note节点
			closeBtn.removeEventListener('click', closeHandler); //移除节点的同时移除绑定的事件
			this.note.removeEventListener('mousedown', mousedownHandler);
		}.bind(this);

		closeBtn.addEventListener('click', closeHandler); //为关闭按钮绑定关闭note事件

	}

	//DOM树生成后添加的事件
	document.addEventListener('DOMContentLoaded', (e) => {
		//创建note事件
		$('#create').addEventListener('click', (e) => {
			new Note();
		});

		//移动note事件
		function mousemoveHandler(e) {
			if (!movedNote) return;
			movedNote.style.left = e.clientX - startX + 'px';
			movedNote.style.top = e.clientY - startY + 'px';
		}

		function mouseupHandler() {
			movedNote = null;
		}
		document.addEventListener('mousemove', mousemoveHandler);
		document.addEventListener('mouseup', mouseupHandler);

	});

})(app.util);