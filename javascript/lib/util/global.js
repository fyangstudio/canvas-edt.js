define(function ($p, $f, $w) {

    /**
     *字符串前后空白去除
     * @return {String}         - 去除空白后的字符串
     *
     */
    String.prototype._$trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }

    /**
     *当前函数this拓展
     * @param  {Object}    arg0 - 函数内this
     * @return {Function}       - 绑定后的函数
     *
     */
    Function.prototype._$bind = function () {
        var
            _r = [], // 参数集
            _args = arguments, // 获取参数
            _object = arguments[0], // 获取目标
            _function = this; // this赋值

        // 参数绑定
        return function () {
            var _argc = _r.slice.call(_args, 1);
            _r.push.apply(_argc, arguments);
            return _function.apply(_object || null, _argc);
        };
    }

    /**
     *数组遍历 return false中断
     * @param  {Function}  arg0 - 回调函数
     * @param  {Object}    arg1 - 回调函数内this 可空
     *
     * ```javascript
     * [1,2,3,4,5]._$(function (value, index, array) {
     *     //something
     *     if(index == 3) return false;
     * })
     * ```
     *
     */
    Array.prototype._$forEach = function (_callback, _thisArg) {
        if (this == null || {}.toString.call(_callback) != "[object Function]") {
            return false;
        }
        for (var i = 0, __len = this.length; i < __len; i++) {
            if (_callback.call(_thisArg, this[i], i, this) === false) break;
        }
    };

    /**
     *修复低版本(IE 6,7) Object.keys 不能遍历问题
     * @param  {Object}    arg0 - 取键值的目标对象
     *
     * ```javascript
     * console.log(Object.keys({a:1,b:2,c:3}));
     * // [a,b,c]
     * ```
     *
     */
    var DONT_ENUM = "propertyIsEnumerable,isPrototypeOf,hasOwnProperty,toLocaleString,toString,valueOf,constructor".split(","),
        hasOwn = ({}).hasOwnProperty;
    for (var i in {
        toString: 1
    }) {
        DONT_ENUM = false;
    }
    Object.keys = Object.keys || function (obj) {
        var result = [];
        for (var key in obj) if (hasOwn.call(obj, key)) {
            result.push(key)
        }
        if (DONT_ENUM && obj) {
            for (var i = 0; key = DONT_ENUM[i++];) {
                if (hasOwn.call(obj, key)) {
                    result.push(key);
                }
            }
        }
        return result;
    };
    /**
     *修复低版本(IE 6,7) console报错问题
     *
     */
    if (!this.console) {
        this.console = {
            log: $f,
            warn: $f,
            error: $f
        };
    }

})