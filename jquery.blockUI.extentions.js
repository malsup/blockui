/*
blockUI plugin extentions for jquery
http://github.com/RobinHerbots/blockui
Copyright (c) 2010 Robin Herbots
Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
Version: 0.0.2
*/

(function($) {

    // convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
    $.growlUI = function(title, message, timeout, onClose) {
        $.blockUI({
            message: message,
            title: title,
            timeout: timeout,
            onUnblock: onClose,
            messageBlockType: 'growl'
        });
    };


    //optional extentions on blockUI
    $.extend($.blockUI, {
        defaults: $.extend({}, {
            messageBlockType: 'default', //specify the type of the messageBlock. default or exception or growl or dialog (for the moment)
            source: null,
            exceptionId: null
        }, $.blockUI.defaults),

        _messageBlock: function(zindex, options) {
            switch (options.messageBlockType.toLowerCase()) {
                case 'exception':
                    $.extend(options, {
                        message: "<br/>" + options.message + "<br/><br/>",
                        buttons: { Ok: function() { $.unblockUI(); } },
                        theme: true,
                        themedCSS: {
                            overflow: 'auto',
                            width: 'auto'
                        },
                        msgContentCSS: {
                            overflow: 'hidden' //hide the unneeded scrollbars in ie7
                        },
                        closeOnEscape: true
                    });

                    var exceptionMessage = this.messageBlock(zindex, options);

                    if (options.exceptionId) {
                        exceptionMessage.append("<a href='" + resGlobal.ExceptiondetailUrl + options.exceptionId + "' target='_blank'>Details</a> ");
                    }

                    return exceptionMessage;
                    break;
                case 'growl':
                    var $m = $('<div class="growlUI"></div>');
                    if (options.title) $m.append('<h1>' + options.title + '</h1>');
                    if (options.message) $m.append('<h2>' + options.message + '</h2>');
                    if (!options.timeout || options.timeout == 0) options.timeout = 3000;
                    $.extend(options, {
                        message: $m,
                        title: null,
                        fadeIn: 700,
                        fadeOut: 1000,
                        centerX: false,
                        centerY: false,
                        timeout: options.timeout,
                        showOverlay: false,
                        css: {
                            width: '350px',
                            top: '10px',
                            left: '',
                            right: '10px',
                            border: 'none',
                            padding: '5px',
                            opacity: 0.6,
                            cursor: 'default',
                            color: '#fff',
                            backgroundColor: '#000',
                            '-webkit-border-radius': '10px',
                            '-moz-border-radius': '10px',
                            'border-radius': '10px'
                        }
                    });
                    return this.messageBlock(zindex, options);
                    break;
                case 'dialog':
                    $.extend(options, {
                        themedCSS: {
                            overflow: 'auto',
                            width: 'auto'
                        },
                        msgContentCSS: {
                            overflow: 'hidden' //hide the unneeded scrollbars in ie7
                        },
                        theme: true,
                        fadeIn: 1000,
                        fadeOut: 1000,
                        slideDown: true
                    });

                    return this.messageBlock(zindex, options);
                    break;
                default:
                    return this.messageBlock(zindex, options);
                    break;
            }
        }
    });
})(jQuery);