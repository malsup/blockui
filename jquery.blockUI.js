/*
blockUI plugin for jquery
http://github.com/RobinHerbots/blockui
Copyright (c) 2010 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.7

This plugin is based on the blockUI plugin (v2.33) written by Mike Alsup (http://malsup.com/jquery/block/)
*/

(function($) {

    if (/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery) || /^1.1/.test($.fn.jquery)) {
        alert('blockUI requires jQuery v1.2.3 or later!  You are using v' + $.fn.jquery);
        return;
    }

    $.fn._fadeIn = $.fn.fadeIn;

    var noOp = function() { };

    // this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
    // retarded userAgent strings on Vista)
    var mode = document.documentMode || 0;
    var setExpr = $.browser.msie && (($.browser.version < 8 && !mode) || mode < 8);
    var ie6 = $.browser.msie && /MSIE 6.0/.test(navigator.userAgent) && !mode;

    // global $ methods for blocking/unblocking the entire page
    $.blockUI = function(fnParams) {
        if (typeof fnParams == "string") {

            var blockUI_fn = $.blockUI[fnParams];

            if (blockUI_fn) {
                var args = $.makeArray(arguments).slice(1);
                return blockUI_fn.apply(this, args);
            }
        } else
            $.blockUI.block(window, $.extend({}, { centerWithIframe: true, centerWithIframeHorizontal: true }, fnParams));
    };
    $.unblockUI = function(opts) { $.blockUI('unblock', window, opts); };
    // plugin method for (un)blocking element content
    $.fn.block = function(opts) { return $.blockUI('block', this, opts); };
    $.fn.unblock = function(opts) { return $.blockUI('unblock', this, opts); };

    $.extend($.blockUI, {
        version: 2.33, // 2nd generation blocking at no extra cost!

        block: function(el, options) {
            var opts = $.extend({}, $.blockUI.defaults, options);
            var $el = $(el);
            return $el.each(function() {
                if (this.style) {
                    if ($.css(this, 'position') == 'static')
                        this.style.position = 'relative';
                    if ($.browser.msie)
                        this.style.zoom = 1; // force 'hasLayout'
                }
                install(this, opts);
            });
        },
        unblock: function(el, options) {
            var opts = $.extend({}, $.blockUI.defaults, options);
            var $el = $(el);
            return $el.each(function() {
                remove(this, opts);
            });
        },
        // override these in your code to change the default behavior and style
        defaults: {
            // message displayed when blocking (use null for no message)
            message: '<h3>Please wait...</h3>',

            title: null,   // title string; only used when theme == true
            draggable: true,  // only used when theme == true (requires jquery-ui.js to be loaded)

            theme: false, // set to true to use with jQuery UI themes

            // styles for the message when blocking; if you wish to disable
            // these and use an external stylesheet then do this in your code:
            // $.blockUI.defaults.css = {};
            css: {
                'min-width': '30%',
                'max-width': '96%',
                padding: 0,
                margin: 0,
                top: '40%',
                left: '35%',
                textAlign: 'center',
                color: '#000',
                border: '3px solid #aaa',
                backgroundColor: '#fff',
                cursor: 'wait'
            },

            // minimal style set used when themes are used
            themedCSS: {
                'min-width': '30%',
                'max-width': '96%',
                top: '40%',
                left: '35%'
            },

            // minimal style set for the message content
            msgContentCSS: {},

            // styles for the overlay
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.6,
                filter: 'alpha (opacity = 60)',
                cursor: 'wait'
            },
            // IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
            // (hat tip to Jorge H. N. de Vasconcelos)
            iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

            // force usage of iframe in non-IE browsers (handy for blocking applets)
            forceIframe: false,

            // z-index for the blocking overlay
            baseZ: 1000,

            // set these to true to have the message automatically centered
            centerX: true, // <-- only effects element blocking (page block controlled via css above)
            centerY: true,
            centerWithIframe: false, //boolean, take iframe into account for centering the messageBlock
            centerWithIframeHorizontal: false,

            // allow body element to be stetched in ie6; this makes blocking look better
            // on "short" pages.  disable if you wish to prevent changes to the body height
            allowBodyStretch: true,

            // enable if you want key and mouse events to be disabled for content that is blocked
            bindEvents: true,

            // be default blockUI will supress tab navigation from leaving blocking content
            // (if bindEvents is true)
            constrainTabKey: true,

            // fadeIn time in millis; set to 0 to disable fadeIn on block
            fadeIn: 200,
            // fadeOut time in millis; set to 0 to disable fadeOut on unblock
            fadeOut: 400,
            slideDown: false, //slide instead of fade

            // time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
            timeout: 0,

            // disable if you don't want to show the overlay
            showOverlay: true,

            // if true, focus will be placed in the first available input field when
            // page blocking
            focusInput: true,

            // callback method invoked when fadeIn has completed and blocking message is visible
            onBlock: null,

            // callback method invoked when unblocking has completed; the callback is
            // passed the element that has been unblocked (which is the window object for page
            // blocks) and the options that were passed to the unblock call:
            //	 onUnblock(element, options)
            onUnblock: null,

            // don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
            quirksmodeOffsetHack: 4,

            closeOnEscape: false,
            closeOnClick: false,
            keyCode: { ALT: 18, BACKSPACE: 8, CAPS_LOCK: 20, COMMA: 188, COMMAND: 91, COMMAND_LEFT: 91, COMMAND_RIGHT: 93, CONTROL: 17, DELETE: 46, DOWN: 40, END: 35, ENTER: 13, ESCAPE: 27, HOME: 36, INSERT: 45, LEFT: 37, MENU: 93, NUMPAD_ADD: 107, NUMPAD_DECIMAL: 110, NUMPAD_DIVIDE: 111, NUMPAD_ENTER: 108,
                NUMPAD_MULTIPLY: 106, NUMPAD_SUBTRACT: 109, PAGE_DOWN: 34, PAGE_UP: 33, PERIOD: 190, RIGHT: 39, SHIFT: 16, SPACE: 32, TAB: 9, UP: 38, WINDOWS: 91
            },
            buttons: {}, // ex: buttons: { Ok: function() { $.unblockUI(); } }
            pageElement: 'body', // set to 'form' for this to work with all cases of ASP.NET WebForms
            blockMsgClass: 'blockMsg', // class name of the message block
            buttonClass: 'button', // class name of the buttons
            unblockPreviousOnblock: true
        },

        //blockUI building blocks
        iframe: function(zindex, options) {
            var opts = $.extend({}, $.blockUI.defaults, options);

            return ($.browser.msie || opts.forceIframe)
		        ? $('<iframe class="blockUI" style="z-index:' + zindex + ';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="' + opts.iframeSrc + '"></iframe>')
		        : $('<div class="blockUI" style="display:none"></div>');
        },
        overlay: function(zindex, options) {
            var opts = $.extend({}, $.blockUI.defaults, options);

            return $('<div class="blockUI blockOverlay" style="z-index:' + zindex + ';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');
        },
        _messageBlock: function(zindex, options) { //this function is used to hook into the messageBlock generation when creating an extention for the messageBlock
            return this.messageBlock(zindex, options);
        },
        messageBlock: function(zindex, options) {
            var opts = $.extend({}, $.blockUI.defaults, options);

            var message;
            if (opts.theme && opts.full) {
                message = '<div class="blockUI ' + options.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:' + zindex + ';display:none;position:fixed">' +
				'<div class="ui-widget-header ui-dialog-titlebar blockTitle ui-corner-top">' + (opts.title || '&nbsp;') + '</div>' +
				'<div class="ui-widget-content ui-dialog-content"></div>' +
			'</div>';
            }
            else if (opts.theme) {
                message = '<div class="blockUI ' + options.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:' + zindex + ';display:none;position:absolute">' +
				'<div class="ui-widget-header ui-dialog-titlebar blockTitle ui-corner-top">' + (opts.title || '&nbsp;') + '</div>' +
				'<div class="ui-widget-content ui-dialog-content"></div>' +
			'</div>';
            }
            else if (opts.full) {
                message = '<div class="blockUI ' + options.blockMsgClass + ' blockPage msgContent" style="z-index:' + zindex + ';display:none;position:fixed"></div>';
            }
            else {
                message = '<div class="blockUI ' + options.blockMsgClass + ' blockElement msgContent" style="z-index:' + zindex + ';display:none;position:absolute"></div>';
            }

            var messageblock = $(message);
            // if we have a message, style it
            if (opts.message) {
                if (opts.theme) {
                    messageblock.css(opts.themedCSS);
                    messageblock.addClass('ui-widget-content');
                }
                else
                    messageblock.css(opts.css);

                messageblock.find('.ui-widget-content').css(opts.msgContentCSS);

                // show the message
                if (opts.theme)
                    messageblock.find('.ui-widget-content').append(opts.message);
                else {
                    var msgTarget = messageblock.find('.msgContent');
                    if (msgTarget.length > 0)
                        msgTarget.append(opts.message);
                    else messageblock.append(opts.message);
                }
                if (opts.message.jquery || opts.message.nodeType)
                    $(opts.message).show();
            }

            return messageblock;
        }
    });

    // private data and functions follow...

    var pageBlock = null;
    var pageBlockEls = [];

    function install(el, opts) {
        var self = this;

        var full = el ? (el == el.window) : false;
        var msg = opts && opts.message !== undefined ? opts.message : undefined;
        opts = $.extend({}, $.blockUI.defaults, opts || {});
        opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
        opts.css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
        opts.themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
        msg = msg === undefined ? opts.message : msg;

        //save the onUnblock callback in the elements data tobe reused when call unblock from another call
        $(el).data('onUnblock', opts.onUnblock);

        // remove the current block (if there is one)
        if (opts.unblockPreviousOnblock)
            remove(window, { fadeOut: 0 });

        // if an existing element is being used as the blocking content then we capture
        // its current place in the DOM (and current display style) so we can restore
        // it when we unblock
        if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
            var node = msg.jquery ? msg[0] : msg;
            var data = {};
            $(el).data('blockUI.history', data);
            data.el = node;
            data.parent = node.parentNode;
            data.display = node.style.display;
            data.position = node.style.position;
            if (data.parent)
                data.parent.removeChild(node);
        }

        var z = opts.baseZ;

        // blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
        // layer1 is the iframe layer which is used to supress bleed through of underlying content
        // layer2 is the overlay layer which has opacity and a wait cursor (by default)
        // layer3 is the message content that is displayed while blocking

        var lyr1 = $.blockUI.iframe(z++, opts);
        var lyr2 = $.blockUI.overlay(z++, opts);
        opts = $.extend({}, opts, { full: full });
        var lyr3 = $.blockUI._messageBlock(z + 10, opts);

        //create buttons
        if (opts.buttons) {
            createButtons(lyr3, opts.buttons, opts);
        }

        // style the overlay
        lyr2.css(opts.overlayCSS);
        lyr2.css('position', full ? 'fixed' : 'absolute');

        // make iframe layer transparent in IE
        if ($.browser.msie || opts.forceIframe)
            lyr1.css('opacity', 0.0);

        //$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? opts.pageElement : el);
        var layers = [lyr1, lyr2, lyr3], $par = full ? $(opts.pageElement, el.document) : $(el);
        $.each(layers, function() {
            this.appendTo($par);
        });

        if (opts.theme && opts.draggable && $.fn.draggable) {
            lyr3.draggable({
                handle: '.ui-dialog-titlebar',
                cancel: 'li'
            });
        }

        // ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
        var expr = setExpr && (!$.boxModel || $('object,embed', full ? null : el).length > 0);
        if (ie6 || expr) {
            // give body 100% height
            if (full && opts.allowBodyStretch && $.boxModel)
                $('html,body').css('height', '100%');

            // fix ie6 issue when blocked element has a border width
            if ((ie6 || !$.boxModel) && !full) {
                var t = sz(el, 'borderTopWidth'), l = sz(el, 'borderLeftWidth');
                var fixT = t ? '(0 - ' + t + ')' : 0;
                var fixL = l ? '(0 - ' + l + ')' : 0;
            }

            // simulate fixed position
            $.each([lyr1, lyr2, lyr3], function(i, o) {
                var s = o[0].style;
                s.position = 'absolute';
                if (i < 2) {
                    full ? s.setExpression('height', 'Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.boxModel?0:' + opts.quirksmodeOffsetHack + ') + "px"')
					 : s.setExpression('height', 'this.parentNode.offsetHeight + "px"');
                    full ? s.setExpression('width', 'jQuery.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"')
					 : s.setExpression('width', 'this.parentNode.offsetWidth + "px"');
                    if (fixL) s.setExpression('left', fixL);
                    if (fixT) s.setExpression('top', fixT);
                }
                else if (opts.centerY) {
                    if (full) s.setExpression('top', '(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
                    s.marginTop = 0;
                }
                else if (!opts.centerY && full) {
                    var top = (opts.css && opts.css.top) ? parseInt(opts.css.top) : 0;
                    var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + ' + top + ') + "px"';
                    s.setExpression('top', expression);
                }
            });
        }



        if (($.browser.msie || opts.forceIframe) && opts.showOverlay)
            lyr1.show(); // opacity is zero

        //make sure the parent is bigger then the messageblock, fixes issue that some parts of the messageblock are inaccessable
        var lyr3Height = lyr3.outerHeight(true), parHeight = $par.height();
        if (full && lyr3Height > (parHeight - $(window.parent.top).scrollTop())) {
            var addHeight = lyr3Height - (parHeight - $(window.parent.top).scrollTop()) + 10;
            $("<p></p>").addClass('blockUI').css({ 'height': addHeight + 'px' }).appendTo($par);
            center(lyr3[0], { inside: el, withScrolling: false, horizontal: opts.centerX, vertical: opts.centerY, iframe: opts.centerWithIframe, iframeHorizontal: opts.centerWithIframeHorizontal });
        } else
            center(lyr3[0], { inside: el, horizontal: opts.centerX, vertical: opts.centerY, iframe: opts.centerWithIframe, iframeHorizontal: opts.centerWithIframeHorizontal });

        //save fadeOut for use on unblock
        $(el).data('blockUI.fadeOut', opts.fadeOut);
        //save slideDown for use on unblock
        $(el).data('blockUI.slideDown', opts.slideDown);

        if (opts.slideDown) {
            var cb = opts.onBlock ? opts.onBlock : noOp;
            var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
            var cb2 = msg ? cb : noOp;
            if (opts.showOverlay)
                lyr2._fadeIn(opts.fadeIn, cb1);
            if (msg) {
                var lyr3Top = lyr3.css('top');
                lyr3.css('top', -lyr3.outerHeight());
                lyr3.show().animate({ top: lyr3Top }, opts.fadeIn, cb2);
            }
        }
        else if (opts.fadeIn) {
            var cb = opts.onBlock ? opts.onBlock : noOp;
            var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
            var cb2 = msg ? cb : noOp;
            if (opts.showOverlay) {
                if (!($.browser.mozilla && /Linux/.test(navigator.platform))) {
                    lyr2._fadeIn(opts.fadeIn, cb1);
                } else {
                    lyr2.show();
                }
            }
            if (msg)
                lyr3._fadeIn(opts.fadeIn, cb2);
        }
        else {
            if (opts.showOverlay)
                lyr2.show();
            if (msg)
                lyr3.show();
            if (opts.onBlock)
                opts.onBlock();
        }

        // bind key and mouse events
        bind(1, el, opts);

        if (full) {
            pageBlock = lyr3[0];
            pageBlockEls = $(':input:enabled:visible', pageBlock);
            if (opts.focusInput)
                setTimeout(focus, 20);
        }


        if (opts.timeout) {
            // auto-unblock
            var to = setTimeout(function() {
                full ? $.unblockUI(opts) : $(el).unblock(opts);
            }, opts.timeout);
            $(el).data('blockUI.timeout', to);
        }

        //append space to parent when the messageblock changes in size
        //used specifically when the site runs inside an iframe and we need to notify the parent iframe to resize
        //we can watch the content size and call the parent to resize
        //dependency to resize plugin - http://benalman.com/projects/jquery-resize-plugin/ when centerWithIframe true
        if (opts.centerWithIframe) {
            $(lyr3).resize(function() {
                var lyr3Height = lyr3.outerHeight(true), parHeight = $par.height();
                if (full && lyr3Height > (parHeight - $(window.parent.top).scrollTop())) {
                    var addHeight = lyr3Height - (parHeight - $(window.parent.top).scrollTop()) + 10;
                    $("<p></p>").addClass('blockUI').css({ 'height': addHeight + 'px' }).appendTo($par);
                    center(lyr3[0], { inside: el, withScrolling: false, horizontal: opts.centerX, vertical: opts.centerY, iframe: opts.centerWithIframe, iframeHorizontal: opts.centerWithIframeHorizontal });
                }
            });
        }
    };


    function createButtons(el, buttons, options) {
        var hasButtons = false,
            buttonPane = $('<div></div>');

        if (options.theme) {
            buttonPane.addClass('ui-dialog-buttonpane ui-widget-content ui-helper-clearfix');
            // if we already have a button pane, remove it
            el.find('.ui-dialog-buttonpane').remove();
        }

        if (typeof buttons === 'object' && buttons !== null) {
            $.each(buttons, function() {
                return !(hasButtons = true);
            });
        }
        if (hasButtons) {
            $.each(buttons, function(name, fn) {
                var button = $('<button type="button"></button>').text(name).click(function() { fn.apply(el[0], arguments); }).appendTo(buttonPane);
                button.addClass(options.buttonClass).css('float', 'right');
                if ($.fn.button) {
                    button.button();
                }
                if (!options.theme) {
                    button.css('margin', '3px').css('padding', '1px 3px');
                }
            });
            buttonPane.appendTo(el);
        }
    };

    // remove the block
    function remove(el, opts) {
        var full = el ? (el == el.window) : false;
        var $el = $(el);
        //restore the onUnblock callback from the element data
        if (opts.onUnblock == null) {
            opts.onUnblock = $(el).data('onUnblock');
            $(el).data('onUnblock', null);
        }

        var data = $el.data('blockUI.history');
        var to = $el.data('blockUI.timeout');
        if (to) {
            clearTimeout(to);
            $el.removeData('blockUI.timeout');
        }
        opts = $.extend({}, $.blockUI.defaults, opts || {});
        bind(0, el, opts); // unbind events

        var els;
        if (full) // crazy selector to handle odd field errors in ie6/7
            els = $(opts.pageElement, el.document).children().filter('.blockUI').add(opts.pageElement + ' > .blockUI', el.document);
        else
            els = $('.blockUI', el);

        if (full)
            pageBlock = pageBlockEls = null;

        //restore fadeOut value
        var fadeOut = $(el).data('blockUI.fadeOut');
        opts.fadeOut = fadeOut ? fadeOut : opts.fadeOut;
        //restore slideDown value
        var slideDown = $(el).data('blockUI.slideDown');
        opts.slideDown = slideDown ? slideDown : opts.slideDown;

        if (opts.slideDown) {
            var lyr3 = els.filter('.blockPage, .blockElement');
            lyr3.animate({ top: -lyr3.outerHeight() }, opts.fadeOut);
            var els = els.not(lyr3);
            els.fadeOut(opts.fadeOut);
            setTimeout(function() { reset(els.add(lyr3), data, opts, el); }, opts.fadeOut);
        }
        else if (opts.fadeOut) {
            els.fadeOut(opts.fadeOut);
            setTimeout(function() { reset(els, data, opts, el); }, opts.fadeOut);
        }
        else
            reset(els, data, opts, el);
    };

    // move blocking element back into the DOM where it started
    function reset(els, data, opts, el) {
        els.each(function(i, o) {
            // remove via DOM calls so we don't lose event handlers
            if (this.parentNode)
                this.parentNode.removeChild(this);
        });

        if (data && data.el) {
            data.el.style.display = data.display;
            data.el.style.position = data.position;
            if (data.parent)
                data.parent.appendChild(data.el);
            $(el).removeData('blockUI.history');
        }

        if (typeof opts.onUnblock == 'function')
            opts.onUnblock(el, opts);
    };

    // bind/unbind the handler
    function bind(b, el, opts) {
        var full = el ? (el == el.window) : false, $el = $(el);

        // don't bother unbinding if there is nothing to unbind
        if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
            return;
        if (!full)
            $el.data('blockUI.isBlocked', b);

        // don't bind events when overlay is not in use or if bindEvents is false
        if (!opts.bindEvents || (b && !opts.showOverlay))
            return;

        // bind anchors and inputs for mouse and key events
        var events = 'mousedown mouseup keydown keypress';
        b ? $(el.document).bind(events, opts, handler) : $(el.document).unbind(events, handler);

        // former impl...
        //	   var $e = $('a,:input');
        //	   b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
    };

    // event handler to suppress keyboard/mouse events when blocking
    function handler(e) {
        // allow tab navigation (conditionally)
        if (e.keyCode) {
            if (e.keyCode == e.data.keyCode.TAB) {
                if (pageBlock && e.data.constrainTabKey) {
                    var els = pageBlockEls;
                    var fwd = !e.shiftKey && e.target == els[els.length - 1];
                    var back = e.shiftKey && e.target == els[0];
                    if (fwd || back) {
                        setTimeout(function() { focus(back) }, 10);
                        return false;
                    }
                }
            } else if (e.keyCode == e.data.keyCode.ESCAPE) {
                if (e.data.closeOnEscape) {
                    remove(GetOwnerWindow(e.target), e.data);
                }
            }
        } else if (e.button >= 0) {
            if (e.data.closeOnClick) {
                remove(GetOwnerWindow(e.target), e.data);
            }
        }
        // allow events within the message content
        var options = e.data;
        if ($(e.target).parents('div.' + options.blockMsgClass).length > 0)
            return true;

        // allow events for content that is not being blocked
        return $(e.target).parents().children().filter('div.blockUI').length == 0;
    };

    function focus(back) {
        if (!pageBlockEls)
            return;
        var e = pageBlockEls[back === true ? pageBlockEls.length - 1 : 0];
        if (e)
            e.focus();
    };

    function center(el, options) {
        var options = $.extend({ // Default values
            inside: window, // element, vertical center into
            transition: 0, // millisecond, transition time
            minX: 0, // pixel, minimum left element value
            minY: 0, // pixel, minimum top element value
            vertical: true, // boolean, center vertical
            withScrolling: true, // boolean, take care of element inside scrollTop when minX < 0 and window is small or when window is big
            horizontal: true, // boolean, center horizontal
            iframe: true, //center screen also from within an iframe
            iframeHorizontal: false //true => center in the iframe
        }, options);
        var props = { position: 'absolute' };
        var iframeXOffset = 0, iframeYOffset = 0, insideX = options.inside, $el = $(el);

        if (options.iframe && options.withScrolling) {
            if (window.parent && window.parent.document) {
                options.inside = window.parent.top;
                var iframes = $('iframe', options.inside.document);
                var i = iframes.length;
                while (i--) {
                    if (iframes[i].contentDocument) {
                        doc = iframes[i].contentDocument;
                    } else {
                        doc = iframes[i].contentWindow.document;
                    }
                    if (doc === document) {
                        //located our iframe!
                        iframeXOffset = $(iframes[i]).offset().left;
                        iframeYOffset = $(iframes[i]).offset().top;
                        break;
                    }
                };

                if (options.iframeHorizontal == false)
                    insideX = options.inside;
                else iframeXOffset = 0;
            }
        }
        var top = $el.offset().top;
        if (options.vertical) {
            top = (($(options.inside).height() - $el.outerHeight()) / 2) - iframeYOffset;
            if (options.withScrolling) top += $(options.inside).scrollTop() - iframeYOffset || 0;
        }
        top = (top > options.minY ? top : options.minY);
        $.extend(props, { top: top + 'px' });

        var left = $el.offset().left;
        if (options.horizontal) {
            left = (($(insideX).width() - $el.outerWidth()) / 2) - iframeXOffset;
            if (options.withScrolling) left += $(insideX).scrollLeft() || 0;
        }
        left = (left > options.minX ? left : options.minX);
        $.extend(props, { left: left + 'px' });

        if (options.transition > 0) $el.animate(props, options.transition);
        else $el.css(props);

    };

    function sz(el, p) {
        return parseInt($.css(el, p)) || 0;
    };

    function GetOwnerWindow(html_node) {
        /*
        ownerDocument is cross-browser, 
        but defaultView works on all browsers except Opera/IE that use parentWinow
        */
        return html_node.ownerDocument.defaultView || html_node.ownerDocument.parentWindow;
    }
})(jQuery);