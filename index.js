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
	formatTime: (ms) => {
		let d = new Date(ms);
		let pad = function(s) {
			if (s.toString().length === 1) {
				s = '0' + s;
			}
			return s;
		};
		let year = d.getFullYear(),
			month = d.getMonth() + 1,
			date = d.getDate(),
			hour = d.getHours(),
			minute = d.getMinutes(),
			second = d.getSeconds();

		return `${year}-${pad(month)}-${pad(date)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
	}
};

//存储模块
app.store = {
	_store_key: '_sticky_note',
	get: function(id) {
		let notes = this.getNotes();
		return notes[id] || {};
	},
	set: function(id, value) {
		let notes = this.getNotes();
		if (notes[id]) {
			Obeject.assign(notes[id], value);
		} else {
			notes[id] = value;
		}
		localStorage[this._store_key] = JSON.stringify(notes); //存储的时候要转换为字符串
	},
	getNotes: function() {
		return localStorage[this._store_key] || {};
	}
};

//便签工具模块
(function(util, store) {
	let $ = util.$,
		movedNote = null,
		startX,
		startY,
		MaxzIndex = 0;

	let noteTpl = `
    	<i class="u-close"></i>
    	<div class="u-editor" contenteditable="true"></div>
    	<div class="u-timestamp">
        	<span>更新：</span>
        	<span class="time"></span>
    	</div>
		`;

	function Note(options) {
		let note = document.createElement('div');
		note.className = 'm-note';
		note.innerHTML = noteTpl;
		note.style.left = options.left + 'px';
		note.style.top = options.top + 'px';
		note.style.zIndex = options.zIndex;

		document.body.appendChild(note);
		this.note = note;
		this.updateTime();
		this.addEvent();
	}

	//更新时间方法
	Note.prototype.updateTime = function(ms) {
		ms = ms || Date.now();
		let ts = $('.time', this.note);
		ts.innerHTML = util.formatTime(ms);
	};

	//删除便签方法
	Note.prototype.close = function() {
		document.body.removeChild(this.note);
	};

	//创建Note时添加事件方法
	Note.prototype.addEvent = function() {
		//便签 mousedown 事件
		let mousedownHandler = function(e) {
			movedNote = this.note;
			startX = e.clientX - movedNote.offsetLeft;
			startY = e.clientY - movedNote.offsetTop;
			//将当前移动的便签置为顶层
			if (parseInt(movedNote.style.zIndex, 10) !== MaxzIndex - 1) {
				movedNote.style.zIndex = MaxzIndex++;
			}
		}.bind(this);
		this.note.addEventListener('mousedown', mousedownHandler);

		//便签的输入事件
		let editor = $('.u-editor', this.note);

		function inputHandler() {
			let val = editor.innerHTML;
		}

		editor.addEventListener('input', inputHandler);

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
			new Note({
				left: Math.floor(Math.random() * (window.innerWidth - 220)), //保证在可视范围内
				top: Math.floor(Math.random() * (window.innerHeight - 320)),
				zIndex: MaxzIndex++
			});
		});

		//移动note事件
		function mousemoveHandler(e) {
			if (!movedNote) return;
			movedNote.style.left = e.clientX - startX + 'px';
			movedNote.style.top = e.clientY - startY + 'px';
		}

		//鼠标放开事件
		function mouseupHandler() {
			movedNote = null;
		}
		document.addEventListener('mousemove', mousemoveHandler);
		document.addEventListener('mouseup', mouseupHandler);

	});

})(app.util, app.store);