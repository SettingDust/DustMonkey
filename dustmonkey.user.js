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

/**
 * 对一段文本通过换行符做双空格缩进（很蠢的方法了hh
 * @param code 文本
 * @returns {string} 缩进后文本
 */
function addSpace(code) {
    let s = ""
    if (!zip)
        style.split(warp).forEach((e) => {
            s += "  " + e
        })
    return s
}

function addExternalStyle(link) {
    let elem = $("<style\>")
    elem.attr("href", link)
    elem.attr("rel", "stylesheet")
}

/**
 * 基于数组的简单List类
 */
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

/**
 * style
 */
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

/**
 * 多个style
 */
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

/**
 * 拥有选择器的style对象
 */
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

/**
 * 拥有特定属性的style对象
 */
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

/**
 * media style对象
 */
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

/**
 * 伪元素或者类状态style
 */
class ChildStyle extends KeyStyle {
    toString() {
        this.selector(this.selector() + this.key())
        return super.toString()
    }
}

/**
 * 完整含有style元素对象
 */
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

/**
 * 管理style元素
 */
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

/**
 * 简单的颜色处理
 */
class Color {
    constructor() {
        this._r = 0
        this._g = 0
        this._b = 0
        this._a = 0
    }

    get r() {
        return this._r;
    }

    set r(value) {
        this._r = value;
    }

    get g() {
        return this._g;
    }

    set g(value) {
        this._g = value;
    }

    get b() {
        return this._b;
    }

    set b(value) {
        this._b = value;
    }

    get a() {
        return this._a;
    }

    set a(value) {
        this._a = value;
    }

    /**
     * a为0时返回rbg字符串
     * @returns {string}
     */
    toString() {
        if (this._a > 0)
            return "rgba(" + this._r + "," + this._g + "," + this._b + "," + this._a + ")"
        else
            return "rgb(" + this._r + "," + this._g + "," + this._b + ")"
    }
}