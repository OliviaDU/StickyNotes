/**
 *@Olivia
 **/

//将通用方法都挂载在app对象上
let app = {
    util: {},
    store: {}
};

//工具模块
app.util = {
    //通用选择器
    $: (selector, node = document) => node.querySelector(selector),
    //格式化时间
    formatTime: (ms) => {
        let d = new Date(ms);

        //只有一位数时，前面加一个0
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
    get(id) {
        let notes = this.getNotes();
        return notes[id] || {};
    },
    set(id, note) {
        let notes = this.getNotes();
        if (notes[id]) {
            Object.assign(notes[id], note); //同名属性后面的会覆盖前面的
        } else {
            notes[id] = note;
        }
        localStorage.setItem(this._store_key, JSON.stringify(notes)); //存储的时候要转换为字符串
        console.log(`saved note id:${id},note:${JSON.stringify(notes[id])}`);
    },
    remove(id) {
        let notes = this.getNotes();
        delete notes[id];

        localStorage.setItem(this._store_key, JSON.stringify(notes)); //存储的时候要转换为字符串
        localStorage[this._store_key] = JSON.stringify(notes); //存储的时候要转换为字符串
    },
    getNotes() {
        return JSON.parse(localStorage.getItem(this._store_key) || '{}'); //获取的是字符串，需要解析为对象
    }
};

//便签工具模块
(function(util, store) {
    let $ = util.$,
        movedNote = null,
        startX,
        startY,
        maxzIndex = 0;

    let noteTpl = `
        <i class="u-close"></i>
        <div class="u-editor" contenteditable="true"></div>
    	<div class="u-timestamp">
        	<span>更新时间：</span>
        	<span class="time"></span>
    	</div>
		`;

    //note构造函数
    function Note(options) {
        // options = {
        //     id: '',
        //     content: '',
        //     left: 0,
        //     top: 0,
        //     zIndex: 0,
        //     updateTime: 0
        // };

        // 放在构造函数中的属性，都是属于每一个实例单独拥有
        let note = document.createElement('div');

        note.id = options.id || `m-note-${Date.now()}`; //数值id取不到，要转换为字符串
        note.className = 'm-note';
        note.innerHTML = noteTpl;
        $('.u-editor', note).innerHTML = options.content || ''; //初始化可以编辑区域内容

        note.style.left = options.left + 'px'; //一定要加单位
        note.style.top = options.top + 'px';
        note.style.zIndex = options.zIndex;

        document.body.appendChild(note);

        this.note = note; //将DOM节点赋给note属性
        this.updateTime(options.updateTime); //更新时间
        this.addEvent(); //绑定事件
    }

    //更新时间方法
    Note.prototype.updateTime = function(ms = Date.now()) {
        let ts = $('.time', this.note);
        ts.innerHTML = util.formatTime(ms);
        this.updateTimeInMS = ms;
    };

    //保存便签
    Note.prototype.save = function() {
        store.set(this.note.id, {
            left: this.note.offsetLeft,
            top: this.note.offsetTop,
            zIndex: parseInt(this.note.style.zIndex),
            content: $('.u-editor', this.note).innerHTML,
            updateTime: this.updateTimeInMS
        });
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
            startX = e.clientX - movedNote.offsetLeft; //鼠标距离note左边的距离
            startY = e.clientY - movedNote.offsetTop; //鼠标距离note顶边的距离
            //将当前移动的便签置为顶层
            if (parseInt(movedNote.style.zIndex, 10) !== maxzIndex - 1) {
                movedNote.style.zIndex = maxzIndex++;
                store.set(this.note.id, {
                    zIndex: maxzIndex - 1
                });
            }
        }.bind(this);
        this.note.addEventListener('mousedown', mousedownHandler);

        //便签的输入事件
        let editor = $('.u-editor', this.note),
            inputTimer;

        let inputHandler = () => {
            let content = editor.innerHTML;
            //延缓函数的执行
            clearTimeout(inputTimer); //清除定时器
            inputTimer = setTimeout(() => {
                let time = Date.now();
                store.set(this.note.id, {
                    content: content,
                    updateTime: time
                });
                this.updateTime(time);
            }, 800);
        };

        editor.addEventListener('input', inputHandler);

        //便签close事件
        let closeBtn = $('.u-close', this.note); //关闭按钮node
        let closeHandler = function(e) {
            store.remove(this.note.id);
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
            let note = new Note({
                left: Math.floor(Math.random() * (window.innerWidth - 220)), //保证在可视范围内
                top: Math.floor(Math.random() * (window.innerHeight - 320)),
                zIndex: maxzIndex++
            });
            note.save();
        });

        //移动note事件
        function mousemoveHandler(e) {
            if (!movedNote) return;
            if (e.target.className === 'u-editor' || e.target.parentElement.className === 'u-editor') {
                movedNote = null;
                return;
            }
            movedNote.style.left = e.clientX - startX + 'px';
            movedNote.style.top = e.clientY - startY + 'px';
        }

        //鼠标放开事件
        function mouseupHandler() {
            if (!movedNote) return;

            store.set(movedNote.id, {
                left: movedNote.offsetLeft,
                top: movedNote.offsetTop
            });

            movedNote = null;
        }
        document.addEventListener('mousemove', mousemoveHandler);
        document.addEventListener('mouseup', mouseupHandler);

        //初始化notes
        let notes = store.getNotes();
        Object.keys(notes).forEach((id) => {
            let options = notes[id];
            if (options.zIndex > maxzIndex) {
                maxzIndex = options.zIndex;
            }
            new Note(Object.assign(options, {
                id: id
            }));
        });
        ++maxzIndex;
    });

})(app.util, app.store);