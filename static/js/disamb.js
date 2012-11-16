// Disamb - the javascript disambiguator
// Inspired by Chinese Pinyin Input devices

// Requires:
//      Underscore.js
//      Fun.js

// The Good Parts
Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this; 
};

// pythonic trim
String.method('trim', function() {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
});

// who -> prompt current known entities
//
// NLP module
var nlp = { 
    // needs to come from a bigger list or be dynamically created with a POS
    // tagger
    STOPWORDS: ['in', 'there', 'has', 'been','this', 'that', 'the', 'and',
                'is', 'a', 'did', 'not', 'of', 'have', 'to', 'from'],
    USEDWORDS: [],
    add_usedword : function (word, array) {
        array.push(word);
        return array;
    },
    nullify_corpus: function (corpus) {
        if (typeof corpus !== 'undefined') {
            var words = corpus.split(' ');
            words = words.slice(0,words.length - 1); // remove empty string at end
            nlp.USEDWORDS = nlp.USEDWORDS.concat(words);
        }
        return nlp.USEDWORDS;
    },
    reset_used: function () {
        nlp.USEDWORDS = [];
        return nlp.USEDWORDS;
    },
    is_usedword: function (word) {
        return _.indexOf(nlp.USEDWORDS, word) !== -1;
    },
    is_stopword: function (word) {
        return _.indexOf(nlp.STOPWORDS, word) !== -1;
    },
    clean_stopwords: function (phrase) {
        return _.filter(phrase.split(' '), fun.neg(fun.or(nlp.is_stopword, nlp.is_usedword)));
    },
}

// entity
// spec:
//      name, id, ontoloyg, type
// usage:
//      var anEntity = entity({ name: 'Barack Obama', 
//                              data: DATA.data[i],
//                              id: '1', 
//                              ontology: 'facebook',
//                              type: 'person' });
var entity = function (spec){
    var that = {};
    that.get_name = function () {
        return typeof spec.name !== 'undefined' ? ' <a href="http://en.wikipedia.org/wiki/' + spec.name + '" class="name" target="_blank">' + spec.name + '</a>' : '';
    };
    that.get_id = function () {
        return spec.id;
    };
    that.get_data = function () {
        return spec.data;
    };
    that.get_category = function () {
        return typeof spec.category !== 'undefined' ? ' <span class="category">' + spec.category + '</span>' : '';
    };
    that.get_picture = function () {
        if ( typeof spec.picture === 'undefined' && typeof spec.icon === 'undefined' ) {
            return '';
        } else {
            return '<img src="' + spec.picture + '" class="img" />';
        }
    };
    that.get_ontology = function () {
        return spec.ontology || facebook;
    };
    that.get_type = function  () {
        return spec.type || 'entity';
    };
    that.get_classes = function () {
        var fallback = ['entity', that.get_ontology(), that.get_type()];
        return spec.classes || fallback;
    };
    that.classes_string = function () {
        // [a, b, c] -> 'a b c';
        return fun.join(this.get_classes(), ' '); 
    };
    that.get_attributes = function () {
        var result = '',
            attributes = spec;
        result = _.reduce(_.map(attributes, function (val, key, list) {
            if (typeof val !== 'undefined' && val.length > 0) {
                result = String(key) + '="' + fun.join(val, ' ') + '" ';
            }
            return result
        }), function (a,b) {
            return a + b;
        });
        return result;
    };
    that.tag = function (tag) {
        var open = '<' + tag + ' '
            + 'class="' + that.classes_string()  + '" '
            + that.get_attributes() 
            + '>'
        // default show name in tag:
        var body =  that.get_picture()
                    + that.get_name()
                    + that.get_category();
        var close = '</' + tag + '>';
        return open + body + close;
    };
    return that;
};


// menu
// spec:
//      * required
//      *id, data, tag (outside tag), inside (inside tag)
//  example:
//      var select = menu({ id: 'sel',
//                          title: 'selection',
//                          data: DATA.data,
//                          tag: 'ol',
//                          inside: 'li' })

var menu = function (spec) {
    var that = {};
    that.title_post = '-title';
    that.jQ = $('#' + spec.id);
    that.title = $("#" + spec.id + that.title_post);
    that.active = true;
    that.entities = [];
    that.has_entities = function () {
        return that.entities.length ? true : false;
    };
    that.get_entities = function () {
        if ( that.has_entities() ) {
            return that.entities;
        } else if (spec.data) {
            that.entities = _.map(spec.data, function (d) {
                return entity({ id: d.id, 
                                name: d.name,
                                ontology: 'facebook',
                                data: d,
                                link: d.link,
                                category: d.category,
                                picture: d.picture,
                                icon: d.icon,
                                type: spec.type });
            });
            return that.entities;
        } else {
            return [];
        }
    };
    that.get_entities(); // populate entities list
    that.get_entity = function (index) {
        return that.get_entities()[index];
    };
    that.get_id = function () {
        return spec.id;
    };
    that.get_jQ = function () {
        return $('#' + spec.id);
    };
    that.get_title_jQ = function () {
        return $('#' + spec.id + that.title_post);
    };
    that.update = function (data) {
        spec.data = data;
        spec.type = data.type || 'entity';
        that.entities = []; // trigger update of entities
        that.get_entities(); // update entities list
    };
    that.remove = function () {
        that.get_jQ().remove();
        that.get_title_jQ().remove()
    };
    that.update_pos = function () {
         var left = $(".ace_cursor").offset().left,
             top = $(".ace_cursor").offset().top;
         $("#res").css('left', left);
         $("#res").css('top', top);
    };
    that.refresh = function () {
        that.get_jQ().html();
        that.get_jQ().html(that.toHTML(true))
    };
    that.is_active = function () {
        return that.active;
    }
    that.show = function () {
        that.active = true;
        that.get_title_jQ().show();
        that.get_jQ().show();
    }
    that.hide = function () {
        that.active = false;
        that.get_title_jQ().hide();
        that.get_jQ().hide();
    }
    that.toHTML = function (no_outer) {
        var no_outer = typeof no_outer === 'undefined' ? true : false;
        var tag = spec.tag || 'ol';
//        var title = spec.title || 'menu';
//        var result = '<p id="' + spec.id + that.title_post + '">' + title + '</p>';
        var result = ''
        if (no_outer) {
            result = '<' + tag + ' id="' + spec.id + '">'; 
        }
        if (that.has_entities()) {
            result += _.reduce(_.map(that.get_entities(), function(e) {
                return e.tag(spec.inside || 'li');
            }), function (a, b) {
                return a + b;
            });
        }
        if (no_outer)  {
            result += '</' + tag + '>';
        }
        return result;
    }
    return that;
};

$(window).load(function () {
    var GLOBALS = {
        'editor': editor,
        'hostname': 'http://www.baybo.it:1337',
        'isoffline': false,
        'pipe': 'http://www.baybo.it:1337/pipe?p=',
        'api': 'https://graph.facebook.com/',
        'namesearch': 'http://en.wikipedia.org/wiki/', 
        'type': 'page',
    }
    var main = function () {
        var m = {
            DATA: DATA,
            pipe: GLOBALS.hostname + "/pipe?p=",
            api: "https://graph.facebook.com/",
            rich: function () {
                return m.pipe + m.api;
            },
            search: function (type) { 
                var url = "https://graph.facebook.com/search?type=" + type;
                if (type === 'page') {
                    url += '&fields=id,name,picture,category,link,website,username,birthday';
                }
                else if ( type === 'group' ) {
                    url += '&fields=id,name,description,icon,link';
                }
                url += '&q=';
                return url;
            },
            el: $("#disamb"),
            res: menu({ id: 'res', title: 'results', type: GLOBALS.type }),
            sel: menu({ id: 'sel', title: 'selection', type: GLOBALS.type }),
            inp: $("#inp"),
            www: function () {
                if (window.location.origin !== GLOBALS.hostname) {
                    window.location.href = GLOBALS.hostname;
                };
            },
            doSearch: function (pipe, api, query, menuEl) {
                var url = pipe + escape(api + query);
                if ( query.length === 0 || query.trim() === '') { 
                    return false;
                }
                jQuery.get(url, function (data) {
                    result = jQuery.parseJSON(data).data.slice(0,10); // first 10
                    if (GLOBALS.isoffline) {
                        result = DATA.data;
                    }
                    else {
                        DATA.data = result;
                    }
                    // if results, then update
                    if (result.length > 0) {
                        result.type = GLOBALS.type;
                        menuEl.update(result);
                        menuEl.refresh();
                        m.res.show();
                    }
                });
            },
            process_key: function (e, menuEl) {
                m.res.update_pos();
                if ( GLOBALS.editor.getSession().getValue().trim() === '' ) {
                    m.res.hide();
                    nlp.reset_used(); // clears used words
                }
                // this is bound to an input element #inp
                var NUMKEYS = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
                    spacebar = 32,
                    esc = 27,
                    type = GLOBALS.type,
                    url = m.search(type),
                    result = [],
                    getEntity,
                    doSelect,
                    d;
                doSelect = function (number) {
                    number = number > 0 ? number : DATA.data.length - 1;
                    // nullify all current words
                    nlp.nullify_corpus(GLOBALS.editor.getSession().getValue());
                    result.type = GLOBALS.type;
                    m.res.hide();
                    $("#sel").append(m.res.get_entity(number - 1).tag('li'));
                    m.sel.show();
                    m.res.update([]);
                    m.res.refresh();
                }
                if (e.keyCode === spacebar) {
                    var query = nlp.clean_stopwords(GLOBALS.editor.getSession().getValue()).join(' ');
                    m.doSearch(m.pipe, m.search('page'), query, m.res);
                }
                if (e.keyCode === esc) {
                    nlp.nullify_corpus(GLOBALS.editor.getSession().getValue());
                    m.res.hide();
                }
                if (_.indexOf(NUMKEYS, e.keyCode) !== -1) {
                    if ( m.res.is_active() ) {
                        var result = parseInt(String.fromCharCode(e.keyCode));
                        doSelect(result);
                        return false;
                    }
                }
             },
            render: function () {
                m.www()
                m.el.append(this.sel.toHTML());
                m.el.append(this.res.toHTML());
                m.res.hide();
                m.sel.hide();
                m.inp.keydown(this.process_key);
                $("#editor").keydown(this.process_key);
                var query = nlp.clean_stopwords(GLOBALS.editor.getSession().getValue()).join(' ');
                m.doSearch(m.pipe, m.search('page'), query, m.res);
            }
        };
        m.render();
    };
    main();
});
