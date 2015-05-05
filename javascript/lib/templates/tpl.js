define([
    'lib!util/global'
], function (_g, $p, $f, $w) {

    // “全局变量”统计
    var _variables = [];

    // 方法匹配
    var _settings = {
        listStart: /{{#list\s*([^}]*?)\s*as\s*(\w*?)\s*(,\s*\w*?)?}}/igm,
        listEnd: /{{\/list}}/igm,
        interpolate: /{{([\s\S]+?)}}/igm,
        comment: /{{!([^}]*?)!}}/igm,
        ifStart: /{{#if\s*([^}]*?)}}/igm,
        ifEnd: /{{\/if}}/igm,
        elseStart: /{{#else}}/igm,
        elseifStart: /{{#elseif\s*([^}]*?)}}/igm
    }

    var $tpl = function (param) {
        return new $tpl.fn.__init(param);
    }

    $tpl.fn = $tpl.prototype = {

        constructor: $tpl,

        __init: function (param) {
            if (param.init) param.init();
            this.tpl = param.template;
            this.data = param.data || {};

            console.log(param.data)
        },

        $inject: function () {

        }
    }

    $tpl.fn.__init.prototype = $tpl.fn;

    $tpl({
        template: '',
        init: function () {
            this.data = '111';
        },
        test: function () {

        }
    })

    var pptpl = function (_tpl, _data) {

        var _tplArr = _tpl.split('\n');
        for (var i = 0, l = _tplArr.length; i < l; i++) {
            _tplArr[i] = _tplArr[i].replace(/(^\s*)|(\s*$)/g, '');
        }
        _tpl = (_tplArr.join('') || _tpl).replace(/&lt;/igm, '<').replace(/&gt;/igm, '>').replace(/&amp;/igm, '&').replace(/"/igm, "'");

        pptpl.options = {
            tpl: _tpl,
            data: _data
        };

        _variables = [];
        return pptpl.template.call(pptpl);
    }

    pptpl.template = function () {

        var _data = pptpl.options.data;

        setTimeout(function () {
            console.log(_data.info.name)
        }, 1000);

        this.parseHTML = function (_data) {
            var tmp = document.createElement("div");
            tmp.innerHTML = _data;
            return tmp.childNodes;
        }

        // 模板变量声明叠加
        var prefix = '';

        // 循环调用统计
        var _counter = 0;

        // 模板编译 主结构
        var _convert = '"use strict"; var _out = "";try { <%innerFunction%>";return _out;} catch(e) {throw new Error("pptpl: "+e.message);}';

        var _tpl = this.options.tpl

            // comment expression
            .replace(_settings.comment, '')

            // list expression
            .replace(_settings.listStart, function ($, _target, _object) {
                var _var = _object || 'value';
                var _key = 'key' + _counter++;
                if (!_target.match(/\./g))_variables.push(_target);
                if (_target.match(/(\w+?)\[/g)) _variables.push(_target.match(/(\w+?)\[/g)[0].replace('[', ''));
                return '";~function() { ' +
                    'var i' + _counter + ' = 0;' +
                    'for(var ' + _key + ' in ' + _target + ') {' +
                    'if(' + _target + '.hasOwnProperty(' + _key + ')) {' +
                    'var _i = i' + _counter + '++;' +
                    'var _v = ' + _target + '[' + _key + ']; ' +
                    'var ' + _var + ' = typeof( _v ) === "object" ? _v : [_v];' + _var + '._index = _i' +
                    '; _out += "'
            })
            .replace(_settings.listEnd, '";}}}(); _out += "')

            // if expression
            .replace(_settings.ifStart, function ($, _condition) {
                return '"; if(' + _condition + ') { _out+="';
            })
            .replace(_settings.ifEnd, '";}_out+="')

            // else expression
            .replace(_settings.elseStart, function ($) {
                return '"; } else { _out+="';
            })

            // else if expression
            .replace(_settings.elseifStart, function ($, condition) {
                return '"; } else if(' + condition + ') { _out+="';
            })

            // interpolate expression
            .replace(_settings.interpolate, function ($, _name) {
                _variables.push(_name.split('.')[0])
                return '"; _out+=' + _name + '; _out += "';
            });

        // tpl parse
        for (var i = 0, l = _variables.length; i < l; i++) {
            var _variable = _variables[i].replace(/\[.+\]/g, '');
            prefix += 'var ' + _variable + ' = _data.' + _variable + (i == l - 1 ? '||"' : '||"";');
        }

        if (_tpl.indexOf('"') > 0) {
            prefix += '"; _out += "'
        }

        var tpl = _convert.replace(/<%innerFunction%>/g, prefix + _tpl);

        var _render = new Function('_data', tpl);

        var _result = _render.call(this, pptpl.options.data);

        return _result
    }

    return pptpl;
});