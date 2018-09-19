// ==UserScript==
// @name        DustMonkey
// @version     1.0
// @description Base lib of mine
// @author      SettingDust
//
// @require     https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
//
// @grant       GM.setValue
// @grant       GM.getValue
// ==/UserScript==

let warp = "\n"
let zip = false
if (zip)
    warp = ""

let body = $("body")

function addSpace(style) {
    let s = ""
    if (!zip)
        style.split(warp).forEach((e) => {
            s += "  " + e
        })
    return s
}

class List extends Array {
    constructor() {
        super()
    }

    //向集合追加新元素
    add(item) {
        this.push(item)
        return self
    }

    //在指定索引处插入新元素
    insert(index, item) {
        this.splice(index, 0, item)
        return self
    }

    //删除元素，仅删除第一个索引处的元素
    remove(item) {
        let index = this.indexOf(item)
        if (index !== -1) {
            return this.splice(index, 1)[0]
        } else {
            return undefined
        }
    }

    //删除元素，如果元素在多个索引处存在，则全部删除
    removeAll(item) {
        let result = []
        let removeItem = undefined
        do {
            removeItem = remove(item)
            if (removeItem !== undefined) {
                result.push(removeItem)
            }
        } while (removeItem !== undefined)
        return result
    }

    //根据index删除元素
    removeAt(index) {
        if (index !== -1) {
            return this.splice(index, 1)[0]
        } else {
            return undefined
        }
    }

    //判断元素是否包含在集合中
    contains(item) {
        return this.indexOf(item) !== -1
    }

    //清空集合的所有元素
    clear() {
        return new List(this.splice(0, length))
    }
}

class StyleLine {
    constructor() {
        this._key = ""
        this._value = ""
        this._important = false
    }

    get key() {
        return this._key;
    }

    set key(value) {
        this._key = value;
    }

    get value() {
        return this._value;
    }

    set value(value) {
        this._value = value;
    }

    get important() {
        return this._important;
    }

    set important(value) {
        this._important = value;
    }

    toString() {
        return this._key + ": " + this._value + (this._important ? " !important" : "") + ";"
    }
}

class StyleLines {
    constructor() {
        this._styleList = new List()
    }

    addStyle(key, value, important) {
        for (let i = 0; i < this._styleList.length; i++) {
            if (this._styleList[i].key() === key) {
                this._styleList.removeAt(i)
            }
        }
        this._styleList.add(new StyleLine()
            .important(important)
            .key(key)
            .value(value))
        return this;
    }

    removeStyle(key) {
        for (let i = 0; i < this._styleList.length; i++) {
            if (this._styleList[i].key() === key) {
                this._styleList.removeAt(i)
            }
        }
        return this;
    }

    toString() {
        let style = ""
        this._styleList.forEach((e) => {
            style += e.toString() + "" + warp
        })
        return style
    }
}

class StyleBlock {
    constructor() {
        this._styleLines = new StyleLines()
        this._selector = "";
    }

    get styleLines() {
        return this._styleLines;
    }

    get selector() {
        return this._selector;
    }

    set selector(value) {
        this._selector = value;
    }

    toString() {
        let style = this._selector + " {" + warp
        style += addSpace(this._styleLines.toString()) + warp
        style += "}"
        return style
    }
}

class KeyStyle extends StyleBlock {
    constructor() {
        super();
        this._key = ""
    }

    set key(value) {
        this._key = value;
    }

    get key() {
        return this._key;
    }
}

class MediaStyle extends KeyStyle {
    constructor() {
        super();
        this._max = true
        this._height = false
    }

    set max(value) {
        this._max = value;
    }

    set height(value) {
        this._height = value;
    }

    toString() {
        let style = "@media ("
            + (this._max ? "max" : "min") + "-"
            + (this._height ? "height" : "width")
            + ": " + this.key() + "px {" + warp
        style += addSpace(super.toString()) + warp
        style += "}"
        return style
    }
}

class ChildStyle extends KeyStyle {
    toString() {
        this.selector(this.selector() + this.key())
        return super.toString()
    }
}

class Style {
    constructor() {
        this._name = null
        this._styleList = new List()
    }

    set name(value) {
        this._name = value;
    }

    addStyleBlock(styleBlock) {
        this._styleList.add(styleBlock)
        return this
    }

    toString() {
        let style = ""
        this._styleList.forEach((e) => {
            style += e.toString() + warp
        })
        return style
    }
}

class StyleManager {
    constructor() {
        this._styleList = new List()
    }

    register(style) {
        this._styleList.add(style)
        return this
    }

    apply() {
        this._styleList.forEach((e) => {
            let style = body.find("style[data-name='" + name + "']:first");
            if (style.length === 0) {
                style = $("<style\>");
            }
            style.text(style.text() + e.toString());
            style.attr("data-name", name);
            body.append(style);
        })
    }
}