// Fun.js 0.0.0
// (c) 2011 Stephen Balaban
// Underscore is freely distributable under the MIT license.
// Portions of Fun.js are inspired or borrowed from Underscore.js
//
// Requires:
// Underscore.js

(function() {
    // root object -- {client: 'window', server: 'global'}
    var root = this;

    // save previous fun
    var previousFun = root.fun;

    // safe reference
    var fun = function(fun) { return new wrapper(fun); };

    // Export the fun!
    root.fun = fun;

    // boolean or
    // predicate function a, predicate function b  -> predicate function a || b
    fun.or = function(a,b) {
        return function () {
            return a.apply(null, arguments) || b.apply(null, arguments);
        }
    }

    // negation
    // predicate function -> !predicate function
    fun.neg = function (f) {
        return function() {
            return !f.apply(null, arguments);
        }
    }

    // join
    // works with strings, arrays and objects
    // [a, b, c, d] -> 'a b c d' lol .join (generic)
    fun.join  = function(obj, glue) {
        if(typeof obj === 'string') return obj;
        if(typeof obj === 'number') return obj;
        var iter = obj,
            result = '',
            glue = glue || ' ';
        if(typeof Object.prototype.toString.apply(obj) !== '[object Array]') {
            iter = _.map(obj, function(val) {
                return val;
            });
        };
        _.each(iter, function(value, index, list) {
            if(index) {
                result += glue;
            }
            result += String(iter[index]);
        });
        return result;
    };
})();
