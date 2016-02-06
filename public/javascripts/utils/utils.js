/**
 * Created by kiwi on 14-8-26.
 */

Util = function(){};

$.messager.model = {
    ok:{ text: "确定", classed: 'btn-white btn-lg' },
    cancel: { text: "取消", classed: 'btn-white btn-lg' }
};

    //if (typeof Array.indexOf !== 'function') {
        Array.prototype.indexOf = function (args) {
            var index = -1;
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] === args) {
                    index = i;
                    break;
                }
            }
            return index;
        }
    //}
